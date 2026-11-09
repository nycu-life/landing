import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac } from 'node:crypto';
import NycuOneSSO from './index.js';

const secret = 'cms-sso-secret-for-tests';
const now = 1_700_000_000;
const sign = (claims) => {
	const body = `v1.${Buffer.from(JSON.stringify(claims)).toString('base64url')}`;
	return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
};
const claims = { sub: 'editor', name: '編輯', email: 'editor@nycu.one', iat: now, exp: now + 120 };
const vector =
	'v1.eyJzdWIiOiJlZGl0b3IiLCJuYW1lIjoi57eo6LyvIiwiZW1haWwiOiJlZGl0b3JAbnljdS5vbmUiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDEyMH0.o2-7pSoemQhfBqsI4RVBM3PZcqhUBs9Fi29cNDSEN5E';

test('accepts the Go gate token and rejects forged, expired and malformed identities', () => {
	assert.equal(sign(claims), vector);
	assert.deepEqual(NycuOneSSO.verifyToken(vector, secret, now * 1000), {
		sub: 'editor',
		name: '編輯',
		email: 'editor@nycu.one'
	});
	for (const token of [
		'',
		'v2.a.b',
		`${vector}x`,
		sign({ ...claims, sub: '' }),
		sign({ ...claims, exp: now }),
		sign({ ...claims, iat: now + 61 }),
		sign({ ...claims, exp: now + 601 }),
		sign({ ...claims, exp: now - 1 }),
		sign({ ...claims, exp: now - 2, iat: now - 1 })
	]) {
		assert.equal(NycuOneSSO.verifyToken(token, secret, now * 1000), null);
	}
	assert.equal(NycuOneSSO.verifyToken(vector, 'wrong', now * 1000), null);
	assert.equal(NycuOneSSO.verifyToken(vector, '', now * 1000), null);
});

test('signs in only on full Admin entry requests and only to an active matching account', async () => {
	const adapter = new NycuOneSSO();
	const user = { id: 'staff', email: 'editor@nycu.one', status: 'active' };
	adapter.setUserRepository({
		getByEmail: async (email) => {
			assert.equal(email, 'editor@nycu.one');
			return user;
		}
	});
	assert.equal(
		await adapter.getRequestCredentials({
			method: 'GET',
			path: '/',
			headers: { 'x-nycu-cms-identity': vector }
		}),
		vector
	);
	for (const [method, path] of [
		['POST', '/'],
		['GET', '/assets/main.js'],
		['GET', '/api/admin/users/']
	]) {
		assert.equal(
			await adapter.getRequestCredentials({
				method,
				path,
				headers: { 'x-nycu-cms-identity': vector }
			}),
			null
		);
	}
	assert.equal(await adapter.getUserForIdentity({ sub: 'editor', email: 'EDITOR@NYCU.ONE' }), user);
	assert.equal(await adapter.getUserForIdentity(null), null);
	assert.equal(await adapter.getUserForIdentity({ sub: 'editor', email: 'not-an-email' }), null);
	adapter.setUserRepository({ getByEmail: async () => ({ status: 'suspended' }) });
	assert.equal(await adapter.getUserForIdentity({ sub: 'editor', email: 'editor@nycu.one' }), null);
});

test('keeps the shared account only as a migration fallback for old tokens', async () => {
	const adapter = new NycuOneSSO();
	process.env.NYCU_CMS_SSO_STAFF_EMAIL = 'legacy@nycu.one';
	const user = { id: 'legacy', email: 'legacy@nycu.one', status: 'active' };
	adapter.setUserRepository({
		getByEmail: async (email) => {
			assert.equal(email, 'legacy@nycu.one');
			return user;
		}
	});
	assert.equal(await adapter.getUserForIdentity({ sub: 'old-token' }), user);
	delete process.env.NYCU_CMS_SSO_STAFF_EMAIL;
});

test('creates a Contributor account on the first NYCU One sign-in', async () => {
	const adapter = new NycuOneSSO();
	const accounts = new Map();
	const created = [];
	adapter.setUserRepository({ getByEmail: async (email) => accounts.get(email) ?? null });
	adapter.createStaff = async (input) => {
		created.push(input);
		const user = { id: `u${created.length}`, email: input.email, status: 'active' };
		accounts.set(input.email, user);
		return user;
	};
	const first = await adapter.getUserForIdentity({
		sub: 'new',
		name: ' 新成員 ',
		email: 'New@NYCU.one'
	});
	assert.deepEqual(created, [{ email: 'new@nycu.one', name: '新成員', role: 'Contributor' }]);
	assert.equal(first.email, 'new@nycu.one');
	// The second sign-in finds the account instead of creating another.
	assert.equal(await adapter.getUserForIdentity({ sub: 'new', email: 'new@nycu.one' }), first);
	assert.equal(created.length, 1);
	// Without a display name the account is named after the mailbox.
	await adapter.getUserForIdentity({ sub: 'anon', email: 'anon@nycu.one' });
	assert.equal(created[1].name, 'anon');
});

test('never provisions for suspended accounts, legacy tokens, or when turned off', async () => {
	const adapter = new NycuOneSSO();
	let calls = 0;
	adapter.createStaff = async () => {
		calls += 1;
		return { id: 'x', email: 'x@nycu.one', status: 'active' };
	};
	adapter.setUserRepository({ getByEmail: async () => ({ id: 's', status: 'inactive' }) });
	assert.equal(await adapter.getUserForIdentity({ sub: 's', email: 's@nycu.one' }), null);
	adapter.setUserRepository({ getByEmail: async () => null });
	process.env.NYCU_CMS_SSO_STAFF_EMAIL = 'legacy@nycu.one';
	assert.equal(await adapter.getUserForIdentity({ sub: 'old-token' }), null);
	delete process.env.NYCU_CMS_SSO_STAFF_EMAIL;
	process.env.NYCU_CMS_SSO_PROVISION_ROLE = 'none';
	assert.equal(await adapter.getUserForIdentity({ sub: 'n', email: 'n@nycu.one' }), null);
	process.env.NYCU_CMS_SSO_PROVISION_ROLE = 'Administrator';
	await adapter.getUserForIdentity({ sub: 'a', email: 'a@nycu.one' });
	delete process.env.NYCU_CMS_SSO_PROVISION_ROLE;
	assert.equal(calls, 1, 'only the misconfigured role case creates, and as Contributor');
});

test('recovers when a parallel sign-in created the account first', async () => {
	const adapter = new NycuOneSSO();
	const user = { id: 'race', email: 'race@nycu.one', status: 'active' };
	let lookups = 0;
	adapter.setUserRepository({ getByEmail: async () => (lookups++ === 0 ? null : user) });
	adapter.createStaff = async () => {
		throw new Error('duplicate email');
	};
	assert.equal(await adapter.getUserForIdentity({ sub: 'race', email: 'race@nycu.one' }), user);
	adapter.setUserRepository({ getByEmail: async () => null });
	assert.equal(await adapter.getUserForIdentity({ sub: 'fail', email: 'fail@nycu.one' }), null);
});
