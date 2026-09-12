import React, { useState } from 'react';
import { HiringRequirement } from '../../types/hiring';
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Plus,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface RequirementsViewProps {
  initialRequirement?: HiringRequirement | null;
  onSubmit: (requirement: HiringRequirement) => void;
  onBack: () => void;
}

const COMMON_ROLES = [
  'Backend Developer',
  'Frontend Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Full Stack Developer',
  'Mobile Developer',
  'Data Engineer',
  'Any Role',
];

const PRESET_SKILLS_BY_ROLE: Record<string, string[]> = {
  'Backend Developer': ['Python', 'SQL', 'Node.js', 'PostgreSQL', 'Docker'],
  'Frontend Developer': ['React', 'JavaScript', 'TypeScript', 'TailwindCSS', 'UI/UX'],
  'AI/ML Engineer': ['Python', 'ML', 'TensorFlow', 'PyTorch', 'FastAPI'],
  'UI/UX Designer': ['Figma', 'UI/UX', 'Prototyping', 'UX Research', 'Design Systems'],
  'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'TypeScript', 'SQL'],
  'Mobile Developer': ['Flutter', 'React Native', 'Kotlin', 'Swift'],
  'Data Engineer': ['Python', 'SQL', 'PostgreSQL', 'Docker', 'ETL'],
  'Any Role': ['Python', 'React', 'SQL', 'Node.js', 'Figma'],
};

const SUGGESTED_SKILL_CHIPS = [
  'Python',
  'SQL',
  'Node.js',
  'React',
  'TypeScript',
  'Figma',
  'UI/UX',
  'ML',
  'TensorFlow',
  'MongoDB',
  'PostgreSQL',
  'TailwindCSS',
  'Docker',
  'FastAPI',
  'Prototyping',
];

export default function RequirementsView({
  initialRequirement,
  onSubmit,
  onBack,
}: RequirementsViewProps) {
  const [role, setRole] = useState(initialRequirement?.role || 'Backend Developer');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    initialRequirement?.requiredSkills && initialRequirement.requiredSkills.length > 0
      ? initialRequirement.requiredSkills
      : ['Python', 'SQL', 'Node.js']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [experience, setExperience] = useState(initialRequirement?.experience || 'Any');
  const [location, setLocation] = useState(initialRequirement?.location || 'Nearby');
  const [jobType, setJobType] = useState(initialRequirement?.jobType || 'Full-time');

  // Validation: At least one required skill or a specific role must be selected
  const isValid = (role && role !== 'Any Role') || requiredSkills.length > 0;

  const toggleSkill = (skill: string) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    // If switching role and current skills are a default set, update with role presets
    if (PRESET_SKILLS_BY_ROLE[newRole]) {
      setRequiredSkills(PRESET_SKILLS_BY_ROLE[newRole].slice(0, 3));
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({
      role,
      requiredSkills,
      experience,
      location,
      jobType,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in-up">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <span>← Back to Hiring Dashboard</span>
        </button>
        <span className="text-xs text-indigo-400 font-mono">Step 1 of 2: Define Requirements</span>
      </div>

      {/* Main Requirements Card */}
      <div className="card border-indigo-900/40 bg-gradient-to-br from-[#0a0f1d] via-[#0B0F1B] to-[#080c18] p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="border-b border-gray-800 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Candidate Discovery
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            What are you hiring for?
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Specify the role, verified capabilities, and parameters. We will rank candidates with mathematically explainable matching evidence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Looking for: Role */}
            <div>
              <label className="label text-xs font-semibold text-gray-300">
                Looking for
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="input text-xs font-medium cursor-pointer"
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="label text-xs font-semibold text-gray-300">
                Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="input text-xs font-medium cursor-pointer"
              >
                <option value="Any">Any Experience</option>
                <option value="Entry">Entry Level / Junior</option>
                <option value="Intermediate">Intermediate (1-3 yrs)</option>
                <option value="Senior">Senior / Lead (3+ yrs)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="label text-xs font-semibold text-gray-300">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input text-xs font-medium cursor-pointer"
              >
                <option value="Nearby">Nearby (within 50 km)</option>
                <option value="Remote">Remote Only</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Jaipur">Jaipur, Rajasthan</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="All Locations">All Locations</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="label text-xs font-semibold text-gray-300">
                Job Type (Optional)
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as any)}
                className="input text-xs font-medium cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Required Skills Section */}
          <div className="p-5 rounded-xl bg-gray-950/70 border border-gray-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-semibold text-white block">
                  Required Verified Skills
                </label>
                <span className="text-[11px] text-gray-400">
                  Select key competencies. Candidates with platform-verified assessments will rank highest.
                </span>
              </div>
              <span className="text-xs font-mono text-indigo-400">
                {requiredSkills.length} selected
              </span>
            </div>

            {/* Active Selected Skills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {requiredSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className="hover:text-white transition ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {requiredSkills.length === 0 && (
                <div className="text-xs text-amber-400 flex items-center gap-1.5 py-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>No skills selected yet. Choose from suggested chips below or type your own.</span>
                </div>
              )}
            </div>

            {/* Quick Add Suggested Chips */}
            <div className="pt-2 border-t border-gray-800/80">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-2">
                Popular Skill Chips
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILL_CHIPS.map((chip) => {
                  const isSelected = requiredSkills.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleSkill(chip)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                          : 'bg-gray-900/90 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Add custom skill (e.g. Rust, PyTorch, GraphQL)..."
                  className="input text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  disabled={!customSkillInput.trim()}
                  className="btn-ghost btn-sm text-xs border-gray-700 hover:border-gray-600 disabled:opacity-50 text-gray-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Validation Notice & Submit CTA */}
          <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              {!isValid ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Please select at least one role or required skill to search.
                </span>
              ) : (
                <span className="text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ready to query candidate discovery pool.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Find Candidates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
