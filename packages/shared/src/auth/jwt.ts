import { SignJWT, jwtVerify } from "jose";
import type { AuthTokenPayload } from "../schemas/auth";

const DEFAULT_SECRET = "komala-hr-dev-secret-change-me";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

// jose (not jsonwebtoken) is used deliberately: it runs on Web Crypto, so the
// same sign/verify functions work in Next.js Edge middleware, Node.js API
// routes, and the React Native mobile app — jsonwebtoken only works in Node.
export async function signAuthToken(
  payload: AuthTokenPayload,
  expiresIn: string = "7d"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}
