// lib/auth/pin-login.js
import crypto from "node:crypto";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";

export const PIN_MIN = Number(process.env.LOGIN_PIN_MIN || 4);
export const PIN_MAX = Number(process.env.LOGIN_PIN_MAX || 8);
export const OTP_TTL_MINUTES = Number(process.env.LOGIN_OTP_MINUTES || 10);
export const TEMP_LOGIN_TOKEN_MINUTES = Number(process.env.LOGIN_TEMP_LOGIN_MINUTES || 15);
export const TRUSTED_DEVICE_DAYS = Number(process.env.LOGIN_TRUSTED_DEVICE_DAYS || 30);
export const DEVICE_COOKIE_NAME = process.env.LOGIN_DEVICE_COOKIE || "sotsiaalai_device";

export function normalizeEmail(input) {
  const s = String(input || "").trim().toLowerCase();
  return s.length > 254 ? s.slice(0, 254) : s;
}

export function normalizePin(input) {
  return String(input || "").trim().replace(/\s+/g, "");
}

export function isValidPin(pin) {
  return typeof pin === "string" && new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin);
}

export function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const maskedUser =
    user.length <= 2 ? `${user[0] || ""}*` : `${user[0]}${"*".repeat(Math.max(1, user.length - 2))}${user[user.length - 1]}`;
  const domainParts = domain.split(".");
  const maskedDomain =
    domainParts.length < 2
      ? "***"
      : `${domainParts[0][0]}***.${domainParts.slice(1).join(".")}`;
  return `${maskedUser}@${maskedDomain}`;
}

export function randomOtpCode() {
  const value = crypto.randomInt(100000, 1000000);
  return value.toString().padStart(6, "0");
}

export async function hashOtpCode(code) {
  return bcryptHash(code, 10);
}

export async function compareOtpCode(code, codeHash) {
  if (!code || !codeHash) return false;
  try {
    return await bcryptCompare(code, codeHash);
  } catch {
    return false;
  }
}

export function generateOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

export function hashOpaqueToken(token) {
  return sha256(token);
}

export function fingerprintUserAgent(userAgent) {
  if (!userAgent) return null;
  return sha256(userAgent.trim().toLowerCase());
}

export function computeIpFromHeaders(headers) {
  const forwarded = headers.get("x-forwarded-for") || headers.get("x-real-ip");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("cf-connecting-ip") || headers.get("true-client-ip") || null;
}

export function computeIpRange(ip) {
  if (!ip) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  return null;
}

export function buildDeviceCookie(deviceToken) {
  const maxAgeSeconds = TRUSTED_DEVICE_DAYS * 24 * 60 * 60;
  return {
    name: DEVICE_COOKIE_NAME,
    value: deviceToken,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      maxAge: maxAgeSeconds,
    },
  };
}
