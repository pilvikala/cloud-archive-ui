import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { isUserAllowed, allowedUsers } from '../users';

describe('User Access Control', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should load and validate users from ALLOWED_USERS environment variable', () => {
    process.env.ALLOWED_USERS = 'user1@example.com;user2@example.com;user3@example.com';
    const { isUserAllowed, allowedUsers } = require('../users');
    
    // Test the loaded users list
    expect(allowedUsers).toEqual([
      'user1@example.com',
      'user2@example.com',
      'user3@example.com'
    ]);

    // Test access control
    expect(isUserAllowed('user1@example.com')).toBe(true);
    expect(isUserAllowed('user2@example.com')).toBe(true);
    expect(isUserAllowed('user3@example.com')).toBe(true);
    expect(isUserAllowed('unauthorized@example.com')).toBe(false);
  });

  test('should handle empty ALLOWED_USERS environment variable', () => {
    process.env.ALLOWED_USERS = '';
    const { isUserAllowed, allowedUsers } = require('../users');
    expect(allowedUsers).toEqual([]);
    expect(isUserAllowed('any@example.com')).toBe(false);
  });

  test('should handle missing ALLOWED_USERS environment variable', () => {
    delete process.env.ALLOWED_USERS;
    const { isUserAllowed, allowedUsers } = require('../users');
    expect(allowedUsers).toEqual([]);
    expect(isUserAllowed('any@example.com')).toBe(false);
  });

  test('should handle email case insensitivity with environment variables', () => {
    process.env.ALLOWED_USERS = 'User1@Example.com';
    const { isUserAllowed } = require('../users');
    expect(isUserAllowed('USER1@EXAMPLE.COM')).toBe(true);
    expect(isUserAllowed('user1@example.com')).toBe(true);
    expect(isUserAllowed('User1@Example.com')).toBe(true);
  });

  test('should trim whitespace and filter empty emails from environment variable', () => {
    process.env.ALLOWED_USERS = ' user1@example.com ; user2@example.com ;; user3@example.com ';
    const { isUserAllowed, allowedUsers } = require('../users');
    expect(allowedUsers).toEqual([
      'user1@example.com',
      'user2@example.com',
      'user3@example.com'
    ]);
    expect(isUserAllowed('user1@example.com')).toBe(true);
    expect(isUserAllowed('user2@example.com')).toBe(true);
    expect(isUserAllowed('user3@example.com')).toBe(true);
  });
}); 