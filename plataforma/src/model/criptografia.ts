import * as argon2 from "argon2";
import { randomBytes, createHash } from "node:crypto";

const PASSWORD_OPTIONS: argon2.HashOptions = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};


export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, PASSWORD_OPTIONS);
}

export async function verifyPassword(
    hash: string,
    password: string
): Promise<boolean> {
    return await argon2.verify(hash, password);
}

export function generateSessionToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}