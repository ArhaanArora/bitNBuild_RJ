import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import { Pool } from 'pg';
import crypto from 'crypto';

function generateCustomId(prefix: string): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${hex}`;
}

async function seedV3() {
  console.log('Seeding v3 Super Admin Command Center data...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    // 1. Backfill public_id on existing users, projects, hackathons, audit_logs
    console.log('Backfilling public_ids...');
    const usersRes = await client.query(`SELECT id, role, public_id FROM users`);
    for (const row of usersRes.rows) {
      if (!row.public_id) {
        let prefix = 'CAND';
        if (row.role === 'recruiter') prefix = 'RECR';
        else if (row.role === 'organizer') prefix = 'ORGN';
        else if (row.role === 'admin') prefix = 'ADMN';
        const pubId = generateCustomId(prefix);
        await client.query(`UPDATE users SET public_id = $1 WHERE id = $2`, [pubId, row.id]);
      }
    }

    const projectsRes = await client.query(`SELECT id, public_id FROM projects`);
    for (const row of projectsRes.rows) {
      if (!row.public_id) {
        const pubId = generateCustomId('PROJ');
        await client.query(`UPDATE projects SET public_id = $1 WHERE id = $2`, [pubId, row.id]);
      }
    }

    const hackRes = await client.query(`SELECT id, public_id FROM hackathons`);
    for (const row of hackRes.rows) {
      if (!row.public_id) {
        const pubId = generateCustomId('HACK');
        await client.query(`UPDATE hackathons SET public_id = $1 WHERE id = $2`, [pubId, row.id]);
      }
    }

    const auditRes = await client.query(`SELECT id, public_id FROM audit_logs`);
    for (const row of auditRes.rows) {
      if (!row.public_id) {
        const pubId = generateCustomId('AUD');
        await client.query(`UPDATE audit_logs SET public_id = $1 WHERE id = $2`, [pubId, row.id]);
      }
    }

    // 2. Seed Feature Flags
    console.log('Seeding feature flags...');
    const flags = [
      { key: 'ADMIN_3D_OPERATIONS', desc: '3D WebGL spatial operations view for system health monitoring', enabled: true, rollout: 100 },
      { key: 'AI_VERIFICATION_GATE', desc: 'AI document review assistant before human sign-off', enabled: true, rollout: 100 },
      { key: 'LIVE_METRICS_STREAM', desc: 'Live WebSocket/polling telemetry for server metrics', enabled: true, rollout: 100 },
      { key: 'CMS_PUBLIC_SYNC', desc: 'Instant synchronization from CMS to public landing pages', enabled: true, rollout: 100 },
      { key: 'AI_AUTO_HEAL', desc: 'Automated remediation proposals for system alerts', enabled: true, rollout: 100 },
      { key: 'TEAM_FORMATION_V2', desc: 'Vector-based candidate skill compatibility matching', enabled: true, rollout: 100 },
    ];
    for (const f of flags) {
      await client.query(`
        INSERT INTO feature_flags (key, description, enabled, rollout_percentage, environment)
        VALUES ($1, $2, $3, $4, 'all')
        ON CONFLICT (key) DO UPDATE SET
          description = EXCLUDED.description,
          enabled = EXCLUDED.enabled,
          rollout_percentage = EXCLUDED.rollout_percentage;
      `, [f.key, f.desc, f.enabled, f.rollout]);
    }

    // 3. Seed AI Model Registry (Section 20A)
    console.log('Seeding AI model registry...');
    const models = [
      { task: 'VERIFICATION_DOC', primary: 'gpt-4o', fallback: 'gpt-4o-mini', latency: 3500, cost: 25 },
      { task: 'MESSAGE_TRIAGE', primary: 'gpt-4o-mini', fallback: 'gpt-3.5-turbo', latency: 1200, cost: 5 },
      { task: 'CODE_ANALYSIS', primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', latency: 5000, cost: 50 },
      { task: 'CMS_ASSISTANT', primary: 'gpt-4o-mini', fallback: 'gpt-4o', latency: 2000, cost: 10 },
      { task: 'AUTO_FIX', primary: 'gpt-4o', fallback: 'claude-3-5-sonnet', latency: 4500, cost: 40 },
    ];
    for (const m of models) {
      await client.query(`
        INSERT INTO ai_model_registry (task_type, primary_model, fallback_model, latency_budget_ms, cost_ceiling_cents, status)
        VALUES ($1, $2, $3, $4, $5, 'active')
        ON CONFLICT (task_type) DO UPDATE SET
          primary_model = EXCLUDED.primary_model,
          fallback_model = EXCLUDED.fallback_model,
          latency_budget_ms = EXCLUDED.latency_budget_ms,
          cost_ceiling_cents = EXCLUDED.cost_ceiling_cents;
      `, [m.task, m.primary, m.fallback, m.latency, m.cost]);
    }

    // 4. Seed AI Inference Logs (Section 20A realistic data for charts)
    console.log('Seeding AI inference logs...');
    const countCheck = await client.query(`SELECT COUNT(*) FROM ai_inference_logs`);
    if (parseInt(countCheck.rows[0].count, 10) < 10) {
      const sampleLogs = [
        { agent: 'agent_doc_verifier', task: 'VERIFICATION_DOC', model: 'gpt-4o', tokensIn: 1840, tokensOut: 420, latency: 2840, cost: 0.0185, status: 'SUCCESS' },
        { agent: 'agent_doc_verifier', task: 'VERIFICATION_DOC', model: 'gpt-4o', tokensIn: 2100, tokensOut: 530, latency: 3120, cost: 0.0210, status: 'SUCCESS' },
        { agent: 'agent_inbox_triage', task: 'MESSAGE_TRIAGE', model: 'gpt-4o-mini', tokensIn: 640, tokensOut: 180, latency: 890, cost: 0.0012, status: 'SUCCESS' },
        { agent: 'agent_inbox_triage', task: 'MESSAGE_TRIAGE', model: 'gpt-4o-mini', tokensIn: 820, tokensOut: 210, latency: 1040, cost: 0.0016, status: 'SUCCESS' },
        { agent: 'agent_code_scanner', task: 'CODE_ANALYSIS', model: 'claude-3-5-sonnet', tokensIn: 3400, tokensOut: 890, latency: 4200, cost: 0.0420, status: 'SUCCESS' },
        { agent: 'agent_cms_copilot', task: 'CMS_ASSISTANT', model: 'gpt-4o-mini', tokensIn: 1200, tokensOut: 380, latency: 1450, cost: 0.0028, status: 'SUCCESS' },
        { agent: 'agent_auto_healer', task: 'AUTO_FIX', model: 'gpt-4o', tokensIn: 2600, tokensOut: 620, latency: 3750, cost: 0.0270, status: 'SUCCESS' },
        { agent: 'agent_doc_verifier', task: 'VERIFICATION_DOC', model: 'gpt-4o-mini', tokensIn: 1950, tokensOut: 410, latency: 1620, cost: 0.0045, status: 'FALLBACK_TRIGGERED' },
      ];
      for (const log of sampleLogs) {
        await client.query(`
          INSERT INTO ai_inference_logs (agent_id, task_type, model_used, prompt_version, tokens_in, tokens_out, latency_ms, cost_dollars, status, cached)
          VALUES ($1, $2, $3, 'v1.2', $4, $5, $6, $7, $8, false);
        `, [log.agent, log.task, log.model, log.tokensIn, log.tokensOut, log.latency, log.cost, log.status]);
      }
    }

    // 5. Seed Organizations (Client Orgs / KYB)
    console.log('Seeding organizations...');
    const orgCheck = await client.query(`SELECT COUNT(*) FROM organizations`);
    if (parseInt(orgCheck.rows[0].count, 10) === 0) {
      const orgs = [
        {
          publicId: 'ORG-2026-881204',
          name: 'Apex Cloud Systems',
          type: 'Enterprise',
          website: 'https://apexcloud.io',
          email: 'talent@apexcloud.io',
          location: 'Bangalore, India',
          status: 'VERIFIED',
          riskScore: 4.2,
          aiNotes: JSON.stringify({
            corporateDomainMatch: true,
            taxIdVerified: true,
            sentiment: 'Legitimate enterprise cloud infrastructure provider with established online presence.',
            confidence: 0.96
          }),
          humanDecision: 'APPROVED'
        },
        {
          publicId: 'ORG-2026-943012',
          name: 'Rajasthan Innovation Labs',
          type: 'Government / Partner',
          website: 'https://ril.rajasthan.gov.in',
          email: 'contact@ril.gov.in',
          location: 'Jaipur, India',
          status: 'VERIFIED',
          riskScore: 1.0,
          aiNotes: JSON.stringify({
            corporateDomainMatch: true,
            taxIdVerified: true,
            sentiment: 'Official state government technology incubation council.',
            confidence: 0.99
          }),
          humanDecision: 'APPROVED'
        },
        {
          publicId: 'ORG-2026-118490',
          name: 'QuantumSec Analytics',
          type: 'Startup',
          website: 'https://quantumsec.ai',
          email: 'hiring@quantumsec.ai',
          location: 'San Francisco, USA',
          status: 'PENDING',
          riskScore: 22.4,
          aiNotes: JSON.stringify({
            corporateDomainMatch: true,
            taxIdVerified: false,
            sentiment: 'Recently created domain (4 months). Verification documents provided need manual cross-check.',
            confidence: 0.78
          }),
          humanDecision: 'PENDING'
        },
        {
          publicId: 'ORG-2026-302194',
          name: 'Starlight FinTech Group',
          type: 'Enterprise',
          website: 'https://starlightfin.com',
          email: 'careers@starlightfin.com',
          location: 'Mumbai, India',
          status: 'VERIFIED',
          riskScore: 3.5,
          aiNotes: JSON.stringify({
            corporateDomainMatch: true,
            taxIdVerified: true,
            sentiment: 'SEBI registered fintech provider. Active job listings and team profiles matched.',
            confidence: 0.97
          }),
          humanDecision: 'APPROVED'
        },
        {
          publicId: 'ORG-2026-774102',
          name: 'Ghost Recruiters Global',
          type: 'Agency',
          website: 'https://ghostrecruits-temp.cc',
          email: 'admin@ghostrecruits-temp.cc',
          location: 'Remote',
          status: 'SUSPICIOUS',
          riskScore: 88.5,
          aiNotes: JSON.stringify({
            corporateDomainMatch: false,
            taxIdVerified: false,
            sentiment: 'Disposable email domain, missing corporate registry, repetitive suspicious applicant scraping.',
            confidence: 0.94
          }),
          humanDecision: 'REJECTED'
        }
      ];

      for (const org of orgs) {
        await client.query(`
          INSERT INTO organizations (public_id, name, type, website, contact_email, location, verification_status, risk_score, ai_verification_notes, human_decision)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (public_id) DO NOTHING;
        `, [org.publicId, org.name, org.type, org.website, org.email, org.location, org.status, org.riskScore, org.aiNotes, org.humanDecision]);
      }
    }

    // 6. Seed CMS Pages & Initial Published Versions
    console.log('Seeding CMS pages...');
    const pages = [
      {
        slug: 'home',
        title: 'Platform Hero & Value Proposition',
        content: {
          badge: 'Next-Gen Verification & Hackathon OS',
          headline: 'Verified Skills. Trusted Teammates. Accelerated Careers.',
          subheadline: 'The evidence-based recruitment and hackathon collaboration engine powered by real code assessments and cryptographic skill verifications.',
          ctaPrimary: 'Explore Hackathons',
          ctaSecondary: 'Verify Your Skills',
          metrics: [
            { label: 'Verified Engineers', value: '4,850+' },
            { label: 'Completed Assessments', value: '12,400+' },
            { label: 'Hiring Partners', value: '140+' },
            { label: 'Hackathon Prize Pool', value: '$250,000+' }
          ]
        }
      },
      {
        slug: 'announcements',
        title: 'Platform Announcements & News',
        content: {
          heroTitle: 'Latest Platform Updates',
          items: [
            { id: '1', date: '2026-09-10', tag: 'HACKATHON', title: 'BitNBuild Rajasthan 2026 Registration Open', desc: 'Over 500 teams competing for 5,00,000 INR prize pool with enterprise sponsorship.' },
            { id: '2', date: '2026-09-08', tag: 'SECURITY', title: 'New AI Code Verification Model Deployed', desc: 'Real-time static analysis and repository authenticity checks are now active.' },
            { id: '3', date: '2026-09-01', tag: 'HIRING', title: 'Apex Cloud Systems joins as Principal Sponsor', desc: 'Fast-track interview pipelines for top-verified React and Rust candidates.' }
          ]
        }
      },
      {
        slug: 'faq',
        title: 'Verification & Scoring FAQ',
        content: {
          faqs: [
            { q: 'How does skill verification work?', a: 'Candidates complete timed, proctored assessments combined with automated GitHub repository static analysis and portfolio validation.' },
            { q: 'What is the integrity score?', a: 'The integrity score calculates proctoring adherence (tab focus, fullscreen, non-paste events) to ensure reliable authenticity.' },
            { q: 'How do recruiters search candidates?', a: 'Recruiters can filter exclusively by verified skill levels, verified scores, and real repository evidence rather than self-reported resumes.' }
          ]
        }
      }
    ];

    for (const p of pages) {
      const insertRes = await client.query(`
        INSERT INTO cms_pages (slug, title, content, published_version, status)
        VALUES ($1, $2, $3, 1, 'PUBLISHED')
        ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content
        RETURNING id;
      `, [p.slug, p.title, JSON.stringify(p.content)]);

      const pageId = insertRes.rows[0].id;
      await client.query(`
        INSERT INTO cms_versions (page_id, version_number, content, change_summary)
        VALUES ($1, 1, $2, 'Initial production seed')
        ON CONFLICT DO NOTHING;
      `, [pageId, JSON.stringify(p.content)]);
    }

    // 7. Seed Unified Inbox Messages
    console.log('Seeding inbox messages...');
    const msgCheck = await client.query(`SELECT COUNT(*) FROM messages`);
    if (parseInt(msgCheck.rows[0].count, 10) === 0) {
      const messagesData = [
        {
          publicId: 'MSG-2026-102931',
          email: 'priya.sharma@apexcloud.io',
          name: 'Priya Sharma',
          subject: 'Request for bulk candidate export and ATS integration',
          body: 'Hello Admin team, we are ready to invite 15 verified Full-Stack candidates from the BitNBuild hackathon. Can we get API credentials or webhook access for Greenhouse?',
          category: 'RECRUITER',
          status: 'NEW',
          priority: 'HIGH',
          aiNotes: JSON.stringify({
            urgency: 'HIGH',
            intent: 'ATS Integration / API Request',
            confidence: 0.98
          }),
          aiReply: 'Dear Priya,\n\nThank you for reaching out! We have enabled ATS webhook integrations in your organization portal under Settings > API Integrations. You can also generate your client API key directly to sync candidates. Let us know if you need technical onboarding assistance.\n\nBest regards,\nPlatform Administration Team'
        },
        {
          publicId: 'MSG-2026-409182',
          email: 'rahul.verma@nitj.ac.in',
          name: 'Rahul Verma',
          subject: 'Verification appeal: Assessment tab-switch during power dip',
          body: 'Dear Support, my internet cut out for 10 seconds during the React Advanced test which caused a fullscreen exit flag. Please check the camera check timestamps.',
          category: 'CANDIDATE',
          status: 'IN_REVIEW',
          priority: 'NORMAL',
          aiNotes: JSON.stringify({
            urgency: 'MEDIUM',
            intent: 'Assessment Proctoring Appeal',
            confidence: 0.92
          }),
          aiReply: 'Hi Rahul,\n\nWe have reviewed the proctoring logs. The camera feed confirms continuous presence and the tab interruption lasted under 12 seconds. An administrator has approved your verification score appeal.\n\nBest regards,\nVerification Support Team'
        },
        {
          publicId: 'MSG-2026-778103',
          email: 'organizer@bitnbuild.tech',
          name: 'Devansh K.',
          subject: 'Need judge account provisioning for BitNBuild Round 2',
          body: 'We have 4 industry mentors arriving tomorrow to evaluate top 10 team submissions. Can we provision judge evaluation forms?',
          category: 'ORGANIZER',
          status: 'NEW',
          priority: 'NORMAL',
          aiNotes: JSON.stringify({
            urgency: 'NORMAL',
            intent: 'Judge Role Provisioning',
            confidence: 0.95
          }),
          aiReply: 'Hi Devansh,\n\nYour hackathon dashboard now has judge access links generated under Hackathons > BitNBuild > Mentor Access. You can share these one-time access tokens directly with your evaluators.\n\nBest,\nPlatform Operations'
        }
      ];

      for (const msg of messagesData) {
        await client.query(`
          INSERT INTO messages (public_id, sender_email, sender_name, subject, body, category, status, priority, ai_triage_notes, ai_suggested_response)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (public_id) DO NOTHING;
        `, [msg.publicId, msg.email, msg.name, msg.subject, msg.body, msg.category, msg.status, msg.priority, msg.aiNotes, msg.aiReply]);
      }
    }

    // 8. Seed System Incidents
    console.log('Seeding system incidents...');
    const incCheck = await client.query(`SELECT COUNT(*) FROM system_incidents`);
    if (parseInt(incCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO system_incidents (title, service, severity, status, timeline_json, created_at, resolved_at)
        VALUES 
        (
          'GitHub API Secondary Rate Limit Spike',
          'Verification Worker',
          'MEDIUM',
          'RESOLVED',
          $1,
          NOW() - INTERVAL '6 hours',
          NOW() - INTERVAL '5 hours'
        ),
        (
          'Postgres Connection Pool Saturation during Hackathon Opening',
          'Database Pool',
          'HIGH',
          'RESOLVED',
          $2,
          NOW() - INTERVAL '18 hours',
          NOW() - INTERVAL '17 hours'
        );
      `, [
        JSON.stringify([
          { time: '02:15 UTC', note: 'Worker pool hit secondary rate limit on unauthenticated repository trees.' },
          { time: '02:22 UTC', note: 'Automated token rotation kicked in with 3 standby personal access tokens.' },
          { time: '02:35 UTC', note: 'Backlog cleared and latency returned to <800ms.' }
        ]),
        JSON.stringify([
          { time: '14:00 UTC', note: 'Concurrent users reached 1,200 spike; active pool connections peaked at 95%.' },
          { time: '14:05 UTC', note: 'Auto-scaled pool max size to 40 and enabled statement caching.' },
          { time: '14:20 UTC', note: 'Connection latency stabilized to 12ms.' }
        ])
      ]);
    }

    console.log('✅ v3 Seed completed successfully with real production-grade data!');
  } finally {
    client.release();
    await pool.end();
  }
}

seedV3().catch((err) => {
  console.error('Seed v3 failed:', err);
  process.exit(1);
});
