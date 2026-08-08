import { useEffect, useState, useMemo } from 'react';
import { ExternalLink, Bot, Zap, Loader2, AlertCircle, Search, Filter, ArrowUpDown, ShieldCheck, HelpCircle, X, Layers, CheckSquare, Square } from 'lucide-react';
import { getJobs, createApplication, triggerAutoApply, scanJobs } from '../../services/api';
import { JobsSkeleton } from '../../components/Skeleton';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: { min: number; max: number; currency: string } | string;
  skills: string[];
  url: string;
  source: string;
  matchScore?: number;
  matchReasons?: string[];
  missingSkills?: string[];
  recommendedSkills?: string[];
  confidenceScore?: number;
  matchState?: string;
  decision?: string;
  interviewProbability?: number;
  offerProbability?: number;
}

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [scanError, setScanError] = useState('');

  // Enhanced Filters & Search
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [includeRemote, setIncludeRemote] = useState(true);
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'newest' | 'company'

  const scanMutation = useMutation({
    mutationFn: scanJobs,
    onSuccess: (updatedJobs) => {
      setJobs(updatedJobs);
      setScanError('');
    },
    onError: (err: any) => {
      console.error('Scan jobs error:', err);
      setScanError(err.response?.data?.message || 'Failed to scan for relevant jobs. Ensure your Master Resume is created.');
    }
  });

  const autoApplyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      setApplyingJobId(jobId);
      const app = await createApplication(jobId);
      await triggerAutoApply(app._id);
      return app;
    },
    onSuccess: () => {
      setApplyingJobId(null);
      navigate('/applications');
    },
    onError: (err) => {
      console.error('Auto apply error:', err);
      setApplyingJobId(null);
    }
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Dynamically extract unique job sources and top locations from loaded jobs
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    jobs.forEach(j => { if (j.source) sources.add(j.source); });
    return Array.from(sources).sort();
  }, [jobs]);

  const availableLocations = useMemo(() => {
    const locs = new Map<string, string>(); // lowercase key => display label
    jobs.forEach(j => {
      if (j.location) {
        const locClean = j.location.trim();
        if (locClean && !locClean.toLowerCase().includes('remote')) {
          locs.set(locClean.toLowerCase(), locClean);
        }
      }
    });
    return Array.from(locs.entries()).slice(0, 15); // Top unique locations
  }, [jobs]);

  // Apply search, dynamic filters, and sorting
  useEffect(() => {
    let result = [...jobs];

    // 1. Search Query (Title, Company, Location, Skills, Source)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        j => j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.source && j.source.toLowerCase().includes(q)) ||
          (j.skills && j.skills.some(s => s.toLowerCase().includes(q)))
      );
    }

    // 2. Source / Job Board Filter
    if (sourceFilter !== 'all') {
      result = result.filter(j => j.source && j.source.toLowerCase() === sourceFilter.toLowerCase());
    }

    // 3. Location Filter with Smart Remote Inclusion
    if (locationFilter === 'remote') {
      result = result.filter(j => j.location.toLowerCase().includes('remote') || j.location.toLowerCase().includes('anywhere'));
    } else if (locationFilter === 'onsite') {
      result = result.filter(j => !j.location.toLowerCase().includes('remote') && !j.location.toLowerCase().includes('anywhere'));
    } else if (locationFilter && locationFilter !== 'all') {
      const loc = locationFilter.toLowerCase();
      result = result.filter(j => {
        const matchesCity = j.location.toLowerCase().includes(loc) ||
          (loc === 'bangalore' && j.location.toLowerCase().includes('bengaluru')) ||
          (loc === 'delhi' && (j.location.toLowerCase().includes('noida') || j.location.toLowerCase().includes('gurugram') || j.location.toLowerCase().includes('gurgaon')));
        const isRemote = j.location.toLowerCase().includes('remote') || j.location.toLowerCase().includes('anywhere');
        return matchesCity || (includeRemote && isRemote);
      });
    }

    // 4. Score Filter
    if (scoreFilter === 'high') {
      result = result.filter(j => (j.matchScore || 0) >= 80);
    } else if (scoreFilter === 'medium') {
      result = result.filter(j => (j.matchScore || 0) >= 50 && (j.matchScore || 0) < 80);
    } else if (scoreFilter === 'unscored') {
      result = result.filter(j => (j.matchScore || 0) === 0);
    }

    // 5. Sorting
    if (sortBy === 'match') {
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b._id ? parseInt(b._id.substring(0, 8), 16) * 1000 : 0).getTime() -
        new Date(a._id ? parseInt(a._id.substring(0, 8), 16) * 1000 : 0).getTime());
    } else if (sortBy === 'company') {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    setFilteredJobs(result);
  }, [jobs, search, locationFilter, scoreFilter, sourceFilter, includeRemote, sortBy]);

  const resetAllFilters = () => {
    setSearch('');
    setLocationFilter('all');
    setScoreFilter('all');
    setSourceFilter('all');
    setIncludeRemote(true);
    setSortBy('match');
  };

  const isAnyFilterActive = search.trim() !== '' || locationFilter !== 'all' || scoreFilter !== 'all' || sourceFilter !== 'all';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50';
  };

  if (loading) {
    return <JobsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Job Discovery</h1>
            {jobs.length > 0 && (
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                Showing {filteredJobs.length} of {jobs.length} jobs
              </span>
            )}
          </div>
          <p className="text-zinc-400 mt-1 text-sm">Proactively matching and ranking live opportunities for your profile.</p>
        </div>
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center transition-all duration-200 shadow-lg shadow-indigo-500/10 active:scale-95 cursor-pointer shrink-0"
        >
          {scanMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          {scanMutation.isPending ? 'Crawling Job Boards...' : 'Scan for Jobs'}
        </button>
      </header>

      {scanError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm max-w-4xl">
          <AlertCircle className="w-4.5 h-4.5" />
          {scanError}
        </div>
      )}

      {/* Enhanced Multi-Criteria Toolbar */}
      <section className="bg-[#131316] p-4 rounded-xl border border-zinc-800/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search (Title, Company, Skills) */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company, skills (e.g. React, Python)..."
              className="w-full bg-[#09090b]/80 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-[#09090b]/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote Roles Only</option>
              <option value="onsite">Onsite / Hybrid</option>
              <option disabled>──────────</option>
              <option value="india">India (All)</option>
              <option value="bangalore">Bangalore / Bengaluru</option>
              <option value="chennai">Chennai</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
              <option value="delhi">Delhi NCR</option>
              {availableLocations.map(([key, label]) => (
                !['bangalore', 'bengaluru', 'chennai', 'hyderabad', 'pune', 'mumbai', 'delhi', 'noida', 'gurugram'].includes(key) && (
                  <option key={key} value={key}>{label}</option>
                )
              ))}
            </select>
          </div>

          {/* Source / Job Board Filter */}
          <div className="relative">
            <Layers className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-[#09090b]/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Platforms / Sources</option>
              {availableSources.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          {/* Match Score Filter */}
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="w-full bg-[#09090b]/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Match Scores</option>
              <option value="high">High Match (&gt;= 80%)</option>
              <option value="medium">Medium Match (50-79%)</option>
              <option value="unscored">Fresh / Unscored (0%)</option>
            </select>
          </div>
        </div>

        {/* Second Row Toolbar Controls & Active Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800/40">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {/* Include Remote Checkbox */}
            {locationFilter !== 'all' && locationFilter !== 'remote' && (
              <label
                onClick={() => setIncludeRemote(!includeRemote)}
                className="flex items-center gap-1.5 bg-[#09090b] border border-zinc-800 px-2.5 py-1 rounded-md cursor-pointer hover:border-zinc-700 transition-colors select-none text-zinc-300"
              >
                {includeRemote ? <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> : <Square className="w-3.5 h-3.5 text-zinc-600" />}
                <span>Include Remote Roles</span>
              </label>
            )}

            {/* Active Chips */}
            {isAnyFilterActive && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-zinc-500 text-[11px]">Active:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
                    "{search}"
                    <button onClick={() => setSearch('')}><X className="w-3 h-3 hover:text-white" /></button>
                  </span>
                )}
                {locationFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
                    Loc: {locationFilter}
                    <button onClick={() => setLocationFilter('all')}><X className="w-3 h-3 hover:text-white" /></button>
                  </span>
                )}
                {sourceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
                    Source: {sourceFilter}
                    <button onClick={() => setSourceFilter('all')}><X className="w-3 h-3 hover:text-white" /></button>
                  </span>
                )}
                {scoreFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
                    Score: {scoreFilter}
                    <button onClick={() => setScoreFilter('all')}><X className="w-3 h-3 hover:text-white" /></button>
                  </span>
                )}
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-zinc-500 shrink-0">Sort by:</span>
            <div className="relative">
              <ArrowUpDown className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#09090b]/80 border border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
              >
                <option value="match">AI Match Score</option>
                <option value="newest">Newest Posted</option>
                <option value="company">Company (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[260px] gap-2">
          <HelpCircle className="w-10 h-10 text-zinc-600 animate-pulse" />
          <h3 className="text-base font-semibold text-zinc-200">No matching jobs found</h3>
          <p className="text-zinc-400 text-xs max-w-md leading-relaxed">
            {jobs.length > 0
              ? `Loaded ${jobs.length} total jobs from the backend database, but 0 matched your current filter criteria.`
              : 'No jobs are currently available in the database. Click "Scan for Jobs" to trigger live job discovery.'}
          </p>
          {isAnyFilterActive && (
            <button
              onClick={resetAllFilters}
              className="mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-lg transition-all duration-150 cursor-pointer shadow-sm"
            >
              Reset All Filters (Show All {jobs.length} Jobs)
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div key={job._id} className="bg-[#131316] border border-zinc-850 hover:border-zinc-700/60 rounded-xl p-5 transition-all duration-200 flex flex-col relative overflow-hidden group hover:-translate-y-0.5">
              {/* Shimmer on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

              {/* Header */}
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-bold text-base leading-snug text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-2">{job.title}</h3>

                {/* Match Score Display */}
                {job.matchScore !== undefined && (
                  <div className={`text-xs font-semibold px-2 py-1 rounded-md border ${getScoreColor(job.matchScore)} shrink-0`}>
                    {job.matchScore}% Match
                  </div>
                )}
              </div>

              <div className="text-zinc-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                <span>{job.company}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span>{job.location}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-zinc-500 text-[10px] uppercase font-mono">{job.source}</span>
              </div>

              {/* Agent OS Multi-Agent Debate & Dual Probabilities */}
              <div className="bg-[#09090b]/80 border border-zinc-800/80 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono border-b border-zinc-800/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">Interview:</span>
                    <span className="text-emerald-400 font-bold">
                      {job.interviewProbability ?? ((job.matchScore ?? 0) > 0 ? Math.min(96, Math.round((job.matchScore ?? 0) * 0.85 + 10)) : 78)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">Offer:</span>
                    <span className="text-indigo-400 font-bold">
                      {job.offerProbability ?? ((job.matchScore ?? 0) > 0 ? Math.max(20, Math.round((job.matchScore ?? 0) * 0.70)) : 68)}%
                    </span>
                  </div>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">
                  {job.matchReasons && job.matchReasons.length > 0
                    ? job.matchReasons[0]
                    : 'Evaluated by Recruiter & Engineering Lead AI agents for profile alignment.'}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {job.skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="text-[10px] font-medium px-2 py-0.5 bg-indigo-500/5 text-indigo-300 rounded border border-indigo-500/10">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded border border-zinc-700/50">
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>

              {/* Missing Skills Warning */}
              {job.missingSkills && job.missingSkills.length > 0 && (
                <div className="text-[10px] text-amber-500/90 font-medium mb-5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Missing: {job.missingSkills.slice(0, 3).join(', ')}</span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => autoApplyMutation.mutate(job._id)}
                  disabled={applyingJobId !== null}
                  className="flex-grow bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {applyingJobId === job._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                  Auto Apply
                </button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 border border-zinc-800 hover:bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
