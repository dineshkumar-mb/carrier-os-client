import { useState } from 'react';
import { generateInterviewPrep, getApplications } from '../../services/api';
import { Bot, Loader2, PlayCircle, Mic, HelpCircle, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function InterviewCoach() {
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [prepKit, setPrepKit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!selectedAppId) {
      setError('Please select an application first.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const data = await generateInterviewPrep(selectedAppId);
      setPrepKit(data.prepKit);
    } catch (_err) {
      setError('Failed to generate interview prep kit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Page Header */}
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-md">
          <Bot className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Interview Coach</h1>
          <p className="text-zinc-400 mt-1 text-sm">Generate custom preparation kits matching your experience to target job parameters.</p>
        </div>
      </header>

      {/* Select Application Card */}
      <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-6 shadow-sm glow-accent">
        <div className="flex flex-col gap-4 max-w-md">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Select Target Application</label>
          <select 
            value={selectedAppId} 
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full bg-[#09090b]/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            disabled={appsLoading}
          >
            <option value="">-- Choose Active Application --</option>
            {applications?.map((app: any) => (
              <option key={app._id} value={app._id}>
                {app.jobId?.title} at {app.jobId?.company} ({app.status})
              </option>
            ))}
          </select>
          
          {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}

          <button 
            onClick={handleGenerate}
            disabled={loading || !selectedAppId}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 mt-2 text-sm shadow-md cursor-pointer active:scale-98"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            Generate Preparation Kit
          </button>
        </div>
      </section>

      {/* Results Preparation Kit */}
      {prepKit && (
        <section className="flex flex-col gap-5 animate-in fade-in duration-300">
          <h2 className="text-xl font-bold tracking-tight text-white border-b border-zinc-900 pb-2">Custom Questions & Talking Points</h2>
          
          <div className="grid gap-4">
            {prepKit.questions?.map((item: any, i: number) => (
              <div key={i} className="bg-[#131316] border border-zinc-850 hover:border-zinc-800 rounded-xl p-5 transition-colors">
                <div className="flex gap-3.5 mb-4">
                  <div className="bg-indigo-500/10 p-2.5 rounded-lg h-fit text-indigo-400 border border-indigo-500/20">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block">QUESTION #{i + 1}</span>
                    <h3 className="text-base font-bold text-zinc-200 leading-snug mt-0.5">{item.question}</h3>
                  </div>
                </div>
                
                <div className="pl-12">
                  <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">Suggested Talking Points</h4>
                  <ul className="space-y-2 text-zinc-300">
                    {item.talkingPoints?.map((pt: string, j: number) => (
                      <li key={j} className="text-xs leading-relaxed flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!prepKit && (
        <div className="border border-dashed border-zinc-900 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[200px] gap-2 bg-[#131316]/30">
          <HelpCircle className="w-8 h-8 text-zinc-700" />
          <h3 className="text-sm font-semibold text-zinc-400">No Interview Prep Kit Active</h3>
          <p className="text-zinc-600 text-xs max-w-xs">Select an application above and generate your tailored interview prep questions.</p>
        </div>
      )}
    </div>
  );
}
