import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

if (!process.env.ENCRYPTION_KEY) {
  console.warn("WARNING: ENCRYPTION_KEY is not set in the environment. Using a random key for this session. Data will not be decryptable after restart.");
}

const getValidKey = (key: string): Buffer => {
  const buffer = Buffer.from(key, 'hex');
  if (buffer.length !== 32) {
    // If the key isn't 32 bytes (256 bits), hash it to ensure it is.
    return crypto.createHash('sha256').update(String(key)).digest();
  }
  return buffer;
};

export function encryptString(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getValidKey(ENCRYPTION_KEY);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptString(text: string): string {
  const textParts = text.split(':');
  const ivHex = textParts.shift();
  const encryptedText = textParts.join(':');
  
  if (!ivHex || !encryptedText) {
    throw new Error("Invalid encrypted string format.");
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const key = getValidKey(ENCRYPTION_KEY);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
