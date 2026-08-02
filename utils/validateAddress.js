export default function validateAddress(address) {
  if (typeof address !== 'string') {
    return false;
  }

  const cleanedAddress = address.trim();

  // Prototype validation only.
  // Real Solana address validation will replace this later.
  return cleanedAddress.length >= 8;
}