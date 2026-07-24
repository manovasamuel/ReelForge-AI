import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import postgres from 'postgres';

async function enableVector() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('No connection string found');
  }

  const sql = postgres(connectionString, { prepare: false });

  try {
    console.log('Enabling pgvector extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log('Successfully enabled pgvector!');
  } catch (err) {
    console.error('Failed to enable pgvector:', err);
  } finally {
    await sql.end();
  }
}

enableVector();
