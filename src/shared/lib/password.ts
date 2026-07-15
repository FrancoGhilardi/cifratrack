import bcrypt from "bcrypt";

const MIN_SALT_ROUNDS = 10;

function getSaltRounds(): number {
  const fromEnv = Number(process.env.BCRYPT_SALT_ROUNDS);
  return Number.isInteger(fromEnv) && fromEnv >= MIN_SALT_ROUNDS
    ? fromEnv
    : MIN_SALT_ROUNDS;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, getSaltRounds());
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
