import React from 'react';

const SkeletonCard = () => (
  <div className="space-y-3">
    <div className="h-[300px] rounded-2xl animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f] " />
    <div className="h-4 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-3/4" />
    <div className="h-4 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-1/2" />
  </div>
);

const SkeletonListRow = () => (
  <div className="flex items-center gap-4 p-4">
    <div className="h-14 w-14 rounded-xl animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-3/4" />
      <div className="h-3 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-1/2" />
    </div>
    <div className="h-8 w-20 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f] " />
  </div>
);

const SkeletonDetail = () => (
  <div className="space-y-6">
    <div className="h-[280px] w-full rounded-2xl animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f] " />
    <div className="space-y-3">
      <div className="h-6 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-2/3" />
      <div className="h-4 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-full" />
      <div className="h-4 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-full" />
      <div className="h-4 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-3/4" />
    </div>
    <div className="flex gap-3">
      <div className="h-10 w-32 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f] " />
      <div className="h-10 w-32 rounded-lg animate-pulse bg-[#1c1c1f] dark:bg-[#1c1c1f] " />
    </div>
  </div>
);

const SkeletonStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-5 rounded-2xl space-y-3 bg-[#1c1c1f]/50  animate-pulse">
        <div className="h-8 w-8 rounded-lg bg-[#1c1c1f] dark:bg-[#1c1c1f] " />
        <div className="h-6 rounded-lg bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-1/2" />
        <div className="h-3 rounded-lg bg-[#1c1c1f] dark:bg-[#1c1c1f]  w-3/4" />
      </div>
    ))}
  </div>
);

const skeletonMap = {
  card: SkeletonCard,
  list: SkeletonListRow,
  detail: SkeletonDetail,
  stats: SkeletonStats,
};

const SkeletonLoader = ({ type = 'card', count = 6 }) => {
  const Component = skeletonMap[type] || SkeletonCard;

  if (type === 'stats') {
    return <Component />;
  }

  if (type === 'detail') {
    return (
      <div className="max-w-2xl mx-auto">
        <Component />
      </div>
    );
  }

  return (
    <div
      className={
        type === 'card'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'divide-y divide-[#e7c588]/25 rounded-2xl bg-[#0a0a0b]/80  border border-[#e7c588]/25 '
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
