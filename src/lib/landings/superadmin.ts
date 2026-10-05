export const SUPERADMIN_USER_ID = "37830e1a-2833-4dd2-b396-c613120601aa";

export function isSuperadminUserId(userId: string | undefined) {
  return userId === SUPERADMIN_USER_ID;
}
