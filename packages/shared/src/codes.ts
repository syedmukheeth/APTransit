/**
 * Crockford Base32 human-readable code generator and validator.
 * Alphabet: 0123456789ABCDEFGHJKMNPQRSTVWXYZ (32 chars, excludes I, L, O, U).
 */

export const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateCrockford(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CROCKFORD_ALPHABET.length);
    result += CROCKFORD_ALPHABET[randomIndex];
  }
  return result;
}

/**
 * Ticket code format: APT-XXXX-XXXX
 */
export function generateTicketCode(): string {
  const part1 = generateCrockford(4);
  const part2 = generateCrockford(4);
  return `APT-${part1}-${part2}`;
}

/**
 * Booking code format: BKG-XXXXXX
 */
export function generateBookingCode(): string {
  return `BKG-${generateCrockford(6)}`;
}

/**
 * Pass code format: PAS-XXXXXX
 */
export function generatePassCode(): string {
  return `PAS-${generateCrockford(6)}`;
}

/**
 * Complaint code format: CMP-XXXXXX
 */
export function generateComplaintCode(): string {
  return `CMP-${generateCrockford(6)}`;
}

/**
 * Incident code format: INC-XXXXXX
 */
export function generateIncidentCode(): string {
  return `INC-${generateCrockford(6)}`;
}

export const CODE_PATTERNS = {
  ticket: /^APT-[0-9A-HJKMNP-Z]{4}-[0-9A-HJKMNP-Z]{4}$/,
  booking: /^BKG-[0-9A-HJKMNP-Z]{6}$/,
  pass: /^PAS-[0-9A-HJKMNP-Z]{6}$/,
  complaint: /^CMP-[0-9A-HJKMNP-Z]{6}$/,
  incident: /^INC-[0-9A-HJKMNP-Z]{6}$/,
} as const;

export type CodeType = keyof typeof CODE_PATTERNS;

export function isValidCode(code: string, type: CodeType): boolean {
  return CODE_PATTERNS[type].test(code);
}
