// List of allowed users by their email addresses
export const allowedUsers = [
  'michal.brutvan@gmail.com',
  // Add more allowed users as needed
];

export function isUserAllowed(email: string): boolean {
  return allowedUsers.includes(email.toLowerCase());
}
