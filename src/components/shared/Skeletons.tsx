import { Card, CardContent } from "../ui/card";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-12 mt-1" />
            <Skeleton className="h-3 w-20 mt-1" />
          </div>
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function TasksSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-1">
          <Skeleton className="w-4 h-4 rounded-full shrink-0" />
          <Skeleton
            className={`h-3.5 ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-1/2" : "w-2/3"}`}
          />
        </div>
      ))}
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <Skeleton className={`h-3.5 ${i % 2 === 0 ? "w-2/5" : "w-1/2"}`} />
            <Skeleton className="h-3 w-16 shrink-0" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function HabitsSkeleton() {
  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="w-4 h-4 rounded-full shrink-0" />
            <Skeleton className={`h-3.5 ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
          </div>
        ))}
      </div>
    </>
  );
}

function OverallProgressSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function GoalStatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 text-center">
        <Skeleton className="h-8 sm:h-9 w-12 mx-auto mb-2" />
        <Skeleton className="h-3.5 w-24 mx-auto" />
      </CardContent>
    </Card>
  );
}

function GoalCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full ml-4 shrink-0" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

function TasksStatCardSkeleton() {
  return (
    <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-sm text-center">
      <Skeleton className="h-8 sm:h-9 w-12 mx-auto mb-2" />
      <Skeleton className="h-3.5 w-20 mx-auto" />
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="py-4 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border px-3 py-3 flex items-center gap-3"
        >
          <Skeleton className="w-4 h-4 rounded shrink-0" />
          <Skeleton
            className={`h-4 ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-1/2" : "w-2/3"}`}
          />
        </div>
      ))}
    </div>
  );
}

function HabitStatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-5 flex flex-col items-center justify-center">
      <Skeleton className="h-8 sm:h-9 w-12 mb-2" />
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}

function HabitListSkeleton() {
  return (
    <div className="py-2 space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-3">
          <Skeleton className="w-5 h-5 rounded-full shrink-0" />
          <Skeleton
            className={`h-4 ${i % 3 === 0 ? "w-2/3" : i % 3 === 1 ? "w-1/2" : "w-3/5"}`}
          />
          <Skeleton className="h-4 w-8 ml-auto shrink-0" />
        </div>
      ))}
    </div>
  );
}

function WeeklyChartSkeleton() {
  return (
    <div className="flex items-end gap-1.5 h-16">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end h-10">
            <Skeleton className="w-full rounded-sm" />
          </div>
          <Skeleton className="h-3 w-3 rounded" />
        </div>
      ))}
    </div>
  );
}

function ProgressSidebarSkeleton() {
  return (
    <>
      <div className="flex items-end justify-between mb-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </>
  );
}

function TopStreaksSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className={`h-3.5 ${i % 2 === 0 ? "w-2/5" : "w-1/3"}`} />
          <Skeleton className="h-3.5 w-8" />
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  TasksSkeleton,
  GoalsSkeleton,
  HabitsSkeleton,
  OverallProgressSkeleton,
  StatCardSkeleton,
  GoalStatCardSkeleton,
  GoalCardSkeleton,
  TasksStatCardSkeleton,
  TaskListSkeleton,
  HabitStatCardSkeleton,
  HabitListSkeleton,
  WeeklyChartSkeleton,
  ProgressSidebarSkeleton,
  TopStreaksSkeleton,
};
