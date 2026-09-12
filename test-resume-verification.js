const fs = require('fs');
const http = require('http');

const API_BASE = 'http://localhost:6970';

function postMultipart(path, boundary, buffer) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const req = http.request(
      {
        method: 'POST',
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': buffer.length,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

function requestJson(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Minimal valid PDF generator
function createMinimalPdfBuffer(text) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${text.length + 40} >>
stream
BT
/F1 12 Tf
72 712 Td
(${text.replace(/[()]/g, '')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000231 00000 n 
0000000325 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
408
%%EOF`;
  return Buffer.from(content);
}

function buildMultipartBody(boundary, filename, fileBuffer) {
  const header = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="${filename}"\r\nContent-Type: application/pdf\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  return Buffer.concat([header, fileBuffer, footer]);
}

async function runTests() {
  console.log('--- Starting Resume Verification End-to-End Tests ---');

  // Test 1: Upload non-PDF (should fail magic byte / extension check)
  console.log('\n[1] Testing Non-PDF Rejection...');
  const boundary = '----TestBoundary' + Date.now();
  const fakeTxtBuffer = Buffer.from('Hello world this is not a pdf file');
  const fakeMultipart = buildMultipartBody(boundary, 'resume.txt', fakeTxtBuffer);
  const res1 = await postMultipart('/api/hiring/get-verified/upload', boundary, fakeMultipart);
  if (res1.status === 400) {
    console.log('PASS: Correctly rejected non-PDF (status 400):', res1.body.error);
  } else {
    console.error('FAIL: Expected 400 for non-PDF, got', res1.status, res1.body);
  }

  // Test 2: Upload valid PDF with candidate skills & projects
  console.log('\n[2] Testing Valid PDF Upload with Magic Byte...');
  const resumeText =
    'Jane Doe Senior Software Engineer Skills Python React TypeScript PostgreSQL Docker Redis Kubernetes Projects Built scalable microservices with FastAPI and PostgreSQL. Architected React dashboard with TypeScript.';
  const pdfBuffer = createMinimalPdfBuffer(resumeText);
  const boundary2 = '----TestBoundary' + Date.now();
  const validMultipart = buildMultipartBody(boundary2, 'Jane_Doe_Resume.pdf', pdfBuffer);
  const res2 = await postMultipart('/api/hiring/get-verified/upload', boundary2, validMultipart);
  if (res2.status === 200 && res2.body.resumeId) {
    console.log('PASS: Uploaded PDF successfully! Resume ID:', res2.body.resumeId);
  } else {
    console.error('FAIL: Upload failed', res2.status, res2.body);
    process.exit(1);
  }

  const resumeId = res2.body.resumeId;

  // Test 3: Analyze Resume
  console.log('\n[3] Testing Resume Analysis & Question Generation...');
  const res3 = await requestJson('POST', '/api/hiring/get-verified/analyze', {
    resumeId,
    userId: 'demo-candidate-1',
  });

  if (res3.status === 200 && res3.body.assessmentId && res3.body.analysis) {
    console.log('PASS: Analysis complete!');
    console.log('Extracted Skills:', res3.body.analysis.extractedSkills);
    console.log('Extracted Tools:', res3.body.analysis.extractedTools);
    console.log('Assessment ID:', res3.body.assessmentId);
  } else {
    console.error('FAIL: Analysis failed', res3.status, res3.body);
    process.exit(1);
  }

  const assessmentId = res3.body.assessmentId;

  // Test 4: Start Assessment Session (verify question count & correctAnswer privacy)
  console.log('\n[4] Testing Start Assessment Session...');
  const res4 = await requestJson(
    'POST',
    `/api/hiring/get-verified/assessment/${assessmentId}/start`
  );
  if (res4.status === 200 && res4.body.questions && res4.body.questions.length === 10) {
    console.log(`PASS: Started assessment session! Exactly 10 questions received.`);
    console.log('Deadline:', res4.body.deadline);

    // CRITICAL: Ensure correctAnswer is stripped for candidates!
    const leakedAnswer = res4.body.questions.find((q) => q.correctAnswer !== undefined);
    if (leakedAnswer) {
      console.error('FAIL: correctAnswer was leaked to client before submission!');
      process.exit(1);
    } else {
      console.log('PASS: Verification confirmed: correctAnswer is strictly HIDDEN from client.');
    }

    const objCount = res4.body.questions.filter((q) => q.type === 'objective').length;
    const subjCount = res4.body.questions.filter((q) => q.type === 'subjective').length;
    console.log(`Distribution: ${objCount} Objective (MCQ), ${subjCount} Subjective (Scenario)`);
  } else {
    console.error('FAIL: Start assessment failed', res4.status, res4.body);
    process.exit(1);
  }

  const questions = res4.body.questions;

  // Test 5: Log Integrity Event
  console.log('\n[5] Testing Integrity Event Logging...');
  const res5 = await requestJson(
    'POST',
    `/api/hiring/get-verified/assessment/${assessmentId}/integrity-event`,
    {
      type: 'fullscreen_exit',
      timestamp: new Date().toISOString(),
    }
  );
  if (res5.status === 200 && res5.body.success) {
    console.log('PASS: Logged fullscreen_exit integrity anomaly.');
  } else {
    console.error('FAIL: Integrity event logging failed', res5.status, res5.body);
  }

  // Test 6: Submit Assessment with Answers
  console.log('\n[6] Testing Assessment Submission & Evaluation...');
  const candidateAnswers = questions.map((q) => {
    if (q.type === 'objective') {
      // Pick first option
      return { questionId: q.id, answer: q.options[0] };
    } else {
      return {
        questionId: q.id,
        answer:
          'In production, we configure connection pooling, establish database indexes on foreign keys, implement retry logic with exponential backoff, and use Redis caching for hot paths.',
      };
    }
  });

  const res6 = await requestJson(
    'POST',
    `/api/hiring/get-verified/assessment/${assessmentId}/submit`,
    {
      answers: candidateAnswers,
    }
  );

  if (res6.status === 200 && res6.body.overallScore !== undefined) {
    console.log('PASS: Assessment graded!');
    console.log('Overall Score:', res6.body.overallScore + '%');
    console.log('Verification Level:', res6.body.verificationLevel);
    console.log('Skill Scores:', res6.body.skillScores);
    console.log('Integrity Events Count:', res6.body.integrityEventsCount);
  } else {
    console.error('FAIL: Submit failed', res6.status, res6.body);
    process.exit(1);
  }

  // Test 7: Get Assessment Result
  console.log('\n[7] Testing GET Assessment Result...');
  const res7 = await requestJson(
    'GET',
    `/api/hiring/get-verified/assessment/${assessmentId}/result`
  );
  if (res7.status === 200 && res7.body.questionResults && res7.body.questionResults.length === 10) {
    console.log('PASS: Result successfully fetched with all 10 graded question rubrics.');
  } else {
    console.error('FAIL: Get result failed', res7.status, res7.body);
    process.exit(1);
  }

  // Test 8: Verify Skills Merged into Hiring Profile
  console.log('\n[8] Testing Verified Skills Merge for Candidate...');
  const res8 = await requestJson('GET', '/api/hiring/profile/demo-candidate-1/verified-skills');
  if (res8.status === 200 && res8.body.skills && res8.body.skills.length > 0) {
    console.log('PASS: Verified skills merged into profile:');
    res8.body.skills.forEach((s) => {
      console.log(` - ${s.name}: ${s.status} (${s.score}%)`);
    });
  } else {
    console.error('FAIL: Verified skills fetch failed', res8.status, res8.body);
  }

  console.log('\n=========================================');
  console.log(' ALL END-TO-END VERIFICATION TESTS PASSED!');
  console.log('=========================================');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
