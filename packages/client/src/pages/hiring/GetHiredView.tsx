import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiringSkill, UserHiringProfile } from '../../types/hiring';
import { ResumeAnalysis } from '../../types/resumeAssessment';
import {
  getUserHiringProfile,
  saveUserHiringProfile,
  toggleRecruiterDiscoverability,
} from '../../utils/hiringStorage';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import VerificationBadge from '../../components/common/VerificationBadge';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
  FileCheck2,
  Sparkles,
  Shield,
  Camera,
  Clock,
  Check,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GetHiredViewProps {
  onBack: () => void;
  onViewDiscovery: () => void;
}

const COMMON_SKILL_OPTIONS = [
  'Python',
  'React',
  'Node.js',
  'SQL',
  'TypeScript',
  'Figma',
  'UI/UX',
  'TensorFlow',
  'PostgreSQL',
  'Docker',
  'MongoDB',
  'TailwindCSS',
  'FastAPI',
  'Go',
];

export default function GetHiredView({ onBack, onViewDiscovery }: GetHiredViewProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mode: 'profile' (if activated) | 'upload' | 'analyzing' | 'instructions' | 'manual_form'
  const [viewMode, setViewMode] = useState<
    'profile' | 'upload' | 'analyzing' | 'instructions' | 'manual_form'
  >('upload');
  const [isActivated, setIsActivated] = useState(false);

  // Form State (Manual / Fallback)
  const [skills, setSkills] = useState<HiringSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    'Advanced'
  );

  // Resume Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedResumeMeta, setUploadedResumeMeta] = useState<{
    name: string;
    size: number;
    lastModified: number;
  } | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Analysis & Assessment State
  const [analysisStep, setAnalysisStep] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [agreedToProctoring, setAgreedToProctoring] = useState(false);

  // Recruiter Discoverability Toggle
  const [discoverability, setDiscoverability] = useState(true);
  const [credibilityScore, setCredibilityScore] = useState<number>(91);
  const [integrityRating, setIntegrityRating] = useState<string>('Low Concern');

  // 1. Load initial profile and verified skills
  useEffect(() => {
    const saved = getUserHiringProfile();
    if (saved && saved.activated) {
      setIsActivated(true);
      setSkills(saved.skills);
      setUploadedResumeMeta(saved.resume);
      setDiscoverability(saved.recruiterVisibility);
      if (saved.credibilityScore) setCredibilityScore(saved.credibilityScore);
      if (saved.integrityRating) setIntegrityRating(saved.integrityRating);
      setViewMode('profile');
      return;
    }

    const loadPlatformSkills = async () => {
      try {
        const userId = user?.id || 'demo-candidate-1';
        const res = await api
          .get(`/hiring/profile/${userId}/verified-skills`)
          .catch(() => ({ data: null }));

        if (res.data && res.data.skills && res.data.skills.length > 0) {
          const loaded: HiringSkill[] = res.data.skills.map((s: any) => ({
            name: s.name,
            status: s.status,
            score: s.score,
            selfDeclaredProficiency: 'Advanced',
            evidenceSummary: s.evidence,
          }));
          setSkills(loaded);
        } else {
          setSkills([
            { name: 'Python', status: 'VERIFIED', score: 94, selfDeclaredProficiency: 'Advanced' },
            { name: 'React', status: 'VERIFIED', score: 91, selfDeclaredProficiency: 'Advanced' },
            { name: 'SQL', status: 'CLAIMED', score: 80, selfDeclaredProficiency: 'Intermediate' },
          ]);
        }
      } catch {
        setSkills([
          { name: 'Python', status: 'VERIFIED', score: 94, selfDeclaredProficiency: 'Advanced' },
          { name: 'React', status: 'VERIFIED', score: 90, selfDeclaredProficiency: 'Advanced' },
        ]);
      }
    };
    loadPlatformSkills();
  }, [user]);

  // Handle Resume File Selection (Strict PDF, max 5MB)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict PDF validation
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setResumeError('Invalid file format. Please upload a PDF file (.pdf).');
      toast.error('Only PDF documents are accepted.');
      return;
    }

    // 5MB Limit
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setResumeError('File size exceeds the 5MB maximum limit.');
      toast.error('PDF exceeds 5MB size limit.');
      return;
    }

    setSelectedFile(file);
    setUploadedResumeMeta({
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
    });
    toast.success(`Selected ${file.name}`);
  };

  // Start AI Resume Analysis
  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF resume to analyze.');
      return;
    }

    setViewMode('analyzing');
    setAnalysisStep(1);

    try {
      // Step 1: Multipart upload
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const uploadRes = await api.post('/hiring/get-verified/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resumeId = uploadRes.data?.resumeId;
      if (!resumeId) {
        throw new Error('Upload did not return a valid resume ID.');
      }

      setAnalysisStep(2);

      // Step 2: Trigger AI analysis & assessment generation
      const userId = user?.id || 'demo-candidate-1';
      const analyzeRes = await api.post('/hiring/get-verified/analyze', {
        resumeId,
        userId,
      });

      setAnalysisStep(3);

      setTimeout(() => {
        setAnalysisResult(analyzeRes.data?.analysis || null);
        setAssessmentId(analyzeRes.data?.assessmentId || null);
        setViewMode('instructions');
        toast.success('Assessment generated successfully!');
      }, 600);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
      setViewMode('upload');
    }
  };

  // Start the Strict Assessment
  const handleLaunchAssessment = async () => {
    if (!assessmentId) return;
    if (!agreedToProctoring) {
      toast.error('Please acknowledge the proctoring conditions to begin.');
      return;
    }

    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    navigate(`/hiring/assessment/${assessmentId}`);
  };

  // Manual Skill Addition
  const handleAddSkill = (nameToAdd?: string) => {
    const sName = (nameToAdd || newSkillName).trim();
    if (!sName) return;

    if (skills.some((s) => s.name.toLowerCase() === sName.toLowerCase())) {
      toast.error(`"${sName}" is already in your skills list.`);
      return;
    }

    const newSkill: HiringSkill = {
      name: sName,
      status: 'CLAIMED',
      score: undefined,
      selfDeclaredProficiency: newProficiency,
      evidenceSummary: 'Self-declared by candidate; take the assessment to verify.',
    };

    setSkills([...skills, newSkill]);
    setNewSkillName('');
    toast.success(`Added ${sName}`);
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  // Save profile manually
  const handleSubmitManualProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) {
      toast.error('Please include at least one skill.');
      return;
    }

    const profile: UserHiringProfile = {
      skills,
      resume: uploadedResumeMeta || {
        name: `${user?.firstName || 'Candidate'}_Resume.pdf`,
        size: 1420000,
        lastModified: Date.now(),
      },
      recruiterVisibility: true,
      activated: true,
      updatedAt: new Date().toISOString(),
    };

    saveUserHiringProfile(profile);
    setIsActivated(true);
    setDiscoverability(true);
    setViewMode('profile');
    toast.success("Profile saved! You're now visible to recruiters.");
  };

  const handleToggleVisibility = () => {
    const newState = toggleRecruiterDiscoverability();
    setDiscoverability(newState);
    if (newState) {
      toast.success('Recruiter Discoverability: ON');
    } else {
      toast('Recruiter Discoverability: OFF');
    }
  };

  const verifiedCount = skills.filter((s) => s.status === 'VERIFIED').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in-up pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBack}
          className="text-[#A3A3A8] hover:text-[#F5F5F4] flex items-center gap-1.5 transition"
        >
          <span>← Back to Hiring Dashboard</span>
        </button>
        <span className="text-[#E8672E] font-medium font-mono text-[11px] uppercase tracking-wider">
          {viewMode === 'profile' ? 'Active Candidate Profile' : 'Skill Verification Pipeline'}
        </span>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. ACTIVATED PROFILE VIEW */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'profile' && isActivated && (
        <div className="bg-[#17171A] border border-[#2A2A2E] p-6 sm:p-8 rounded-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-[#3FB65F]" />

          <div className="flex items-start justify-between gap-4 pl-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#F5F5F4]">
                  You&apos;re visible to recruiters
                </h2>
                <p className="text-xs text-[#3FB65F] font-medium mt-0.5">
                  Your profile and verified evidence are discoverable in the hiring marketplace.
                </p>
              </div>
            </div>

            {/* Recruiter Visibility Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleVisibility}
              className={`text-xs py-1.5 px-3 rounded-lg border flex items-center gap-2 font-mono font-medium transition ${
                discoverability
                  ? 'bg-[#16261B] text-[#3FB65F] border-[#3FB65F]/40'
                  : 'bg-[#1E1E22] text-[#A3A3A8] border-[#2A2A2E]'
              }`}
            >
              {discoverability ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#3FB65F]" />
                  <span>Discoverability: ON</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#A3A3A8]" />
                  <span>Discoverability: OFF</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Callout Banner */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#1E1E22] to-[#1A1A1E] border border-[#E8672E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E8672E]/10 border border-[#E8672E]/30 flex items-center justify-center text-[#E8672E] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Verify More Skills with AI Assessment
                </h4>
                <p className="text-[11px] text-[#A3A3A8] mt-0.5 leading-relaxed">
                  Upload an updated PDF resume to extract skills and take a 10-question grounded
                  proctored assessment.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('upload')}
              className="btn-primary text-xs py-1.5 px-3 shrink-0 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Verify via Resume</span>
            </button>
          </div>

          {/* Profile Metrics Summary */}
          <div className="p-4 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-xl font-bold font-mono text-white">{skills.length}</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Total Skills</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#3FB65F]">{verifiedCount}</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Verified Skills</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#E8672E]">{credibilityScore}%</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Credibility Score</div>
            </div>
            <div>
              <div className="text-sm font-bold font-mono text-[#3FB65F] flex items-center justify-center gap-1 mt-1">
                <Shield className="w-3.5 h-3.5 text-[#3FB65F]" />
                <span>{integrityRating}</span>
              </div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium mt-1">Integrity Signals</div>
            </div>
          </div>

          {/* Active Skills Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A8]">
              Active Competencies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {skills.map((s) => (
                <div
                  key={s.name}
                  className="p-3 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-[#F5F5F4] text-xs block">{s.name}</span>
                    <span className="text-[10px] text-[#6B6B70]">
                      {s.score ? `Score: ${s.score}%` : `Self-declared: ${s.selfDeclaredProficiency || 'Advanced'}`}
                    </span>
                  </div>
                  <VerificationBadge status={s.status} score={s.score} />
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Resume */}
          {uploadedResumeMeta && (
            <div className="p-3.5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#E8672E]" />
                <div>
                  <span className="text-xs font-medium text-white block">
                    {uploadedResumeMeta.name}
                  </span>
                  <span className="text-[10px] text-[#6B6B70] font-mono">
                    {Math.round(uploadedResumeMeta.size / 1024)} KB · Active in Recruiter Radar
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('upload')}
                className="btn-ghost text-xs py-1 px-2.5"
              >
                Upload New
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-[#2A2A2E] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onViewDiscovery}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
            >
              <span>View In Recruiter Discovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('manual_form')}
                className="btn-secondary text-xs py-2 px-3"
              >
                Edit Skills
              </button>
              <button type="button" onClick={onBack} className="btn-ghost text-xs py-2 px-3">
                Back to Hiring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. RESUME UPLOAD STEP (Candidate Upload Screen) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'upload' && (
        <div className="bg-[#17171A] border border-[#2A2A2E] p-6 sm:p-8 rounded-xl space-y-6">
          <div className="border-b border-[#2A2A2E] pb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] tracking-wider uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>STEP 1 · RESUME VERIFICATION PIPELINE</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#F5F5F4] tracking-tight">
              Upload your resume to get verified.
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A8] mt-1 leading-relaxed">
              SkillVerify will extract your claimed technical skills and generate a grounded 10-question
              assessment. Passing attaches verified badges directly to your profile.
            </p>
          </div>

          <div className="space-y-4">
            {selectedFile ? (
              <div className="p-4 rounded-xl bg-[#1E1E22] border border-[#3FB65F]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F]">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-[#6B6B70] font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · PDF Validated
                    </span>
                  </div>
                </div>
                <label className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
                  <span>Replace</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#2A2A2E] hover:border-[#E8672E] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#1E1E22]/40 block">
                <Upload className="w-8 h-8 text-[#A3A3A8] mb-2" />
                <span className="text-sm font-medium text-[#F5F5F4] block">
                  Click or drag your PDF resume here
                </span>
                <span className="text-xs text-[#6B6B70] font-mono mt-1">
                  PDF only · Maximum 5MB
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}

            {resumeError && (
              <div className="p-3 rounded-lg bg-[#2A1717] border border-[#E0554E]/40 text-xs text-[#E0554E] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resumeError}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#2A2A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setViewMode('manual_form')}
              className="text-xs text-[#A3A3A8] hover:text-white underline text-left"
            >
              Or enter skills manually without resume
            </button>

            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={!selectedFile}
              className="btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Resume & Generate Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. ANALYZING STEP (Pulse / Progress Screen) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'analyzing' && (
        <div className="bg-[#17171A] border border-[#2A2A2E] p-8 sm:p-12 rounded-xl text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin mx-auto" />
            <Sparkles className="w-6 h-6 text-[#E8672E] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {analysisStep === 1 && 'Extracting skills and projects from resume...'}
              {analysisStep === 2 && 'Grounding technical questions against your background...'}
              {analysisStep === 3 && 'Synthesizing 10-question proctored assessment...'}
            </h3>
            <p className="text-xs text-[#A3A3A8] font-mono">
              Step {analysisStep} of 3 · Calibrating objective and scenario-based questions
            </p>
          </div>

          <div className="max-w-xs mx-auto flex items-center justify-between gap-2 pt-2">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                analysisStep >= 1 ? 'bg-[#E8672E]' : 'bg-[#2A2A2E]'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                analysisStep >= 2 ? 'bg-[#E8672E]' : 'bg-[#2A2A2E]'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                analysisStep >= 3 ? 'bg-[#E8672E]' : 'bg-[#2A2A2E]'
              }`}
            />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 4. INSTRUCTIONS SCREEN (Section 2 of Brief) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'instructions' && (
        <div className="bg-[#17171A] border border-[#2A2A2E] p-6 sm:p-8 rounded-xl space-y-6">
          <div className="border-b border-[#2A2A2E] pb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] tracking-wider uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>STEP 2 · ASSESSMENT INSTRUCTIONS & PROCTORING</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#F5F5F4] tracking-tight">
              Ready to verify your skills.
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A8] mt-1">
              Review your extracted skills and the proctored assessment conditions before starting.
            </p>
          </div>

          {/* Card 1: Resume Analysis Summary */}
          {analysisResult && (
            <div className="p-5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A8]">
                  Extracted Technical Profile
                </h3>
                <span className="text-xs font-mono text-[#3FB65F] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Resume Grounded
                </span>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#6B6B70] block">Target Skills for Verification:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.extractedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded bg-[#17171A] border border-[#E8672E]/40 text-[#F5F5F4] text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tools */}
              {analysisResult.extractedTools.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-[#6B6B70] block">Identified Tools & Libraries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.extractedTools.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-[#17171A] border border-[#2A2A2E] text-[#A3A3A8] text-[11px] font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 2: Assessment Rules & Proctoring Disclosure */}
          <div className="p-5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A8]">
              Assessment Rules & Integrity Standards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#E8672E]" />
                  <span>60-Minute Hard Limit</span>
                </div>
                <p className="text-[11px] text-[#6B6B70]">
                  Timer is enforced server-side. Assessment auto-submits upon expiry.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Shield className="w-3.5 h-3.5 text-[#E8672E]" />
                  <span>10 Grounded Questions</span>
                </div>
                <p className="text-[11px] text-[#6B6B70]">
                  Mix of objective technical MCQs and real-world scenario responses.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Camera className="w-3.5 h-3.5 text-[#3FB65F]" />
                  <span>Local Camera Self-Monitor</span>
                </div>
                <p className="text-[11px] text-[#6B6B70]">
                  Rendered strictly in your browser. SkillVerify does not stream or record video.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ArrowRight className="w-3.5 h-3.5 text-[#E8672E]" />
                  <span>Forward-Only Navigation</span>
                </div>
                <p className="text-[11px] text-[#6B6B70]">
                  One question at a time. Answers cannot be changed once submitted.
                </p>
              </div>
            </div>

            {/* Acknowledgment Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToProctoring}
                  onChange={(e) => setAgreedToProctoring(e.target.checked)}
                  className="mt-0.5 rounded border-[#2A2A2E] bg-[#17171A] text-[#E8672E] focus:ring-0"
                />
                <span className="text-xs text-[#A3A3A8] leading-relaxed">
                  I understand the assessment conditions, forward-only navigation, and agree to the
                  integrity monitoring.
                </span>
              </label>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#2A2A2E] flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setViewMode('upload')}
              className="btn-ghost text-xs py-2 px-3"
            >
              Back to Upload
            </button>

            <button
              type="button"
              onClick={handleLaunchAssessment}
              disabled={!agreedToProctoring}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 5. MANUAL FORM FALLBACK (Self-declare skills without assessment) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'manual_form' && (
        <div className="bg-[#17171A] border border-[#2A2A2E] p-6 sm:p-8 rounded-xl space-y-6">
          <div className="border-b border-[#2A2A2E] pb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] tracking-wider uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>MANUAL PROFILE CONFIGURATION</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#F5F5F4] tracking-tight">
              Self-declare your skills.
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A8] mt-1">
              Add skills manually. Note: Recruiter ranking prioritizes candidates with verified badges.
            </p>
          </div>

          <form onSubmit={handleSubmitManualProfile} className="space-y-6">
            <div className="p-5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Your Skills</h3>
                  <p className="text-[11px] text-[#A3A3A8]">
                    Self-declare proficiency. Platform verification requires taking the assessment.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#E8672E]">{skills.length} skills</span>
              </div>

              {/* Skills List */}
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{skill.name}</span>
                        <span className="text-[10px] text-[#A3A3A8] font-mono">
                          Level: <strong className="text-white">{skill.selfDeclaredProficiency || 'Advanced'}</strong>
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B6B70] font-mono mt-0.5 flex items-center gap-1.5">
                        <span>Status:</span>
                        <VerificationBadge status={skill.status} score={skill.score} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-[#6B6B70] hover:text-[#E0554E] p-1.5 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Skill */}
              <div className="pt-3 border-t border-[#2A2A2E] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name..."
                    className="input text-xs sm:col-span-2"
                  />
                  <select
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(e.target.value as any)}
                    className="input text-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {COMMON_SKILL_OPTIONS.slice(0, 5).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAddSkill(opt)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#17171A] text-[#A3A3A8] border border-[#2A2A2E] hover:border-[#38383D] hover:text-white transition"
                      >
                        + {opt}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    disabled={!newSkillName.trim()}
                    className="btn-secondary text-xs disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-[#2A2A2E] flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setViewMode(isActivated ? 'profile' : 'upload')}
                className="btn-ghost text-xs py-2 px-3"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={skills.length === 0}
                className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer"
              >
                <span>Save Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
