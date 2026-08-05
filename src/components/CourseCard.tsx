import { memo } from 'react';
import { CourseWithStatus } from '../types';
import { motion } from 'framer-motion';
import { Check, Lock, AlertCircle, BookOpen, Ban } from 'lucide-react';

interface CourseCardProps {
  course: CourseWithStatus;
  onClick: (course: CourseWithStatus) => void;
  isSelected?: boolean;
  isBottleneck?: boolean;
  layout?: 'grid' | 'list';
  dimmed?: boolean; // for courses not yet active (e.g. Plan 2025 year 3-5)
}

export const CourseCard = memo(function CourseCard({
  course,
  onClick,
  isSelected,
  isBottleneck,
  layout = 'grid',
  dimmed = false,
}: CourseCardProps) {
  const statusColors: Record<string, string> = {
    approved: 'status-approved',
    available: 'status-available',
    locked: 'status-locked',
    equivalent: 'status-equivalent',
    elective: 'status-elective',
    phased_out: 'status-locked',
  };

  const colorClass = statusColors[course.status] ?? 'status-locked';

  const StatusIcon = ({
    approved: Check,
    locked: Lock,
    available: BookOpen,
    equivalent: AlertCircle,
    elective: BookOpen,
    phased_out: Ban,
  } as Record<string, typeof Check>)[course.status] ?? Lock;

  // A phased-out 2017 course: genuinely retired for the current enrollment
  // period (not just "has an equivalence somewhere" — most 2017 courses do,
  // whether or not they're actually retired yet).
  const isPhasedOut = !!(course.isRetiredForPeriod && course.status !== 'approved');

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: dimmed ? 0.45 : 1, scale: 1 }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(course)}
      className={`
        w-full text-left rounded-xl border p-4 transition-all duration-200 relative overflow-hidden group
        ${colorClass}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : 'hover:shadow-md'}
        ${layout === 'list' ? 'flex items-center gap-4' : 'flex flex-col h-full min-h-[140px]'}
        ${dimmed ? 'cursor-default' : ''}
      `}
    >
      {/* Bottleneck Indicator */}
      {isBottleneck && course.status !== 'approved' && (
        <div
          className="absolute top-0 right-0 w-8 h-8 bg-amber-500/20 rounded-bl-full flex items-start justify-end p-1.5"
          title="Curso crítico (desbloquea muchos otros)"
        >
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
      )}

      {/* Simulated Indicator */}
      {course.simulated && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-primary" />
      )}

      {/* Phased-out stripe */}
      {isPhasedOut && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(239,68,68,0.06) 8px, rgba(239,68,68,0.06) 16px)' }}
        />
      )}

      <div className={`flex justify-between items-start w-full ${layout === 'list' ? 'w-auto flex-1' : 'mb-2'}`}>
        <div className="font-mono text-xs opacity-70 font-semibold tracking-wider">{course.code}</div>
        <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
          <StatusIcon className="w-3 h-3" />
          <span>{course.credits} cr</span>
        </div>
      </div>

      <div className={`flex-1 ${layout === 'list' ? 'flex items-center' : ''}`}>
        <h3 className={`font-bold leading-tight line-clamp-3 text-sm ${layout === 'list' ? 'line-clamp-1' : ''}`}>
          {course.name}
        </h3>
      </div>

      {/* Tags */}
      <div className={`flex flex-wrap gap-1 mt-auto w-full ${layout === 'list' ? 'w-auto mt-0' : 'pt-3'}`}>
        {course.isElective && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-background/40 border border-current/10">
            Electivo
          </span>
        )}
        {isPhasedOut && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-rose-500/20 text-rose-400 border border-rose-500/20">
            Descontinuado
          </span>
        )}
        {dimmed && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/20">
            En implementación
          </span>
        )}
        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-background/40 border border-current/10 font-mono">
          Comp: {course.component}
        </span>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/0 via-white/10 to-transparent pointer-events-none transition-opacity duration-500" />
    </motion.button>
  );
});
