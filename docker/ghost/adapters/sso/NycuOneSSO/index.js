'use strict';
/**
 * Ghost SSO adapter: NYCU One (auth.nycu.one) sign-in for Ghost Admin.
 *
 * Ghost is served at https://nycu.life/cms behind a Traefik forwardAuth gate
 * (wish-api `/api/wishes/auth/gate`, the Wish Pool admin OIDC sign-in). For a
 * signed-in visitor the gate answers with `X-Nycu-Cms-Identity`, a short-lived
 * token signed with the shared `NYCU_CMS_SSO_SECRET`; Traefik copies it onto
 * the request it forwards to Ghost (replacing any client-supplied value).
 *
 * This adapter verifies that token and signs the visitor in as the Ghost staff
 * account with the same email as the NYCU One identity. On the first sign-in
 * without an account it creates one as a Contributor (drafts only), which an
 * Administrator can later promote; the Ghost role remains authoritative and a
 * suspended account stays suspended. `NYCU_CMS_SSO_PROVISION_ROLE` picks the
 * role for new accounts (`Contributor` or `Author`) or turns this off (`none`).
 * Who may reach the Admin at all is decided by the gate (the NYCU One app).
 * `NYCU_CMS_SSO_STAFF_EMAIL` is retained only as a short-lived migration
 * fallback for tokens minted by an older wish-api image that do not include an
 * email. Without an identity email (or that fallback) it does nothing.
 *
 * Token: `v1.<base64url(JSON {sub, name, email, iat, exp})>.<base64url(HMAC-SHA256)>`,
 * the MAC covering `v1.<payload>` (api/internal/wishes/cmssso.go).
 *
 * Activate with `adapters__sso__active=NycuOneSSO` and either install this
 * directory as `content/adapters/sso/NycuOneSSO/` or point
 * `paths__installedAdaptersPath` at a directory containing `sso/NycuOneSSO/`.
 */
const crypto = require('node:crypto');
const path = require('node:path');

