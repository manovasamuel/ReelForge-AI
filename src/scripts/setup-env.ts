import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
console.log('[Setup] Environment loaded. DATABASE_URL is:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
