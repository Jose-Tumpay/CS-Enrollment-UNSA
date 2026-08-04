import { useState, useMemo } from 'react';
import { useCurriculumEngine, is2025CourseNotYetActive } from '../hooks/useCurriculumEngine';
import { useStudentStore } from '../hooks/useStudentStore';
import { CourseCard } from '../components/CourseCard';
import { CourseDetailPanel } from '../components/CourseDetailPanel';
import { CourseWithStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, Filter, User, BookOpen, Layers } from 'lucide-react';

type ViewMode = 'student' | 'plan2017' | 'plan2025';

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: typeof User }[] = [
  { value: 'student', label: 'Mi Malla', icon: User },
  { value: 'plan2017', label: 'Sílabo 2017', icon: BookOpen },
  { value: 'plan2025', label: 'Sílabo 2025', icon: Layers },
];

export function Malla() {
  const engine = useCurriculumEngine();
  const { toggleCourseApproved } = useStudentStore();

  const [viewMode, setViewMode] = useState<ViewMode>('student');
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [search, setSearch] = useState('');
  const [filterComponent, setFilterComponent] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  // Store only the code; derive the live course object from the engine on every render
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Pick the course list based on view mode
  const sourceCourses = useMemo(() => {
    if (!engine) return [];
    if (viewMode === 'plan2017') return engine.fullCourses2017;
    if (viewMode === 'plan2025') return engine.fullCourses2025;
    return engine.courses; // student's adapted plan
  }, [engine, viewMode]);

  // Always derive the selected course from the LIVE list so status is never stale
  const selectedCourse: CourseWithStatus | null = useMemo(() => {
    if (!selectedCode || !engine) return null;
    // Search in all course lists so clicking a course from the panel still works
    return (
      engine.courses.find(c => c.code === selectedCode) ??
      engine.fullCourses2017.find(c => c.code === selectedCode) ??
      engine.fullCourses2025.find(c => c.code === selectedCode) ??
      null
    );
  }, [selectedCode, engine]);

  const filteredCourses = useMemo(() => {
    return sourceCourses.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase());
      const matchComp = filterComponent === 'ALL' || c.component === filterComponent;
      const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
      return matchSearch && matchComp && matchStatus;
    });
  }, [sourceCourses, search, filterComponent, filterStatus]);

  if (!engine) return null;

  const semesters = [
    { y: 1, s: 1 }, { y: 1, s: 2 },
    { y: 2, s: 1 }, { y: 2, s: 2 },
    { y: 3, s: 1 }, { y: 3, s: 2 },
    { y: 4, s: 1 }, { y: 4, s: 2 },
    { y: 5, s: 1 }, { y: 5, s: 2 },
  ];

  const viewLabel =
    viewMode === 'student'
      ? `Mi Malla — Plan ${engine.activePlan}`
      : viewMode === 'plan2017'
      ? 'Sílabo 2017 — Vista Completa'
      : 'Sílabo 2025 — Vista Completa';

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 md:px-6 border-b border-border bg-card z-10 shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Malla Curricular</h1>
            <p className="text-muted-foreground text-sm">{viewLabel}</p>
          </div>

          {/* View mode switcher */}
          <div className="flex bg-muted/50 rounded-lg p-1 border border-border gap-0.5">
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setViewMode(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === value
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + layout toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar curso por nombre o código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-input/30 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>

          <div className="flex bg-muted/50 rounded-lg p-1 border border-border">
            <button
              onClick={() => setLayout('horizontal')}
              className={`p-1.5 rounded-md transition-colors ${layout === 'horizontal' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Vista en Columnas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('vertical')}
              className={`p-1.5 rounded-md transition-colors ${layout === 'vertical' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Vista en Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-background border border-border text-xs rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Todos los estados</option>
            <option value="approved">Aprobados</option>
            <option value="available">Disponibles</option>
            <option value="locked">Bloqueados</option>
            <option value="elective">Electivos</option>
          </select>

          <select
            value={filterComponent}
            onChange={e => setFilterComponent(e.target.value)}
            className="bg-background border border-border text-xs rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Todas las áreas</option>
            <option value="D">Capacidades de Aprendizaje (D)</option>
            <option value="E">Formación Humanística (E)</option>
            <option value="F">Estudios Específicos (F)</option>
            <option value="G">Estudios de Especialidad (G)</option>
          </select>

          {/* 2025 plan notice */}
          {viewMode === 'plan2025' && (
            <span className="ml-auto text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
              ⚠ Años 3–5: aún sin cohorte 2025 (en implementación)
            </span>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto bg-background/30 p-4 md:p-6">
        {layout === 'horizontal' ? (
          <div className="flex gap-6 min-w-max pb-10">
            {semesters.map(({ y, s }) => {
              const colCourses = filteredCourses.filter(c => c.year === y && c.semester === s);
              if (colCourses.length === 0 && search !== '') return null;

              return (
                <div key={`${y}-${s}`} className="w-72 flex-shrink-0 flex flex-col gap-3">
                  <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md pb-2 pt-1 border-b border-border/50 mb-2">
                    <h3 className="font-bold text-sm text-muted-foreground">
                      Año {y} — Semestre {s === 1 ? 'A' : 'B'}
                    </h3>
                    {viewMode === 'plan2025' && y > 2 && (
                      <span className="text-[10px] text-amber-500 font-medium">En implementación</span>
                    )}
                  </div>
                  <AnimatePresence mode="popLayout">
                    {colCourses.map(course => (
                      <CourseCard
                        key={course.code}
                        course={course}
                        onClick={c => setSelectedCode(c.code)}
                        isSelected={selectedCode === course.code}
                        isBottleneck={engine.bottleneckCourses.some(bc => bc.code === course.code)}
                        layout="grid"
                        dimmed={viewMode === 'plan2025' && is2025CourseNotYetActive(course, engine.enrollmentTarget.year)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {semesters.map(({ y, s }) => {
              const colCourses = filteredCourses.filter(c => c.year === y && c.semester === s);
              if (colCourses.length === 0) return null;

              return (
                <div key={`${y}-${s}`} className="space-y-3">
                  <h3 className="font-bold text-lg border-b border-border pb-2 sticky top-0 bg-background/90 backdrop-blur-md z-10 flex items-center gap-2">
                    Año {y} — Semestre {s === 1 ? 'A' : 'B'}
                    {viewMode === 'plan2025' && y > 2 && (
                      <span className="text-xs font-normal text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        En implementación
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                      {colCourses.map(course => (
                        <CourseCard
                          key={course.code}
                          course={course}
                          onClick={c => setSelectedCode(c.code)}
                          isSelected={selectedCode === course.code}
                          isBottleneck={engine.bottleneckCourses.some(bc => bc.code === course.code)}
                          layout="list"
                          dimmed={viewMode === 'plan2025' && is2025CourseNotYetActive(course, engine.enrollmentTarget.year)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CourseDetailPanel
        course={selectedCourse}
        onClose={() => setSelectedCode(null)}
        onToggleApprove={(code) => {
          toggleCourseApproved(code);
          // selectedCode stays the same; selectedCourse re-derives from live engine data
        }}
        unlockedCourses={selectedCourse ? engine.unlockedBy(selectedCourse.code) : []}
        onCourseClick={(code) => setSelectedCode(code)}
      />
    </div>
  );
}
