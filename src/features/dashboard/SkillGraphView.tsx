import { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: string;
  yearsOfExperience: number;
  parentSkillId?: string;
}

const SkillGraphView = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/analytics/skill-graph')
      .then(res => {
        if (res.data?.data?.nodes) {
          setNodes(Object.values(res.data.data.nodes));
        }
      })
      .catch(err => console.error('Skill graph fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400 text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Loading Candidate Skill Graph...
      </div>
    );
  }

  const filteredNodes = selectedCategory === 'all'
    ? nodes
    : nodes.filter(n => n.category === selectedCategory);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" /> Candidate Skill Graph DAG
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Hierarchical tree representation of technical competencies, years of experience, and depth level.</p>
        </div>
        <div className="flex gap-2">
          {['all', 'frontend', 'backend', 'database', 'devops'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map(node => (
          <div key={node.id} className="bg-[#131316] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {node.category}
                </span>
                <span className="text-xs font-bold text-emerald-400 capitalize">{node.level}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{node.name}</h3>
              {node.parentSkillId && (
                <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                  Parent Node: <ArrowRight className="w-3 h-3 text-zinc-400" /> {node.parentSkillId}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs text-zinc-400">
              <span>{node.yearsOfExperience} years exp</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillGraphView;
