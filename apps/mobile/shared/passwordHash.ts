import * as Crypto from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha512 } from '@noble/hashes/sha2';
import { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

const IDENTITY_FORMAT_MARKER = 0x01;
const IDENTITY_PRF_HMAC_SHA512 = 0x00000002;
const IDENTITY_ITERATIONS = 100_000;
const IDENTITY_SALT_BYTES = 16;
const IDENTITY_SUBKEY_BYTES = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = await Crypto.getRandomBytesAsync(IDENTITY_SALT_BYTES);
  const subkey = await pbkdf2Async(sha512, utf8ToBytes(password), salt, {
    c: IDENTITY_ITERATIONS,
    dkLen: IDENTITY_SUBKEY_BYTES,
    asyncTick: 10,
  });

  const payload = concatBytes(
    Uint8Array.of(IDENTITY_FORMAT_MARKER),
    uint32Bytes(IDENTITY_PRF_HMAC_SHA512),
    uint32Bytes(IDENTITY_ITERATIONS),
    uint32Bytes(IDENTITY_SALT_BYTES),
    salt,
    subkey,
  );

  return toBase64(payload);
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  try {
    const payload = fromBase64(encodedHash);
    if (payload[0] !== IDENTITY_FORMAT_MARKER || payload.length < 13) {
      return false;
    }

    const prf = readUint32(payload, 1);
    const iterations = readUint32(payload, 5);
    const saltLength = readUint32(payload, 9);
    if (
      prf !== IDENTITY_PRF_HMAC_SHA512 ||
      iterations <= 0 ||
      saltLength <= 0 ||
      payload.length < 13 + saltLength
    ) {
      return false;
    }

    const salt = payload.slice(13, 13 + saltLength);
    const expected = payload.slice(13 + saltLength);
    const actual = await pbkdf2Async(sha512, utf8ToBytes(password), salt, {
      c: iterations,
      dkLen: expected.length,
      asyncTick: 10,
    });

    return bytesToHex(actual) === bytesToHex(expected);
  } catch {
    return false;
  }
}

function uint32Bytes(value: number): Uint8Array {
  return Uint8Array.of(
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  );
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return hexToBytes(
    Array.from(atob(value), (character) => character.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
  );
}
