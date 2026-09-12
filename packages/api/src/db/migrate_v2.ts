import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();
import { Pool } from 'pg';

async function migrateV2() {
  console.log('Running v2 schema migration on database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    // 1. Extend verification_status enum
    console.log('Extending verification_status enum...');
    const enumValues = [
      'CLAIMED',
      'PENDING',
      'UNDER_REVIEW',
      'ASSESSMENT_REQUIRED',
      'ASSESSMENT_FAILED',
      'REVOKED',
    ];

    for (const val of enumValues) {
      try {
        await client.query(`ALTER TYPE verification_status ADD VALUE IF NOT EXISTS '${val}';`);
      } catch (err: any) {
        // Some Postgres versions don't support IF NOT EXISTS in ALTER TYPE ADD VALUE
        if (!err.message?.includes('already exists')) {
          console.warn(`Note on enum value ${val}:`, err.message);
        }
      }
    }

    // 2. Update skills table
    console.log('Updating skills table...');
    await client.query(`
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS slug text;
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS aliases jsonb DEFAULT '[]'::jsonb;
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS description text;
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
      UPDATE skills SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
    `);

    // Ensure slug has a unique index
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS skills_slug_idx ON skills (slug);
    `);

    // 3. Update candidate_skills table
    console.log('Updating candidate_skills table...');
    await client.query(`
      ALTER TABLE candidate_skills ADD COLUMN IF NOT EXISTS evidence_notes text;
      ALTER TABLE candidate_skills ADD COLUMN IF NOT EXISTS evidence_url text;
      ALTER TABLE candidate_skills ADD COLUMN IF NOT EXISTS portfolio_rating real;
      ALTER TABLE candidate_skills ADD COLUMN IF NOT EXISTS github_status text;
      CREATE UNIQUE INDEX IF NOT EXISTS candidate_skills_user_skill_idx ON candidate_skills (user_id, skill_id);
    `);

    // 4. Create notification_type enum and notifications table
    console.log('Creating notifications table...');
    await client.query(`
      DO $$ BEGIN
          CREATE TYPE notification_type AS ENUM (
            'TEAM_INVITE', 'TEAM_APPLICATION', 'TEAM_ACCEPTED', 'TEAM_REJECTED',
            'VERIFICATION_REQUEST', 'VERIFICATION_RESULT', 'SYSTEM_ALERT'
          );
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type notification_type NOT NULL DEFAULT 'SYSTEM_ALERT',
        title text NOT NULL,
        message text NOT NULL,
        action_url text,
        metadata jsonb,
        is_read boolean NOT NULL DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id, is_read);
    `);

    // 5. Create audit_logs table
    console.log('Creating audit_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
        action text NOT NULL,
        entity_type text NOT NULL,
        entity_id text NOT NULL,
        details jsonb,
        ip_address text,
        created_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);
    `);

    // 6. Create files table
    console.log('Creating files table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        uploader_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_name text NOT NULL,
        file_name text NOT NULL,
        mime_type text NOT NULL,
        size_bytes integer NOT NULL,
        storage_path text NOT NULL,
        public_url text NOT NULL,
        entity_type text,
        entity_id text,
        created_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS files_uploader_id_idx ON files (uploader_id);
    `);

    console.log('✅ v2 Schema migration completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrateV2().catch((err) => {
  console.error('Migration v2 failed:', err);
  process.exit(1);
});
