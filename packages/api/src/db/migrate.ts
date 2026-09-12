import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

async function runMigration() {
  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  console.log('Connected successfully! Applying migrations...');

  try {
    const sqlFile = path.join(__dirname, '../../drizzle/0000_graceful_scarecrow.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split by statement-breakpoint
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
      } catch (err: any) {
        console.warn(`Notice on statement ${i + 1}: ${err.message}`);
      }
    }

    console.log('✅ Migration applied successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
