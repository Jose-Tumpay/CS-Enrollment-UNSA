import { motion, AnimatePresence } from 'framer-motion';
import { CourseWithStatus } from '../types';
import { X, CheckCircle2, Circle, AlertTriangle, ArrowRight, Clock, Ban } from 'lucide-react';

interface CourseDetailPanelProps {
  course: CourseWithStatus | null;
  onClose: () => void;
  onToggleApprove: (code: string) => void;
  unlockedCourses: CourseWithStatus[];
  onCourseClick?: (code: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  approved: 'Aprobado',
  available: 'Disponible',
  locked: 'Bloqueado',
  equivalent: 'Equivalente',
  elective: 'Electivo',
  phased_out: 'Descontinuado',
};

export function CourseDetailPanel({ course, onClose, onToggleApprove, unlockedCourses, onCourseClick }: CourseDetailPanelProps) {
  if (!course) return null;

  const isApproved = course.status === 'approved';

  // A 2017 course is "phased out" when it has a 2025 replacement and is not yet approved
  const isPhasedOut = !!(course.replacedBy && !isApproved);

  return (
    <AnimatePresence>
      <motion.div
        key="panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="font-mono text-sm text-muted-foreground flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold">{course.code}</span>
            <span>Plan {course.plan}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Course title & meta */}
          <div>
            <h2 className="text-2xl font-bold leading-tight mb-3">{course.name}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
                {course.credits} Créditos
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.hoursTheory}T {course.hoursPractice}P {course.hoursLab}L
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
                Año {course.year} — Sem {course.semester === 1 ? 'A' : 'B'}
              </span>
              {course.isElective && (
                <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 text-xs font-medium">
                  Electivo
                </span>
              )}
            </div>
          </div>

          {/* ── PHASED OUT BANNER ── */}
          {isPhasedOut && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Ban className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-1">
                    Este curso ya no se oferta
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Pertenece al Sílabo 2017 y fue reemplazado con la implementación del Sílabo 2025.
                    Debes matricularte en el <strong>curso equivalente</strong> según las equivalencias oficiales.
                  </p>
                  {course.replacementCourse && (
                    <button
                      onClick={() => onCourseClick?.(course.replacementCourse!.code)}
                      className="mt-3 w-full flex items-center justify-between p-3 bg-background border border-rose-500/30 hover:border-rose-500/60 rounded-lg transition-colors text-left group"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground mb-0.5">
                          EQUIVALENTE · Plan 2025
                        </div>
                        <div className="font-semibold text-sm">{course.replacementCourse.name}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">
                          {course.replacementCourse.code} · {course.replacementCourse.credits} cr
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status & approve toggle */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Estado Actual</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                ${course.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : ''}
                ${course.status === 'locked' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : ''}
                ${course.status === 'available' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : ''}
                ${course.status === 'elective' ? 'bg-slate-500/20 text-slate-600 dark:text-slate-400' : ''}
              `}>
                {STATUS_LABELS[course.status] ?? course.status}
              </span>
            </div>

            <button
              onClick={() => onToggleApprove(course.code)}
              className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                isApproved
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isApproved ? (
                <>
                  <Circle className="w-4 h-4" />
                  Quitar aprobación
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Marcar como aprobado
                </>
              )}
            </button>

            {isApproved && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Haz clic de nuevo para quitar la aprobación y recalcular la malla.
              </p>
            )}
          </div>

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                Prerrequisitos
                {course.missingPrerequisites && course.missingPrerequisites.length > 0 && (
                  <span className="text-xs bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-medium">
                    Faltan {course.missingPrerequisites.length}
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {course.prerequisites.map(prereqCode => {
                  const isMissing = course.missingPrerequisites?.includes(prereqCode);
                  return (
                    <button
                      key={prereqCode}
                      onClick={() => onCourseClick?.(prereqCode)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                        isMissing
                          ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                          : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {isMissing ? <Circle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      <span className="font-mono text-xs">{prereqCode}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unlocks */}
          {unlockedCourses.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3">Desbloquea</h3>
              <div className="space-y-2">
                {unlockedCourses.map(unlocked => (
                  <button
                    key={unlocked.code}
                    onClick={() => onCourseClick?.(unlocked.code)}
                    className="w-full flex justify-between items-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="truncate pr-4">
                      <div className="font-mono text-xs text-muted-foreground mb-0.5">{unlocked.code}</div>
                      <div className="font-medium text-sm truncate">{unlocked.name}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
      />
    </AnimatePresence>
  );
}
