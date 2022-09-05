import * as bcrypt from "bcrypt";

const saltRounds = 10;

export async function encrypt(str: string) {
  const hash = await bcrypt.hash(str, saltRounds);
  return hash;
}

export async function compare(str: string, hash: string) {
  const match = await bcrypt.compare(str, hash);
  return match;
}
