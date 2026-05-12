import { createHash, createHmac, timingSafeEqual } from "node:crypto";

interface BaseClaims {
  sub: string;
  orgId: string;
  sid: string;
  role: string;
  type: "access" | "refresh";
  iat: number;
  exp: number;
}

export type TokenClaims = BaseClaims;

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }

  return secret;
}

function signSegment(segment: string, secret: string): string {
  return createHmac("sha256", secret).update(segment).digest("base64url");
}

export function signToken(
  claims: Omit<BaseClaims, "iat" | "exp" | "type">,
  tokenType: "access" | "refresh",
  ttlSeconds: number,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: BaseClaims = {
    ...claims,
    type: tokenType,
    iat: now,
    exp: now + ttlSeconds,
  };

  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const segment = `${header}.${body}`;
  const signature = signSegment(segment, getSessionSecret());

  return `${segment}.${signature}`;
}

export function verifyToken(token: string, expectedType: "access" | "refresh"): TokenClaims {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format.");
  }

  const [header, body, signature] = parts;
  const segment = `${header}.${body}`;
  const expectedSignature = signSegment(segment, getSessionSecret());

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(decodeBase64Url(body)) as TokenClaims;

  if (payload.type !== expectedType) {
    throw new Error("Invalid token type.");
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.exp <= now) {
    throw new Error("Token expired.");
  }

  return payload;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
