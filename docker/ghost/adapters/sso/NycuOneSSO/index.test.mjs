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
const claims = { sub: 'editor', name: '編輯', iat: now, exp: now + 120 };
const vector =
	'v1.eyJzdWIiOiJlZGl0b3IiLCJuYW1lIjoi57eo6LyvIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDAxMjB9.g4gf_kZiXmqnsn2Uu0sljVTV3KX7At_c6RFKJlEuZT8';

test('accepts the Go gate token and rejects forged, expired and malformed identities', () => {
	assert.equal(sign(claims), vector);
	assert.deepEqual(NycuOneSSO.verifyToken(vector, secret, now * 1000), {
		sub: 'editor',
		name: '編輯'
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

test('signs in only on full Admin entry requests and only to an active shared account', async () => {
	const adapter = new NycuOneSSO();
	process.env.NYCU_CMS_SSO_STAFF_EMAIL = 'shared@example.test';
	const user = { id: 'staff', status: 'active' };
	adapter.setUserRepository({
		getByEmail: async (email) => {
			assert.equal(email, 'shared@example.test');
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
	assert.equal(await adapter.getUserForIdentity({ sub: 'editor' }), user);
	assert.equal(await adapter.getUserForIdentity(null), null);
	adapter.setUserRepository({ getByEmail: async () => ({ status: 'suspended' }) });
	assert.equal(await adapter.getUserForIdentity({ sub: 'editor' }), null);
	delete process.env.NYCU_CMS_SSO_STAFF_EMAIL;
	assert.equal(await adapter.getUserForIdentity({ sub: 'editor' }), null);
});
