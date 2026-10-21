import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = stripTypeScriptTypes(
  readFileSync(new URL('../app/composables/useAuth.ts', import.meta.url), 'utf8'),
).replace('export const useAuth', 'const useAuth');

function createAuth({ signedIn = false, server = false, fetch }) {
  const rememberedUser = signedIn ? { id: 'test-user' } : null;
  const state = new Map([
    ['auth.isAuthenticated', { value: signedIn }],
    ['auth.user', { value: rememberedUser }],
  ]);
  const auth = runInNewContext(`${source}\nuseAuth();`, {
    process: { server },
    useRuntimeConfig: () => ({ public: { apiUrl: 'https://api.example.test' } }),
    useState(key, initialize) {
      if (!state.has(key)) state.set(key, { value: initialize() });
      return state.get(key);
    },
    readonly: value => value,
    useRequestHeaders: () => ({ cookie: 'jwt_token=persisted-session' }),
    $fetch: fetch,
    createError: options => Object.assign(new Error(options.statusMessage), options),
  });
  return { auth, state, rememberedUser };
}

for (const failure of [new TypeError('Failed to fetch'), { statusCode: 503 }]) {
  test(`temporary failure preserves signed-in state: ${failure.message ?? failure.statusCode}`, async () => {
    const { auth, state, rememberedUser } = createAuth({
      signedIn: true,
      fetch: async () => { throw failure; },
    });
    assert.equal(await auth.checkAuth(true), true);
    assert.equal(auth.isAuthenticated.value, true);
    assert.equal(auth.user.value, rememberedUser);
    assert.equal(state.get('auth.lastCheck').value, 0);
    assert.equal(auth.isLoading.value, false);
  });
}

for (const statusCode of [401, 404]) {
  test(`confirmed invalid session clears signed-in state: ${statusCode}`, async () => {
    const { auth } = createAuth({
      signedIn: true,
      fetch: async () => { throw { statusCode }; },
    });
    assert.equal(await auth.checkAuth(true), false);
    assert.equal(auth.isAuthenticated.value, false);
    assert.equal(auth.user.value, null);
    assert.equal(auth.isLoading.value, false);
  });
}

for (const server of [false, true]) {
  test(`cold start reports an unavailable API without caching a logout (server=${server})`, async () => {
    const { auth, state } = createAuth({
      server,
      fetch: async () => { throw new TypeError('Failed to fetch'); },
    });
    await assert.rejects(auth.checkAuth(), { statusCode: 503 });
    assert.equal(state.get('auth.lastCheck').value, 0);
    assert.equal(auth.isLoading.value, false);
  });
}

test('a reopened app restores the user through its persistent cookie', async () => {
  const user = { id: 'returning-user' };
  const { auth } = createAuth({
    server: true,
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.example.test/me');
      assert.equal(options.credentials, 'include');
      assert.equal(options.headers.cookie, 'jwt_token=persisted-session');
      return user;
    },
  });
  assert.equal(await auth.checkAuth(), true);
  assert.equal(auth.user.value, user);
});

test('server rendering still requires API verification for a remembered user', async () => {
  const { auth } = createAuth({
    server: true,
    signedIn: true,
    fetch: async () => { throw { statusCode: 503 }; },
  });
  await assert.rejects(auth.checkAuth(), { statusCode: 503 });
});
