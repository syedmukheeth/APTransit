import assert from "node:assert/strict";
import { test } from "node:test";
import { findDashes } from "./check-dashes.mjs";

const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);

test("clean text has no hits", () => {
  assert.deepEqual(findDashes("Kurnool to Vijayawada, 06:30 to 12:10 - hyphen is fine"), []);
});

test("finds em and en dashes with 1 based positions", () => {
  const hits = findDashes(`first line\nab${EM}cd\n${EN}x`);
  assert.deepEqual(hits, [
    { line: 2, column: 3, char: "em dash" },
    { line: 3, column: 1, char: "en dash" },
  ]);
});

test("handles windows line endings", () => {
  assert.equal(findDashes(`a\r\nb${EM}`)[0]?.line, 2);
});
