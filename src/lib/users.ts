// Load allowed users from environment variable
export const allowedUsers = (() => {
  const usersEnv = process.env.ALLOWED_USERS || '';
  return usersEnv
    .split(';')
    .map(email => email.trim())
    .filter(email => email.length > 0);
})();

export function isUserAllowed(email: string): boolean {
  if (!email) return false;
  return allowedUsers.map(user => user.toLowerCase()).includes(email.toLowerCase());
}
