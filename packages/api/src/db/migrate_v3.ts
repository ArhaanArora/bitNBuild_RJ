import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import { Pool } from 'pg';

async function migrateV3() {
  console.log('Running v3 schema migration (Super Admin Command Center) on database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    // 1. Add public_id columns to existing tables
    console.log('Adding public_id columns...');
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id text;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS public_id text;
      ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS public_id text;
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS public_id text;

      CREATE UNIQUE INDEX IF NOT EXISTS users_public_id_idx ON users (public_id) WHERE public_id IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS projects_public_id_idx ON projects (public_id) WHERE public_id IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS hackathons_public_id_idx ON hackathons (public_id) WHERE public_id IS NOT NULL;
    `);

    // 2. Create organizations table
    console.log('Creating organizations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        public_id text NOT NULL UNIQUE,
        name text NOT NULL,
        type text NOT NULL DEFAULT 'Enterprise',
        website text,
        contact_email text,
        location text,
        verification_status text NOT NULL DEFAULT 'PENDING',
        risk_score real DEFAULT 10,
        ai_verification_notes jsonb,
        human_decision text DEFAULT 'PENDING',
        reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at timestamp,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations (verification_status);
    `);

    // 3. Create messages table (Unified Inbox)
    console.log('Creating messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        public_id text NOT NULL UNIQUE,
        sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
        receiver_id uuid REFERENCES users(id) ON DELETE SET NULL,
        sender_email text NOT NULL,
        sender_name text NOT NULL,
        subject text NOT NULL,
        body text NOT NULL,
        category text NOT NULL DEFAULT 'SUPPORT',
        status text NOT NULL DEFAULT 'NEW',
        priority text NOT NULL DEFAULT 'NORMAL',
        ai_triage_notes jsonb,
        ai_suggested_response text,
        human_approved boolean DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS messages_status_idx ON messages (status, priority);
    `);

    // 4. Create cms_pages and cms_versions tables
    console.log('Creating CMS tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        slug text NOT NULL UNIQUE,
        title text NOT NULL,
        content jsonb NOT NULL,
        published_version integer NOT NULL DEFAULT 1,
        status text NOT NULL DEFAULT 'PUBLISHED',
        updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cms_versions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        page_id uuid NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
        version_number integer NOT NULL,
        content jsonb NOT NULL,
        change_summary text,
        published_by uuid REFERENCES users(id) ON DELETE SET NULL,
        published_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS cms_versions_page_idx ON cms_versions (page_id, version_number DESC);
    `);

    // 5. Create feature_flags table
    console.log('Creating feature_flags table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        key text NOT NULL UNIQUE,
        description text,
        enabled boolean NOT NULL DEFAULT true,
        rollout_percentage integer NOT NULL DEFAULT 100,
        environment text NOT NULL DEFAULT 'all',
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 6. Create ai_model_registry and ai_inference_logs tables
    console.log('Creating AI Inference Architecture tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_model_registry (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        task_type text NOT NULL UNIQUE,
        primary_model text NOT NULL,
        fallback_model text NOT NULL,
        latency_budget_ms integer NOT NULL DEFAULT 3000,
        cost_ceiling_cents integer NOT NULL DEFAULT 50,
        status text NOT NULL DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS ai_inference_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        agent_id text NOT NULL,
        task_type text NOT NULL,
        model_used text NOT NULL,
        prompt_version text NOT NULL DEFAULT 'v1.0',
        tokens_in integer NOT NULL DEFAULT 0,
        tokens_out integer NOT NULL DEFAULT 0,
        latency_ms integer NOT NULL DEFAULT 0,
        cost_dollars real NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'SUCCESS',
        cached boolean NOT NULL DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ai_inference_logs_task_idx ON ai_inference_logs (task_type, created_at DESC);
    `);

    // 7. Create system_incidents table
    console.log('Creating system_incidents table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_incidents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        title text NOT NULL,
        service text NOT NULL,
        severity text NOT NULL DEFAULT 'INFO',
        status text NOT NULL DEFAULT 'RESOLVED',
        timeline_json jsonb,
        created_at timestamp DEFAULT now() NOT NULL,
        resolved_at timestamp
      );
    `);

    console.log('✅ v3 Schema migration completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrateV3().catch((err) => {
  console.error('Migration v3 failed:', err);
  process.exit(1);
});
