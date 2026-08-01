/**
 * App-level IPv4 input helpers — shared by ip-analysis and fraud-events
 * (and any future domain that takes an IP as a search key). Not an
 * analysis concept: format check only. A live API must re-validate server-side.
 */

// IPv4 only (dotted-quad, 0-255 per octet) — matches the "192.168.1.1" format this UI advertises.
const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/

export function isValidIPv4(value: string): boolean {
  return IPV4_REGEX.test(value.trim())
}

export class InvalidIPError extends Error {
  readonly input: string

  constructor(input: string) {
    super(`Invalid IP address. Format: 192.168.1.1`)
    this.name = 'InvalidIPError'
    this.input = input
  }
}
