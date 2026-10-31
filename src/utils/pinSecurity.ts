// Client-side SHA-256 PIN hashing with zero remote transmission

export async function hashPin(pin: string): Promise<string> {
  const salt = 'bloomquest_salt_v1';
  const data = new TextEncoder().encode(salt + pin);
  if (window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash
  let hash = 0;
  const str = salt + pin;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

export async function verifyPin(inputPin: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return true;
  const computed = await hashPin(inputPin);
  return computed === storedHash;
}
