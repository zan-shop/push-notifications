/**
 * FCM Token Validator
 * Validates Firebase Cloud Messaging device tokens
 */

/**
 * Validate FCM token format
 * FCM tokens are typically 152+ characters, alphanumeric with special chars
 */
export function validateFCMToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // FCM tokens are typically 152-163 characters long
  if (token.length < 140 || token.length > 200) {
    return false;
  }

  // Should contain only alphanumeric, hyphens, underscores, and colons
  const validTokenRegex = /^[a-zA-Z0-9_:-]+$/;
  return validTokenRegex.test(token);
}

/**
 * Validate platform value
 */
export function validatePlatform(platform: string): platform is 'ios' | 'android' {
  return platform === 'ios' || platform === 'android';
}

/**
 * Validate app version format (semver-like)
 */
export function validateAppVersion(version: string): boolean {
  if (!version || typeof version !== 'string') {
    return false;
  }

  // Accept formats like: 1.0.0, 1.0, 1.0.0-beta, etc.
  const versionRegex = /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9.-]+)?$/;
  return versionRegex.test(version);
}