const HEADER = 'x-nycu-cms-identity';
const MAX_LIFETIME_S = 10 * 60;
const CLOCK_SKEW_S = 60;
// Ghost staff statuses that may sign in (`warn-*` are active users nearing a lockout).
const ACTIVE_STATUSES = new Set(['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Roles a new account may get automatically; anything stronger is granted by hand.
const PROVISION_ROLES = new Set(['Contributor', 'Author']);
const GHOST_ROOTS = () => [
	process.cwd(),
	path.join(process.cwd(), 'current'),
	'/var/lib/ghost/current'
];

function provisionRole() {
	const raw = (process.env.NYCU_CMS_SSO_PROVISION_ROLE ?? 'Contributor').trim();
	if (/^(none|off|false|0)$/i.test(raw)) return null;
	const role = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
	if (PROVISION_ROLES.has(role)) return role;
	console.warn(`[NycuOneSSO] ignoring NYCU_CMS_SSO_PROVISION_ROLE=${raw}; using Contributor`);
	return 'Contributor';
}

/**
 * Create a staff account through Ghost's own User model (the SSO base class only
 * offers lookups). The password is random and never shown: these accounts sign
 * in through NYCU One.
 */
async function createGhostStaff({ email, name, role }) {
	let models;
	for (const root of GHOST_ROOTS()) {
		try {
			models = require(path.join(root, 'core/server/models'));
			break;
		} catch {
			// try the next root
		}
	}
	if (!models?.User) throw new Error('Cannot load Ghost models');
	const user = await models.User.add(
		{
			email,
			name,
			password: crypto.randomBytes(32).toString('base64url'),
			status: 'active',
			roles: [role]
		},
		{ context: { internal: true } }
	);
	return { id: user.id, email: user.get('email'), status: user.get('status') };
}

/** The base class from Ghost's own install: the adapter lives outside Ghost's node_modules. */
function loadSSOBase() {
	const roots = [process.cwd(), path.join(process.cwd(), 'current'), '/var/lib/ghost/current'];
	for (const root of roots) {
		try {
			return require(require.resolve('@tryghost/adapter-base-sso', { paths: [root] })).SSOBase;
		} catch {
			// try the next root
		}
	}
	if (process.env.NODE_ENV !== 'test') throw new Error('Cannot load Ghost SSOBase');
	// Outside Ghost (unit tests): a stand-in with the same helper surface.
	return class SSOBase {
		setUserRepository(repository) {
			this.repository = repository;
		}
		async getUserByEmail(email) {
			return this.repository.getByEmail(email);
		}
	};
}

/**
 * Verify a gate token. Returns `{sub, name}` or null; never throws.
 * @param {unknown} token
 * @param {string | undefined} secret
 * @param {number} [nowMs]
 */
function verifyToken(token, secret, nowMs = Date.now()) {
	if (typeof token !== 'string' || !secret) return null;
	const parts = token.split('.');
	if (parts.length !== 3 || parts[0] !== 'v1') return null;
	const expected = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
	let given;
	try {
		given = Buffer.from(parts[2], 'base64url');
	} catch {
		return null;
	}
	if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
	let claims;
	try {
		claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
	} catch {
		return null;
	}
	const now = Math.floor(nowMs / 1000);
	const { sub, name, email, iat, exp } = claims ?? {};
	if (typeof sub !== 'string' || !sub || !Number.isInteger(iat) || !Number.isInteger(exp)) {
		return null;
	}
	if (exp <= now || iat > now + CLOCK_SKEW_S || exp <= iat || exp - iat > MAX_LIFETIME_S) {
		return null;
	}
	return {
		sub,
		name: typeof name === 'string' ? name : '',
		email: typeof email === 'string' ? email.trim().toLowerCase() : ''
	};
}

const SSOBase = loadSSOBase();

class NycuOneSSO extends SSOBase {
	/** Replaced in tests; Ghost's User model in production. */
	createStaff = createGhostStaff;

	/**
	 * Only the Admin entry page (`GET <subdir>/ghost/`, a full page load) signs in:
	 * Ghost regenerates the session on every SSO sign-in, so doing it for each
	 * asset request would churn sessions.
	 */
	async getRequestCredentials(req) {
		if (req.method !== 'GET' || (req.path !== '/' && req.path !== '')) return null;
		const token = typeof req.get === 'function' ? req.get(HEADER) : req.headers?.[HEADER];
		return token || null;
	}

	async getIdentityFromCredentials(token) {
		const identity = verifyToken(token, process.env.NYCU_CMS_SSO_SECRET);
		if (!identity) console.warn('[NycuOneSSO] rejected an invalid or expired gate token');
		return identity;
	}

	async getUserForIdentity(identity) {
		if (!identity) return null;
		const identityEmail =
			typeof identity.email === 'string' ? identity.email.trim().toLowerCase() : '';
		const legacyEmail = (process.env.NYCU_CMS_SSO_STAFF_EMAIL ?? '').trim().toLowerCase();
		const email = identityEmail || legacyEmail;
		if (!email || !EMAIL_RE.test(email)) {
			console.warn(`[NycuOneSSO] NYCU One subject ${identity.sub} has no usable email`);
			return null;
		}
		let user = await this.getUserByEmail(email);
		if (!user && identityEmail) user = await this.provision(identity, identityEmail);
		if (!user || (user.status && !ACTIVE_STATUSES.has(user.status))) {
			console.warn(`[NycuOneSSO] staff account ${email} is missing or not active`);
			return null;
		}
		console.info(`[NycuOneSSO] signed in NYCU One subject ${identity.sub} as Ghost staff ${email}`);
		return user;
	}

	/** First sign-in: create the account, or null when provisioning is off or fails. */
	async provision(identity, email) {
		const role = provisionRole();
		if (!role) return null;
		const name = (identity.name || '').trim().slice(0, 191) || email.split('@')[0];
		try {
			const user = await this.createStaff({ email, name, role });
			console.info(
				`[NycuOneSSO] created ${role} account ${email} for NYCU One subject ${identity.sub}`
			);
			return user;
		} catch (error) {
			// A parallel first sign-in may have created it a moment ago.
			const existing = await this.getUserByEmail(email).catch(() => null);
			if (existing) return existing;
			console.warn(
				`[NycuOneSSO] could not create an account for ${email}: ${error?.message ?? error}`
			);
			return null;
		}
	}
}

module.exports = NycuOneSSO;
module.exports.verifyToken = verifyToken;
