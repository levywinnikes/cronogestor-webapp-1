import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 12);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  if (passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2b$") || passwordHash.startsWith("$2y$")) {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  const plainBuffer = Buffer.from(plainPassword, "utf-8");
  const hashBuffer = Buffer.from(passwordHash, "utf-8");

  if (plainBuffer.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(plainBuffer, hashBuffer);
}
