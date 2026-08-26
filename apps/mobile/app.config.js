const RELEASE_PROFILES = new Set(['preview', 'production']);

module.exports = ({ config }) => {
  const buildProfile = process.env.MEDIAVAULT_BUILD_PROFILE;

  if (buildProfile !== undefined && !RELEASE_PROFILES.has(buildProfile)) {
    throw new Error(
      'MEDIAVAULT_BUILD_PROFILE must be either preview or production when it is set.',
    );
  }

  if (buildProfile !== undefined) {
    validateReleaseApiUrl(process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL, buildProfile);
  }

  return config;
};

function validateReleaseApiUrl(value, buildProfile) {
  const configurationName = 'EXPO_PUBLIC_MEDIA_VAULT_API_URL';

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`${configurationName} is required for the ${buildProfile} Android build.`);
  }

  let apiUrl;
  try {
    apiUrl = new URL(value);
  } catch {
    throw new Error(`${configurationName} must be an absolute HTTPS URL.`);
  }

  if (
    apiUrl.protocol !== 'https:'
    || apiUrl.username.length > 0
    || apiUrl.password.length > 0
    || apiUrl.search.length > 0
    || apiUrl.hash.length > 0
  ) {
    throw new Error(
      `${configurationName} must be an absolute HTTPS URL without credentials, a query, or a fragment.`,
    );
  }

  const hostname = apiUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname === '127.0.0.1'
    || hostname === '::1'
  ) {
    throw new Error(`${configurationName} must not target localhost in an Android release build.`);
  }
}
