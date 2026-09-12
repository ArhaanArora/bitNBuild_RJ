import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

async function migrateV4Auth() {
  console.log('--- Running v4 Migration: Centralized Authentication & RBAC ---');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://skillverify:skillverify@localhost:5432/skillverifydb',
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    // 1. Update users table with verification state machine and progressive profiling fields
    console.log('1. Updating users table with RBAC and verification state machine columns...');
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'PENDING' NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS work_email text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS event_name text;

      CREATE INDEX IF NOT EXISTS users_role_status_idx ON users (role, status);
      CREATE INDEX IF NOT EXISTS users_verification_idx ON users (verification_status);
    `);

    // 2. Create admin_role enum and admins table (Isolated Admin Credential Space)
    console.log('2. Creating isolated admins table for Admin Security Console...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE admin_role AS ENUM ('super_admin', 'security_admin', 'verification_admin', 'support_admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS admins (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        admin_role admin_role DEFAULT 'super_admin' NOT NULL,
        name text NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        last_login_at timestamp,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS admins_email_idx ON admins (email);
    `);

    // 3. Create password_resets table
    console.log('3. Creating password_resets table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        email text NOT NULL,
        token text NOT NULL UNIQUE,
        expires_at timestamp NOT NULL,
        used_at timestamp,
        created_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets (token);
      CREATE INDEX IF NOT EXISTS password_resets_email_idx ON password_resets (email);
    `);

    // 4. Create email_verifications table
    console.log('4. Creating email_verifications table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token text NOT NULL UNIQUE,
        expires_at timestamp NOT NULL,
        verified_at timestamp,
        created_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS email_verifications_token_idx ON email_verifications (token);
      CREATE INDEX IF NOT EXISTS email_verifications_user_idx ON email_verifications (user_id);
    `);

    // 5. Enhance audit_logs with actor details and reason
    console.log('5. Enhancing audit_logs table...');
    await client.query(`
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_email text;
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_role text;
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS reason text;
    `);

    // 6. Seed initial Super Admin account if not exists
    console.log('6. Seeding initial Super Admin security account...');
    const adminCheck = await client.query(`SELECT id FROM admins WHERE email = $1`, ['admin@skillverify.com']);
    if (adminCheck.rows.length === 0) {
      const passwordHash = await bcrypt.hash('AdminSecret2025!', 12);
      await client.query(`
        INSERT INTO admins (email, password_hash, admin_role, name, status)
        VALUES ($1, $2, 'super_admin', 'Chief Security Officer', 'active')
      `, ['admin@skillverify.com', passwordHash]);
      console.log('✓ Created initial Super Admin: admin@skillverify.com (password: AdminSecret2025!)');
    } else {
      console.log('✓ Super Admin already exists.');
    }

    // 7. Ensure existing mock users have verified status & active
    await client.query(`
      UPDATE users SET email_verified = true, verification_status = 'VERIFIED' WHERE email IN ('alex@demo.local', 'recruiter@demo.local', 'organizer@demo.local');
    `);

    console.log('✅ v4 Migration successfully completed!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrateV4Auth().catch(err => {
  console.error('❌ v4 Migration error:', err);
  process.exit(1);
});
