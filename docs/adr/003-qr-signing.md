# ADR 003 · Signed QR with a rotating code

**Status:** Accepted, Day 0.

## Context

Plan sec 13 to 15 require stopping double use, fake status and screenshot sharing, with a 5 to 10 second check (we target under 2 seconds). Research: BlueStar and Chalo rely on in app activation plus visual checks; Google Wallet transit passes use rotating barcodes; signed tokens allow offline checks later.

## Decision

- QR content = `APT1.<payload>.<ed25519 signature>~<rotating code>`.
- Payload is small (ids, trip, date, validUntil, key id) so the QR stays low density and scans fast on cheap phones.
- Rotating code = HMAC SHA 256 of a per ticket secret and the 30 second time step, 8 base32 characters. Server accepts one step either side.
- Per ticket secret is only sent to the holder when the ticket is ACTIVE, stored encrypted, replaced on transfer.
- Visual layer for humans: moving band, live clock, colour of the day with its name.
- Server validation is the source of truth (status, trip, date, first scan wins).

## Consequences

- Screenshots stop working after about a minute. Gifted tickets' old QR codes die instantly.
- Offline scanning becomes possible later: the conductor app can verify the signature and validity with the public key and sync scans afterwards.
- Key rotation: `keyId` in the payload lets old and new keys work side by side.
