const { login, logout } = require('./index');

describe('auth-lambda', () => {
  test('login should return true', () => {
    const result = login('username', 'password');
    expect(result).toBe(true);
  });

  test('logout should return false', () => {
    const result = logout();
    expect(result).toBe(false);
  });
});