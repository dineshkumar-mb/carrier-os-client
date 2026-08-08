import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'badge';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'animate-pulse bg-white/[0.06] border border-white/5 rounded-xl backdrop-blur-sm relative overflow-hidden shimmer-bg';

  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    card: 'h-32 w-full rounded-2xl',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-28 rounded-xl',
    badge: 'h-6 w-20 rounded-full',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse p-1">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center bg-[#131316]/60 border border-white/5 p-6 rounded-2xl">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>

    {/* Stat Cards Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#131316]/60 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>

    {/* Trace Feed & Analytics Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-[#131316]/60 border border-white/5 p-6 rounded-2xl space-y-4 h-96">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 bg-[#131316]/60 border border-white/5 p-6 rounded-2xl space-y-4 h-96">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  </div>
);

export const JobsSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse p-1">
    <div className="flex justify-between items-center bg-[#131316]/60 border border-white/5 p-6 rounded-2xl">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[#131316]/60 border border-white/5 p-6 rounded-2xl flex flex-col justify-between h-64">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ApplicationsSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse p-1">
    <div className="flex justify-between items-center bg-[#131316]/60 border border-white/5 p-6 rounded-2xl">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>

    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-[#131316]/60 border border-white/5 p-5 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ResumesSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse p-1">
    <div className="flex justify-between items-center bg-[#131316]/60 border border-white/5 p-6 rounded-2xl">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-88" />
      </div>
      <Skeleton className="h-10 w-40 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 bg-[#131316]/60 border border-white/5 p-6 rounded-2xl space-y-4 h-96">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-8 bg-[#131316]/60 border border-white/5 p-6 rounded-2xl space-y-4 h-[500px]">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  </div>
);
