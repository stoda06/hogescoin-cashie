const BASE58_ADDRESS_PATTERN =
  /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export default function validateAddress(address) {
  if (typeof address !== 'string') {
    return false;
  }

  const cleanedAddress = address.trim();

  // Solana addresses are 32-44 characters of base58
  // (no 0, O, I or l). This does not verify the address
  // exists on-chain, only that it is well formed.
  return BASE58_ADDRESS_PATTERN.test(cleanedAddress);
}
