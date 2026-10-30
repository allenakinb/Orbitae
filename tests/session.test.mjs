import { test } from "node:test";
import assert from "node:assert/strict";
import { withDeadline } from "../lib/auth/session.ts";

test("a stalled session settles with a recoverable error", async () => {
  await assert.rejects(withDeadline(new Promise(() => {}), 15), /timed out/);
});
test("a rejected profile request is not mistaken for authenticated data", async () => {
  const failure = new Error("RLS request failed");
  await assert.rejects(withDeadline(Promise.reject(failure), 100), e => e === failure);
});
test("successful restoration retains its original result", async () => {
  const profile = { id: "existing-account", email: "member@example.com" };
  assert.equal(await withDeadline(Promise.resolve(profile), 100), profile);
});
