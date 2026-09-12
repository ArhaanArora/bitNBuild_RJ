# ADR 001: Retention of PostgreSQL on Neon Serverless with Drizzle ORM

## Status
Accepted

## Context
The project requires a production-grade relational database capable of handling:
1. Relational consistency for users, hackathon teams, and assessment attempts.
2. JSONB semi-structured storage for dynamic 12-agent verification breakdowns, skill aliases, and proctoring metadata.
3. High availability and automated branching for continuous integration.

While Section 47 notes general dialect rules, changing the active, tested database engine from PostgreSQL on Neon to another engine (such as MySQL or SQLite) would break existing JSONB operators, UUID primary keys, and established migrations.

## Decision
We retain **PostgreSQL hosted on Neon Serverless** with **Drizzle ORM** (`drizzle-orm/node-postgres` and `pg.Pool`).

Key implementation details:
- Connection pool with strict SSL mode (`rejectUnauthorized: false` or `sslmode=require`).
- Explicit migration runners (`migrate.ts`, `migrate_analysis.ts`, `migrate_v2.ts`) executing DDL transactions.
- Strongly-typed Drizzle schema exporting `$inferSelect` and `$inferInsert` types.

## Consequences
- **Positive**: Native JSONB indexing on `skills.aliases` and `project_analyses.breakdown_json`.
- **Positive**: Zero vendor churn; existing Neon database instance continues serving production queries without data loss.
- **Positive**: Strong ACID guarantees across team invitations, member joins, and assessment submissions.
- **Negative**: Requires careful handling of SSL modes in node-postgres across Node.js versions.
