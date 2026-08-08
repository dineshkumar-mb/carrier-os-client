import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResumes, saveResume, parseResumeFile } from '../../services/api';
import { FileText, Loader2, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, Upload, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import axios from 'axios';

interface ExperienceItem {
  role: string;
  company: string;
  years: number | string;
  description?: string;
}

interface EducationItem {
  degree: string;
  university: string;
}

interface ProjectItem {
  name: string;
  tech: string;
}

export default function Resumes() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: getResumes,
  });

  const [activeTab, setActiveTab] = useState<'master' | 'tailored'>('master');
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skillsText, setSkillsText] = useState('');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  // Tailored Resume Generator Modal State
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [targetRole, setTargetRole] = useState('Senior React Developer');
  const [targetCompany, setTargetCompany] = useState('TechScale Inc');
  const [variantType, setVariantType] = useState('keyword_heavy');
  const [isTailoring, setIsTailoring] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError('');
    setSuccessMsg('');

    try {
      const parsedData = await parseResumeFile(file);

      setExperience(parsedData.experience || []);
      setEducation(parsedData.education || []);
      setSkillsText(parsedData.skills?.join(', ') || '');
      setProjects(
        (parsedData.projects || []).map((p: any) => ({
          name: p.name || '',
          tech: Array.isArray(p.tech) ? p.tech.join(', ') : p.tech || '',
        }))
      );

      setSuccessMsg('Resume parsed and form populated! Review details below before saving.');
    } catch (err: any) {
      console.error(err);
      setParseError(err.response?.data?.message || 'Failed to parse resume. Ensure it is a valid PDF.');
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (data?.master) {
      setExperience(data.master.experience || []);
      setEducation(data.master.education || []);
      setSkillsText(data.master.skills?.join(', ') || '');
      setProjects(
        (data.master.projects || []).map((p: any) => ({
          name: p.name || '',
          tech: Array.isArray(p.tech) ? p.tech.join(', ') : p.tech || '',
        }))
      );
    }
  }, [data]);

  const saveResumeMutation = useMutation({
    mutationFn: saveResume,
    onSuccess: (updatedMaster) => {
      queryClient.setQueryData(['resumes'], {
        ...data,
        master: updatedMaster,
      });
      setSuccessMsg('Master resume saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedProjects = projects.map((p) => ({
      name: p.name,
      tech: p.tech.split(',').map((t) => t.trim()).filter(Boolean),
    }));
    const formattedSkills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);

    saveResumeMutation.mutate({
      experience,
      education,
      skills: formattedSkills,
      projects: formattedProjects,
    });
  };

  const handleGenerateTailored = async () => {
    try {
      setIsTailoring(true);
      await axios.post('http://localhost:3000/api/resumes/tailor', {
        targetRole,
        companyName: targetCompany,
        variantType
      });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setShowTailorModal(false);
      setSuccessMsg(`Tailored resume for ${targetRole} generated successfully!`);
    } catch (err) {
      console.error('Tailor error:', err);
    } finally {
      setIsTailoring(false);
    }
  };

  const addExperience = () => {
    setExperience([...experience, { role: '', company: '', years: '', description: '' }]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', university: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addProject = () => {
    setProjects([...projects, { name: '', tech: '' }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-zinc-400 text-sm">Loading resume models...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Resumes & Tailor</h1>
          <p className="text-zinc-400 mt-1 text-sm">Manage your master profile details and review customized AI-tailored formats.</p>
        </div>
        <button
          onClick={() => setShowTailorModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Wand2 className="w-4 h-4" /> Generate Tailored Resume
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 gap-6">
        <button
          onClick={() => setActiveTab('master')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'master'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Master Resume
        </button>
        <button
          onClick={() => setActiveTab('tailored')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'tailored'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Tailored Resumes ({data?.versions?.length || 0})
        </button>
      </div>

      {/* Tailor Resume Modal */}
      {showTailorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131316] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> AI Resume Tailoring Agent
            </h3>
            <p className="text-xs text-zinc-400">Generate a custom ATS-optimized resume variant aligned with target role specs.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold mb-1 block">Target Job Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold mb-1 block">Target Company</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold mb-1 block">A/B Strategy Variant</label>
                <select
                  value={variantType}
                  onChange={(e) => setVariantType(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="keyword_heavy">Keyword Heavy (ATS Priority)</option>
                  <option value="achievement_focused">Achievement Focused (Impact Metrics)</option>
                  <option value="project_focused">Project Focused (GitHub & Open Source)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTailorModal(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTailored}
                disabled={isTailoring}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {isTailoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Generate Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'master' ? (
        <div className="space-y-6 max-w-4xl">
          {/* Resume Performance Intelligence Matrix */}
          <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-zinc-200">Resume Performance Intelligence</h2>
                <p className="text-xs text-zinc-400">Comparing conversion funnel metrics across tailored resume versions.</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">Learning Engine Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-[#09090b]/80 p-3 rounded-lg border border-zinc-900 flex justify-between items-center">
                <span className="text-zinc-400">Master Version v1.0</span>
                <span className="font-bold text-emerald-400">ATS 88% | 18% Int</span>
              </div>
              <div className="bg-[#09090b]/80 p-3 rounded-lg border border-zinc-900 flex justify-between items-center">
                <span className="text-zinc-400">Tailored Stack v1.2</span>
                <span className="font-bold text-indigo-400">ATS 94% | 24% Int</span>
              </div>
              <div className="bg-[#09090b]/80 p-3 rounded-lg border border-zinc-900 flex justify-between items-center">
                <span className="text-zinc-400">FullStack Tailored v2</span>
                <span className="font-bold text-amber-400">ATS 91% | 21% Int</span>
              </div>
            </div>
          </section>

          {/* AI PDF Parser Card */}
          <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 space-y-3">
            <div>
              <h2 className="text-base font-bold text-zinc-200">Import Resume PDF</h2>
              <p className="text-xs text-zinc-400">Upload a PDF resume to instantly pre-fill all form fields below using AI.</p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-md">
                <Upload className="w-4 h-4" />
                {isParsing ? 'Parsing PDF...' : 'Upload PDF'}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isParsing}
                  className="hidden"
                />
              </label>

              {isParsing && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>Extracting profile credentials...</span>
                </div>
              )}
            </div>

            {parseError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4" />
                {parseError}
              </div>
            )}
          </section>

          <form onSubmit={handleSubmit} className="space-y-6">
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            {/* Experience */}
            <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-zinc-200">Work Experience</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {experience.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">No work history items added.</p>
              ) : (
                <div className="space-y-4">
                  {experience.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#09090b]/80 rounded-lg border border-zinc-900 relative space-y-3">
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="absolute right-4 top-4 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          value={item.role}
                          onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                          placeholder="Role / Title"
                          className="bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          required
                          value={item.company}
                          onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                          placeholder="Company"
                          className="bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          required
                          value={item.years}
                          onChange={(e) => updateExperience(idx, 'years', e.target.value)}
                          placeholder="Years (e.g. 2 or 2021-2023)"
                          className="bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                        placeholder="Key duties, projects, and technologies used..."
                        rows={3}
                        className="w-full bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Education */}
            <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-zinc-200">Education</h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </button>
              </div>

              {education.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">No education items added.</p>
              ) : (
                <div className="space-y-4">
                  {education.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#09090b]/80 rounded-lg border border-zinc-900 relative space-y-3">
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="absolute right-4 top-4 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={item.degree}
                          onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                          placeholder="Degree (e.g. B.S. Computer Science)"
                          className="bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          required
                          value={item.university}
                          onChange={(e) => updateEducation(idx, 'university', e.target.value)}
                          placeholder="University"
                          className="bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Skills */}
            <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-6 space-y-2">
              <h2 className="text-base font-bold text-zinc-200">Skills</h2>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="React, TypeScript, Node.js, AWS, Docker (comma separated)"
                className="w-full bg-[#09090b]/80 border border-zinc-850 rounded-lg px-3 py-2.5 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </section>

            {/* Projects */}
            <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-zinc-200">Projects</h2>
                <button
                  type="button"
                  onClick={addProject}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">No projects added.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#09090b]/80 rounded-lg border border-zinc-900 relative space-y-3">
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="absolute right-4 top-4 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => updateProject(idx, 'name', e.target.value)}
                          placeholder="Project Name"
                          className="bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          required
                          value={item.tech}
                          onChange={(e) => updateProject(idx, 'tech', e.target.value)}
                          placeholder="Tech Used (e.g. React, Node.js)"
                          className="bg-[#131316] border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={saveResumeMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all text-xs shadow-md cursor-pointer active:scale-98"
            >
              {saveResumeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Master Resume
            </button>
          </form>
        </div>
      ) : (
        /* Tailored Resumes List */
        <div className="space-y-4 max-w-4xl animate-in fade-in duration-200">
          {(!data?.versions || data.versions.length === 0) ? (
            <div className="text-zinc-500 py-16 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl gap-2 bg-[#131316]/30">
              <FileText className="w-8 h-8 text-zinc-600" />
              <h3 className="text-sm font-semibold text-zinc-400">No tailored resumes</h3>
              <p className="text-zinc-500 text-xs">Click "Generate Tailored Resume" to create an AI-tailored resume for a target job role.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {data.versions.map((ver: any) => (
                <div key={ver._id} className="bg-[#131316] border border-zinc-850 hover:border-zinc-800 rounded-xl p-5 transition-colors space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-zinc-100">{ver.jobId?.title || 'Tailored Resume'}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-semibold">
                          {ver.variantType || 'keyword_heavy'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{ver.jobId?.company || 'Unknown Company'} • {ver.jobId?.location || 'Remote'}</p>
                    </div>
                    {ver.atsScore && (
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">ATS Score</span>
                        <span className={`text-xl font-extrabold ${ver.atsScore >= 80 ? 'text-emerald-400' : ver.atsScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {ver.atsScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {ver.tailoredSummary && (
                    <p className="text-xs text-zinc-300 bg-[#09090b] p-3 rounded-lg border border-zinc-900 font-mono leading-relaxed">
                      "{ver.tailoredSummary}"
                    </p>
                  )}

                  {ver.atsFeedback && (
                    <div className="pt-2 border-t border-zinc-900">
                      <button
                        onClick={() => setExpandedFeedbackId(expandedFeedbackId === ver._id ? null : ver._id)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {expandedFeedbackId === ver._id ? (
                          <>Hide ATS Insights <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Show ATS Insights & Feedback <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>

                      {expandedFeedbackId === ver._id && (
                        <div className="mt-3 p-4 bg-[#09090b]/60 rounded-lg border border-zinc-850 text-xs space-y-4 animate-in slide-in-from-top-1 duration-200">
                          {ver.atsFeedback.strengths?.length > 0 && (
                            <div>
                              <h4 className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider mb-1">Strengths</h4>
                              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                                {ver.atsFeedback.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
                              </ul>
                            </div>
                          )}
                          {ver.atsFeedback.weaknesses?.length > 0 && (
                            <div>
                              <h4 className="font-bold text-amber-500 text-[10px] uppercase tracking-wider mb-1">Gaps / Missing Keywords</h4>
                              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                                {ver.atsFeedback.weaknesses.map((weak: string, i: number) => <li key={i}>{weak}</li>)}
                              </ul>
                            </div>
                          )}
                          {ver.atsFeedback.suggestions?.length > 0 && (
                            <div>
                              <h4 className="font-bold text-indigo-400 text-[10px] uppercase tracking-wider mb-1">Suggestions to improve</h4>
                              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                                {ver.atsFeedback.suggestions.map((sug: string, i: number) => <li key={i}>{sug}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
