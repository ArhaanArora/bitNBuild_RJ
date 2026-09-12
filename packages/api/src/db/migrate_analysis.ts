import 'dotenv/config';
import { Pool } from 'pg';

async function migrate() {
  console.log('Migrating project_analyses tables to database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "project_analyses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "project_id" uuid NOT NULL REFERENCES "public"."projects"("id") ON DELETE cascade,
        "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade,
        "status" text DEFAULT 'QUEUED' NOT NULL,
        "overall_score" real,
        "confidence" real,
        "verification_code" text UNIQUE,
        "breakdown_json" jsonb,
        "report_json" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "completed_at" timestamp
      );

      CREATE TABLE IF NOT EXISTS "analysis_agent_runs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "analysis_id" uuid NOT NULL REFERENCES "public"."project_analyses"("id") ON DELETE cascade,
        "agent_id" text NOT NULL,
        "agent_name" text NOT NULL,
        "status" text DEFAULT 'QUEUED' NOT NULL,
        "score" real,
        "weight" real DEFAULT 0 NOT NULL,
        "confidence" real,
        "summary" text,
        "duration_ms" integer,
        "created_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "analysis_findings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "analysis_id" uuid NOT NULL REFERENCES "public"."project_analyses"("id") ON DELETE cascade,
        "agent_id" text NOT NULL,
        "category" text NOT NULL,
        "title" text NOT NULL,
        "risk" text DEFAULT 'INFO' NOT NULL,
        "confidence" real DEFAULT 80 NOT NULL,
        "location" text NOT NULL,
        "detection_method" text NOT NULL,
        "reasoning" text NOT NULL,
        "false_positive_explanation" text,
        "recommendation" text NOT NULL,
        "evidence_snippet" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Analysis tables created successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
