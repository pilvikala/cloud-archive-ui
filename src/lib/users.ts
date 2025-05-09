export function isUserAllowed(email: string): boolean {
  const usersEnv = process.env.ALLOWED_USERS || '';
  const allowedUsers =usersEnv
    .split(';')
    .map(email => email.trim())
    .filter(email => email.length > 0);

  if (!email) return false;
  return allowedUsers.map(user => user.toLowerCase()).includes(email.toLowerCase());
}
