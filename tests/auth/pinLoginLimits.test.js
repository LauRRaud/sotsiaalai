import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTIVE_SESSION_ADMIN_MAX,
  ACTIVE_SESSION_MAX,
  TRUSTED_DEVICE_ADMIN_MAX,
  TRUSTED_DEVICE_MAX,
  getActiveSessionMaxForUser,
  getTrustedDeviceMaxForUser,
  normalizeTrustedDeviceName,
  pickTrustedDeviceIdsToEvict
} from "../../lib/auth/pin-login.js";

test("regular users default to two active sessions and trusted devices", () => {
  assert.equal(ACTIVE_SESSION_MAX, 2);
  assert.equal(TRUSTED_DEVICE_MAX, 2);
  assert.equal(getActiveSessionMaxForUser({ role: "CLIENT" }), ACTIVE_SESSION_MAX);
  assert.equal(getTrustedDeviceMaxForUser({ role: "CLIENT" }), TRUSTED_DEVICE_MAX);
});

test("admins get a higher session and trusted-device allowance by default", () => {
  assert.ok(ACTIVE_SESSION_ADMIN_MAX > ACTIVE_SESSION_MAX);
  assert.ok(TRUSTED_DEVICE_ADMIN_MAX > TRUSTED_DEVICE_MAX);
  assert.equal(getActiveSessionMaxForUser({ isAdmin: true }), ACTIVE_SESSION_ADMIN_MAX);
  assert.equal(getTrustedDeviceMaxForUser({ role: "ADMIN" }), TRUSTED_DEVICE_ADMIN_MAX);
});

test("trusted-device eviction removes the least recently used device before adding a new one", () => {
  const devices = [
    { id: "newer", lastUsedAt: new Date("2026-01-03T00:00:00.000Z"), createdAt: new Date("2026-01-01T00:00:00.000Z") },
    { id: "oldest", lastUsedAt: new Date("2026-01-01T00:00:00.000Z"), createdAt: new Date("2026-01-01T00:00:00.000Z") },
    { id: "middle", lastUsedAt: new Date("2026-01-02T00:00:00.000Z"), createdAt: new Date("2026-01-01T00:00:00.000Z") }
  ];

  assert.deepEqual(pickTrustedDeviceIdsToEvict(devices, 3), ["oldest"]);
  assert.deepEqual(pickTrustedDeviceIdsToEvict(devices, 2), ["oldest", "middle"]);
});

test("trusted-device names are optional and normalized", () => {
  assert.equal(normalizeTrustedDeviceName("  Minu   telefon  "), "Minu telefon");
  assert.equal(normalizeTrustedDeviceName(""), null);
  assert.equal(normalizeTrustedDeviceName("x".repeat(80)).length, 60);
});
