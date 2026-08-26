const assert = require('node:assert/strict');
const test = require('node:test');

const resolveExpoConfig = require('../app.config.js');
const appConfig = require('../app.json').expo;
const easConfig = require('../eas.json');

test('Android application identity and version policy are explicit', () => {
  assert.equal(appConfig.owner, 'megaraz-team');
  assert.equal(appConfig.slug, 'mediavault');
  assert.equal(appConfig.extra.eas.projectId, 'b5ec51ec-d5ba-4e01-afdb-6b00745a0182');
  assert.equal(appConfig.android.package, 'com.megaraz.mediavault');
  assert.equal(appConfig.android.versionCode, 1);
  assert.equal(appConfig.scheme, 'mediavaultandroid');
  assert.equal(easConfig.cli.appVersionSource, 'remote');
  assert.equal(easConfig.build.preview.android.buildType, 'apk');
  assert.equal(easConfig.build.preview.android.autoIncrement, 'versionCode');
  assert.equal(easConfig.build.production.android.buildType, 'app-bundle');
  assert.equal(easConfig.build.production.android.autoIncrement, 'versionCode');
});

test('preview config rejects a missing API URL', () => {
  withEnvironment(
    { MEDIAVAULT_BUILD_PROFILE: 'preview', EXPO_PUBLIC_MEDIA_VAULT_API_URL: undefined },
    () => assert.throws(
      () => resolveExpoConfig({ config: appConfig }),
      /EXPO_PUBLIC_MEDIA_VAULT_API_URL is required/,
    ),
  );
});

test('production config rejects localhost, HTTP, and credential-bearing API URLs', () => {
  for (const value of [
    'https://localhost:5210',
    'http://api.example.com',
    'https://user:password@api.example.com',
  ]) {
    withEnvironment(
      { MEDIAVAULT_BUILD_PROFILE: 'production', EXPO_PUBLIC_MEDIA_VAULT_API_URL: value },
      () => assert.throws(() => resolveExpoConfig({ config: appConfig })),
    );
  }
});

test('preview and production configs accept a public HTTPS API URL', () => {
  for (const profile of ['preview', 'production']) {
    withEnvironment(
      {
        MEDIAVAULT_BUILD_PROFILE: profile,
        EXPO_PUBLIC_MEDIA_VAULT_API_URL: 'https://api.example.invalid',
      },
      () => assert.equal(resolveExpoConfig({ config: appConfig }), appConfig),
    );
  }
});

function withEnvironment(values, action) {
  const previousValues = Object.fromEntries(
    Object.keys(values).map((name) => [name, process.env[name]]),
  );

  try {
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }

    action();
  } finally {
    for (const [name, value] of Object.entries(previousValues)) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}
