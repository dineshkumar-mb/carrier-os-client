interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-zinc-800/80 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group transition-colors duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-600 dark:text-zinc-400 text-sm font-medium">{title}</h3>
        <div className="p-2.5 bg-slate-100 dark:bg-zinc-800/60 rounded-xl text-indigo-600 dark:text-zinc-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend}
          </span>
        )}
      </div>

      {/* Decorative gradient blur */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>
    </div>
  );
};

export default StatCard;
