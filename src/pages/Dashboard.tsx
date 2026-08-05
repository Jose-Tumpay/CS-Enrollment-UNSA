import { useCurriculumEngine } from '../hooks/useCurriculumEngine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CourseCard } from '../components/CourseCard';
import { motion } from 'framer-motion';
import {
  CheckCircle, BookOpen, Clock, Trophy, Target,
  BarChart2, Calendar, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useLocation } from 'wouter';

export function Dashboard() {
  const engine = useCurriculumEngine();
  const [, setLocation] = useLocation();

  if (!engine) return null;

  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (engine.progressPercentage / 100) * circumference;

  // Courses available in the planned semester
  const availableForSemester = engine.courses.filter(c => c.availableForEnrollment);
  // Generic available (any semester, prerequisites met)
  const availableAnySemester = engine.courses.filter(c => c.status === 'available').slice(0, 4);

  const { enrollmentTarget } = engine;
  const semLabel = enrollmentTarget.semester === 1 ? 'A' : 'B';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Tu progreso académico · Plan {engine.activePlan}
        </p>
      </header>

      {/* ── Enrollment period banner ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3.5"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-sm">
              Periodo planificado: {enrollmentTarget.year} — Semestre {semLabel}
            </span>
            <span className="text-muted-foreground text-sm ml-3">
              {availableForSemester.length} cursos disponibles para matricular
            </span>
          </div>
        </div>
        <button
          onClick={() => setLocation('/simulador')}
          className="text-sm font-semibold text-primary hover:underline shrink-0"
        >
          Abrir Simulador →
        </button>
      </motion.div>

      {/* ── Hero Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-4 bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Progreso Global
          </h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45" className="stroke-muted fill-none" strokeWidth="8" />
              <motion.circle
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                cx="50%" cy="50%" r="45"
                className="stroke-primary fill-none"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tracking-tighter">
                {Math.round(engine.progressPercentage)}%
              </span>
            </div>
          </div>
          {engine.progressPercentage >= 50 && engine.progressPercentage < 100 && (
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4" /> ¡Has superado la mitad!
            </div>
          )}
          {engine.progressPercentage === 100 && (
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4" /> ¡Carrera Completada!
            </div>
          )}
        </motion.div>

        {/* Stat cards */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold">Créditos Aprobados</span>
            </div>
            <div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold">{engine.approvedCredits}</span>
                <span className="text-muted-foreground mb-1">/ {engine.totalCredits}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(engine.approvedCredits / engine.totalCredits) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">Cursos Aprobados</span>
            </div>
            <div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold">{engine.approvedCount}</span>
                <span className="text-muted-foreground mb-1">/ {engine.totalCount}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(engine.approvedCount / engine.totalCount) * 100}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-5 sm:col-span-2 bg-gradient-to-r from-card to-primary/5"
          >
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Tiempo Estimado Restante</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-3xl font-bold">{engine.estimatedSemestersRemaining}</span>
                <span className="text-muted-foreground ml-2">
                  semestres (~{Math.ceil(engine.estimatedSemestersRemaining / 2)} años)
                </span>
              </div>
              <button
                onClick={() => setLocation('/simulador')}
                className="bg-background border border-border hover:border-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
              >
                Simular Matrícula
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Charts & next courses ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress by year chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Progreso por Año
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engine.progressByYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="year"
                  tickFormatter={v => `Año ${v}`}
                  axisLine={false} tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'percentage') return [`${Math.round(value)}%`, 'Completado'];
                    return [value, 'Cursos Aprobados'];
                  }}
                  labelFormatter={v => `Año ${v}`}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Available courses (this semester) */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Disponibles Sem. {semLabel} {enrollmentTarget.year}
            </h3>
            <button
              onClick={() => setLocation('/malla')}
              className="text-sm text-primary hover:underline font-medium"
            >
              Ver Malla →
            </button>
          </div>

          {availableForSemester.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {availableForSemester.slice(0, 5).map(course => (
                  <CourseCard
                    key={course.code}
                    course={course}
                    onClick={() => setLocation('/simulador')}
                    layout="list"
                  />
                ))}
              </div>
              {availableForSemester.length > 5 && (
                <button
                  onClick={() => setLocation('/simulador')}
                  className="mt-3 w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-xl"
                >
                  + {availableForSemester.length - 5} más en el simulador
                </button>
              )}
            </>
          ) : availableAnySemester.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                No hay cursos para Sem. {semLabel}. Mostrando otros disponibles:
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {availableAnySemester.map(course => (
                  <CourseCard
                    key={course.code}
                    course={course}
                    onClick={() => setLocation('/simulador')}
                    layout="list"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center border-2 border-dashed border-border rounded-xl">
              <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
              <p>No hay cursos disponibles.<br />¡Revisa prerrequisitos o ya estás al día!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottleneck alert ────────────────────────────────────────────────── */}
      {engine.bottleneckCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">
                Curso{engine.bottleneckCourses.length > 1 ? 's' : ''} crítico{engine.bottleneckCourses.length > 1 ? 's' : ''} detectado{engine.bottleneckCourses.length > 1 ? 's' : ''}
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Aprobar {engine.bottleneckCourses.length > 1 ? 'estos cursos' : 'este curso'} desbloqueará el mayor número de materias. Dales prioridad en tu matrícula.
              </p>
              <div className="flex flex-wrap gap-2">
                {engine.bottleneckCourses.map(c => (
                  <span
                    key={c.code}
                    className="text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full"
                  >
                    {c.code} — {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
