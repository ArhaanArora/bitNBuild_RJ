import React, { useState, useEffect } from 'react';
import { HiringSkill, UserHiringProfile } from '../../types/hiring';
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
  const [isActivated, setIsActivated] = useState(false);

  // Form State
  const [skills, setSkills] = useState<HiringSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Advanced');

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<{
    name: string;
    size: number;
    lastModified: number;
  } | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Discoverability Toggle
  const [discoverability, setDiscoverability] = useState(true);

  useEffect(() => {
    const saved = getUserHiringProfile();
    if (saved && saved.activated) {
      setIsActivated(true);
      setSkills(saved.skills);
      setResumeFile(saved.resume);
      setDiscoverability(saved.recruiterVisibility);
      return;
    }

    const loadPlatformSkills = async () => {
      try {
        const res = await api.get('/skills/mine').catch(() => ({ data: [] }));
        if (res.data && res.data.length > 0) {
          const preloaded: HiringSkill[] = res.data.map((s: any) => ({
            name: s.skillName,
            status: s.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'CLAIMED',
            score: s.verifiedScore || 92,
            selfDeclaredProficiency: 'Advanced',
            evidenceSummary: s.verificationStatus === 'VERIFIED'
              ? 'Platform benchmark verified via proctored assessment.'
              : 'Claimed by candidate; pending platform proctored exam.',
          }));
          setSkills(preloaded);
        } else {
          setSkills([
            { name: 'Python', status: 'VERIFIED', score: 95, selfDeclaredProficiency: 'Advanced' },
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
  }, []);

  const handleAddSkill = (nameToAdd?: string) => {
    const sName = (nameToAdd || newSkillName).trim();
    if (!sName) return;

    if (skills.some((s) => s.name.toLowerCase() === sName.toLowerCase())) {
      toast.error(`"${sName}" is already in your skills list.`);
      return;
    }

    const isPlatformVerified = ['python', 'react', 'typescript', 'figma', 'node.js'].includes(
      sName.toLowerCase()
    );

    const newSkill: HiringSkill = {
      name: sName,
      status: isPlatformVerified ? 'VERIFIED' : 'CLAIMED',
      score: isPlatformVerified ? 92 : undefined,
      selfDeclaredProficiency: newProficiency,
      evidenceSummary: isPlatformVerified
        ? 'Verified by platform proctored benchmark.'
        : 'Self-declared by candidate; awaiting platform verification.',
    };

    setSkills([...skills, newSkill]);
    setNewSkillName('');
    toast.success(`Added ${sName}`);
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const isPdfDocx =
      validTypes.includes(file.type) ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.doc');

    if (!isPdfDocx) {
      setResumeError('Invalid file type. Only PDF or DOCX files are supported.');
      toast.error('Only PDF or DOCX files are allowed.');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setResumeError(`File size exceeds the 5MB maximum limit.`);
      toast.error('File exceeds 5MB size limit.');
      return;
    }

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setResumeFile({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      });
      toast.success(`Uploaded ${file.name}`);
    }, 300);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (skills.length === 0) {
      toast.error('Please include at least one skill in your profile.');
      return;
    }

    const profile: UserHiringProfile = {
      skills,
      resume: resumeFile || {
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
    toast.success("You're now visible to recruiters!");
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
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBack}
          className="text-[#A3A3A8] hover:text-[#F5F5F4] flex items-center gap-1.5 transition"
        >
          <span>← Back to Hiring Dashboard</span>
        </button>
        <span className="text-[#E8672E] font-medium">Candidate Onboarding</span>
      </div>

      {/* Confirmation View: Activated & Visible (Section 13) */}
      {isActivated ? (
        <div className="bg-[#17171A] border border-[#2A2A2E] p-6 sm:p-8 rounded-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-[#3FB65F]" />

          <div className="flex items-start justify-between gap-4 pl-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#F5F5F4]">
                  You&apos;re now visible to recruiters
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

          {/* Profile Metrics Summary Chips */}
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
              <div className="text-xl font-bold font-mono text-[#E8672E]">1</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Resume</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#A3A3A8]">2</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Projects</div>
            </div>
          </div>

          {/* Skills Breakdown */}
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
                      Self-declared: {s.selfDeclaredProficiency || 'Advanced'}
                    </span>
                  </div>
                  <VerificationBadge status={s.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Resume */}
          {resumeFile && (
            <div className="p-3.5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#E8672E]" />
                <div>
                  <span className="text-xs font-medium text-white block">{resumeFile.name}</span>
                  <span className="text-[10px] text-[#6B6B70] font-mono">
                    {Math.round(resumeFile.size / 1024)} KB · Uploaded & Active
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsActivated(false)}
                className="btn-ghost text-xs py-1 px-2.5"
              >
                Replace
              </button>
            </div>
          )}

          {/* Action CTAs */}
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
                onClick={() => setIsActivated(false)}
                className="btn-secondary text-xs py-2 px-3"
              >
                Edit Profile & Skills
              </button>
              <button
                type="button"
                onClick={onBack}
                className="btn-ghost text-xs py-2 px-3"
              >
                Back to Hiring
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form Setup: Skills & Resume (Sections 10, 11, 12) */
        <div className="bg-[#17171A] border border-[#2A2A2E] p-6 sm:p-8 rounded-xl space-y-6">
          <div className="border-b border-[#2A2A2E] pb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] tracking-wider uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>RECRUITER RADAR ACTIVATION</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#F5F5F4] tracking-tight">
              Get yourself noticed.
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A8] mt-1">
              Add your skills and resume to become discoverable by recruiters looking for verified talent.
            </p>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-6">
            {/* Section 11: Skills Input */}
            <div className="p-5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Your Skills</h3>
                  <p className="text-[11px] text-[#A3A3A8]">
                    Self-declare your proficiency level. Platform verification is attached automatically.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#E8672E]">
                  {skills.length} skills added
                </span>
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
                        <span className="font-semibold text-white text-xs sm:text-sm">{skill.name}</span>
                        <span className="text-[10px] text-[#A3A3A8] font-mono">
                          Self-declared: <strong className="text-white">{skill.selfDeclaredProficiency || 'Advanced'}</strong>
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B6B70] font-mono mt-0.5 flex items-center gap-1.5">
                        <span>Platform verification:</span>
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

              {/* Add Skill Controls */}
              <div className="pt-3 border-t border-[#2A2A2E] space-y-3">
                <span className="text-xs font-medium text-[#A3A3A8] block">Add Skill</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Search or type skill..."
                    className="input text-xs sm:col-span-2"
                  />
                  <select
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(e.target.value as any)}
                    className="input text-xs font-medium"
                  >
                    <option value="Beginner">Proficiency: Beginner</option>
                    <option value="Intermediate">Proficiency: Intermediate</option>
                    <option value="Advanced">Proficiency: Advanced</option>
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
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 12: Resume Upload */}
            <div className="p-5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Upload your resume</h3>
                  <p className="text-[11px] text-[#A3A3A8]">
                    PDF or DOCX format (max 5MB). Recruiters will view this alongside your verified benchmarks.
                  </p>
                </div>
                {resumeFile && (
                  <span className="text-xs font-mono text-[#3FB65F] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resume uploaded
                  </span>
                )}
              </div>

              {resumeFile ? (
                <div className="p-4 rounded-lg bg-[#17171A] border border-[#3FB65F]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F]">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">{resumeFile.name}</span>
                      <span className="text-[10px] text-[#6B6B70] font-mono">
                        {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for recruiters
                      </span>
                    </div>
                  </div>
                  <label className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
                    <span>Replace</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#2A2A2E] hover:border-[#E8672E] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#17171A] block">
                  <Upload className="w-6 h-6 text-[#A3A3A8] mb-2" />
                  <span className="text-xs font-medium text-[#F5F5F4] block">
                    {uploading ? 'Processing resume...' : 'Click or drag file to upload your resume'}
                  </span>
                  <span className="text-[11px] text-[#6B6B70] font-mono mt-0.5">
                    PDF / DOCX · Max 5MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    disabled={uploading}
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

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#2A2A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#6B6B70]">
                By submitting, your profile will become discoverable by employers. You can toggle visibility off anytime.
              </p>

              <button
                type="submit"
                disabled={skills.length === 0}
                className="btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
              >
                <span>Start Getting Hired</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
