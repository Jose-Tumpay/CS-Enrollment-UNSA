import { useMemo } from "react";
import { CourseWithStatus } from "../types";
import { useCurriculumEngine } from "../hooks/useCurriculumEngine";
import { useStudentStore } from "../hooks/useStudentStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Play,
  Trash2,
  ArrowRight,
  Lock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Zap,
  RefreshCw,
  Ban,
  GraduationCap,
  ArrowDown,
  TriangleAlert,
} from "lucide-react";
import { ACADEMIC_RULES } from "../config/academicRules";

export function Simulador() {
  const engine = useCurriculumEngine();
  const {
    profile,
    toggleCourseSimulated,
    clearSimulated,
    approveSimulated,
    setEnrollmentTarget,
  } = useStudentStore();

  if (!engine || !profile) return null;

  const {
    enrollmentSummary,
    enrollmentTarget: target,
    recommendedCreditsThisSemester,
  } = engine;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    {
      length:
        ACADEMIC_RULES.enrollmentYearsBefore +
        ACADEMIC_RULES.enrollmentYearsAhead +
        1,
    },
    (_, i) => currentYear - ACADEMIC_RULES.enrollmentYearsBefore + i,
  );

  const handleChangeYear = (year: number) => {
    setEnrollmentTarget({ ...target, year });
    if (profile.simulatedCourses.length > 0) clearSimulated();
  };

  const handleChangeSemester = (semester: 1 | 2) => {
    setEnrollmentTarget({ ...target, semester });
    if (profile.simulatedCourses.length > 0) clearSimulated();
  };

  const handleSimulateApproval = () => {
    if (
      confirm(
        `¿Confirmas marcar estos ${profile.simulatedCourses.length} cursos como aprobados permanentemente?`,
      )
    ) {
      approveSimulated();
    }
  };

  // Sort ascending by (year, semester)
  const byYearSemester = (a: CourseWithStatus, b: CourseWithStatus) =>
    a.year - b.year || a.semester - b.semester;

  // All courses available for enrollment this semester (BOTH plans)
  const availableForSemester = engine.courses.filter(
    (c) => c.availableForEnrollment,
  );

  const regularCourses = availableForSemester
    .filter((c) => !c.isRescheduled)
    .sort(byYearSemester);

  // Rescheduled courses (for the notice banner)
  const rescheduledCourses = availableForSemester.filter(
    (c) => c.isRescheduled,
  );

  // Courses locked by missing prerequisites (correct semester, but blocked)
  const lockedThisSemester = engine.courses
    .filter(
      (c) =>
        c.semester === target.semester &&
        c.status !== "approved" &&
        !c.availableForEnrollment &&
        (c.missingPrerequisites?.length ?? 0) > 0,
    )
    .sort(byYearSemester);

  // Courses whose prerequisites ARE met, but that are normally taught in the
  // OTHER semester (A/B) this period — candidates for a manual "reprogramación"
  const reprogramacionCandidates = engine.courses
    .filter(
      (c) =>
        c.status === "available" &&
        c.semester !== target.semester &&
        !c.isRescheduled,
    )
    .sort(byYearSemester);

  // ── Credit bar ────────────────────────────────────────────────────────────
  const {
    totalCredits: simCredits,
    isUnderMinimum,
    isOverMaximum,
    creditWarning,
    selectedCourses,
    willUnlock,
  } = enrollmentSummary;
  const creditPercent = Math.min(
    (simCredits / ACADEMIC_RULES.maxCreditsPerSemester) * 100,
    100,
  );

  const creditBarColor = isOverMaximum
    ? "bg-destructive"
    : isUnderMinimum
      ? "bg-amber-500"
      : "bg-emerald-500";

  // ── Context labels ────────────────────────────────────────────────────────
  const studentCareerYearLabel = `Año ${engine.studentCareerYear} de carrera`;
  const retired2017YearsLabel =
    engine.retiredPlan2017CareerYears.length > 0
      ? `Años ${engine.retiredPlan2017CareerYears.join(", ")} del Sílabo 2017 no se ofertan en ${target.year}`
      : null;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Simulador de Matrícula
        </h1>
        <p className="text-muted-foreground mt-1">
          Solo se muestran los cursos realmente ofertados para el periodo
          seleccionado, según tu plan y el avance de las promociones.
        </p>
      </header>

      {/* Period Selector */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Periodo de Matrícula</h2>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Year */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Año académico
            </label>
            <select
              value={target.year}
              onChange={(e) => handleChangeYear(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Semestre
            </label>
            <div className="flex gap-2">
              {([1, 2] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleChangeSemester(s)}
                  className={`flex-1 py-2.5 px-4 rounded-lg border font-semibold text-sm transition-all ${
                    target.semester === s
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  Semestre {s === 1 ? "A" : "B"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Context strip */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 text-sm font-medium text-primary flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              <strong>
                {target.year} — Sem. {target.semester === 1 ? "A" : "B"}
              </strong>
              &nbsp;&middot;&nbsp; Plan {engine.activePlan}
              &nbsp;&middot;&nbsp; {studentCareerYearLabel}
              &nbsp;&middot;&nbsp; {availableForSemester.length} cursos
              disponibles
            </span>
          </div>

          {engine.activePlan === "2017" && retired2017YearsLabel && (
            <div className="bg-rose-500/8 border border-rose-500/20 rounded-lg px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 shrink-0" />
              {retired2017YearsLabel}. Se usan equivalentes del Sílabo 2025.
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: course selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Rescheduled notice */}
          {rescheduledCourses.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
                  {rescheduledCourses.length} curso
                  {rescheduledCourses.length > 1 ? "s" : ""} reprogramado
                  {rescheduledCourses.length > 1 ? "s" : ""} para este semestre
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Normalmente se dictan en el otro semestre, pero están
                  disponibles excepcionalmente por reprogramación oficial.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: All available courses (2017 + 2025) */}
          <div>
            <h2 className="text-xl font-bold border-b border-border pb-2 mb-4 flex items-center gap-2">
              Disponibles — Semestre {target.semester === 1 ? "A" : "B"}
              <span className="text-sm font-normal text-muted-foreground">
                ({regularCourses.length} cursos)
              </span>
            </h2>

            {regularCourses.length === 0 ? (
              <div className="text-center p-10 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-medium">
                  No hay cursos propios disponibles para este semestre.
                </p>
                <p className="text-sm mt-1 opacity-70">
                  Es posible que ya los hayas aprobado todos, o que debas
                  aprobar prerrequisitos primero.
                </p>
              </div>
            ) : (
              <CourseCardList
                courses={regularCourses}
                selectedCodes={profile.simulatedCourses}
                onToggle={toggleCourseSimulated}
              />
            )}
          </div>

          {/* Section 2: Locked this semester */}
          {lockedThisSemester.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b border-border pb-2 mb-4 text-muted-foreground flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Bloqueados este semestre
                <span className="text-sm font-normal">
                  ({lockedThisSemester.length})
                </span>
              </h2>
              <div className="space-y-2 opacity-60">
                {lockedThisSemester.map((course) => (
                  <div
                    key={course.code}
                    className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card/50"
                  >
                    <Lock className="w-4 h-4 text-muted-foreground ml-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">
                        {course.name}
                      </h3>
                      <p className="text-xs text-rose-500 font-mono mt-0.5 truncate">
                        Falta: {course.missingPrerequisites?.join(", ")}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border border-border shrink-0">
                      {course.credits} cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Matrícula por reprogramación (manual) */}
          {reprogramacionCandidates.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b border-border pb-2 mb-1 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <RefreshCw className="w-5 h-5 shrink-0" />
                Matrícula por reprogramación
                <span className="text-sm font-normal text-muted-foreground">
                  ({reprogramacionCandidates.length})
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Estos cursos normalmente se dictan en Semestre{" "}
                {target.semester === 1 ? "B" : "A"}, no en este periodo, pero ya
                cumples sus prerrequisitos. Solo agrégalos aquí si cuentas con
                autorización de la Escuela Profesional para llevarlos fuera de
                su semestre habitual (reprogramación extraordinaria).
              </p>
              <div className="space-y-2">
                {reprogramacionCandidates.map((course) => {
                  const isSelected = profile.simulatedCourses.includes(
                    course.code,
                  );
                  return (
                    <label
                      key={course.code}
                      className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/10 border-primary ring-1 ring-primary"
                          : "bg-card border-amber-500/30 hover:border-amber-500/60 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background"
                        }`}
                        onClick={() => toggleCourseSimulated(course.code)}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCourseSimulated(course.code)}
                        className="hidden"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[10px] text-muted-foreground font-semibold block mb-0.5">
                          {course.code}
                        </span>
                        <h3 className="font-bold text-sm truncate">
                          {course.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Año {course.year} — Sem{" "}
                          {course.semester === 1 ? "A" : "B"} (fuera de este
                          periodo)
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border border-border shrink-0">
                        {course.credits} cr
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: enrollment summary */}
        <div className="lg:col-span-1 sticky top-6 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-5">Resumen de Matrícula</h3>

            {/* Credit meter */}
            <div className="mb-5">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-muted-foreground font-medium">
                  Créditos
                </span>
                <span
                  className={`font-bold text-2xl ${
                    isOverMaximum
                      ? "text-destructive"
                      : isUnderMinimum
                        ? "text-amber-500"
                        : "text-primary"
                  }`}
                >
                  {simCredits}
                  <span className="text-base font-normal text-muted-foreground">
                    &nbsp;/ {ACADEMIC_RULES.maxCreditsPerSemester}
                  </span>
                </span>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-500/60 z-10"
                  style={{
                    left: `${(ACADEMIC_RULES.minCreditsPerSemester / ACADEMIC_RULES.maxCreditsPerSemester) * 100}%`,
                  }}
                />
                <div
                  className={`h-full rounded-full transition-all duration-300 ${creditBarColor}`}
                  style={{ width: `${creditPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span className="flex items-center gap-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-0.5" />
                  Mín. {ACADEMIC_RULES.minCreditsPerSemester} cr
                </span>
                <span>Máx. {ACADEMIC_RULES.maxCreditsPerSemester} cr</span>
              </div>
            </div>

            {/* Courses count */}
            <div className="flex justify-between items-center text-sm py-2 border-t border-border">
              <span className="text-muted-foreground">
                Cursos seleccionados
              </span>
              <span className="font-bold text-lg">
                {profile.simulatedCourses.length}
              </span>
            </div>

            {/* Recommended load vs selected */}
            {recommendedCreditsThisSemester > 0 && (
              <div className="text-sm py-2 border-t border-border space-y-1">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Carga recomendada según la malla</span>
                  <span className="font-medium text-foreground">
                    {recommendedCreditsThisSemester} créditos
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Carga seleccionada</span>
                  <span className="font-medium text-foreground">
                    {simCredits} créditos
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground">Diferencia</span>
                  <span
                    className={`font-bold ${
                      simCredits - recommendedCreditsThisSemester === 0
                        ? "text-muted-foreground"
                        : simCredits - recommendedCreditsThisSemester > 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {simCredits - recommendedCreditsThisSemester > 0 ? "+" : ""}
                    {simCredits - recommendedCreditsThisSemester} créditos
                  </span>
                </div>
              </div>
            )}

            {/* Warning */}
            <AnimatePresence>
              {creditWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 rounded-lg p-3 text-sm font-medium flex items-start gap-2 border ${
                    isOverMaximum
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{creditWarning}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="space-y-3 mt-5">
              <button
                disabled={profile.simulatedCourses.length === 0}
                onClick={handleSimulateApproval}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
              >
                <Play className="w-4 h-4" />
                Aprobar{" "}
                {profile.simulatedCourses.length > 0
                  ? `(${profile.simulatedCourses.length})`
                  : "Cursos"}
              </button>

              <button
                disabled={profile.simulatedCourses.length === 0}
                onClick={clearSimulated}
                className="w-full bg-background border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar selección
              </button>
            </div>

            {/* Will unlock */}
            {willUnlock.length > 0 && (
              <div className="mt-6 pt-5 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  Al aprobar se desbloquearán:
                </div>
                <div className="space-y-2">
                  {willUnlock.slice(0, 6).map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs"
                    >
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                  ))}
                  {willUnlock.length > 6 && (
                    <p className="text-xs text-muted-foreground">
                      +{willUnlock.length - 6} más cursos
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected courses list */}
          {selectedCourses.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h4 className="font-semibold text-sm mb-3 text-muted-foreground">
                Cursos en tu matrícula
              </h4>
              <div className="space-y-2">
                {selectedCourses.map((c) => {
                  const isEquiv = c.isInjectedEquivalent;
                  return (
                    <div
                      key={c.code}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">{c.name}</span>
                        {isEquiv &&
                          (c.replacesEquiv2017Names?.length ?? 0) > 0 && (
                            <span className="text-[10px] text-rose-500 dark:text-rose-400 truncate">
                              Equiv. de: {c.replacesEquiv2017Names![0]}
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <span className="text-xs text-muted-foreground font-mono">
                          {c.credits} cr
                        </span>
                        <button
                          onClick={() => toggleCourseSimulated(c.code)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Quitar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: standard course card list ───────────────────────────────────

interface CourseCardListProps {
  courses: CourseWithStatus[];
  selectedCodes: string[];
  onToggle: (code: string) => void;
}

function CourseCardList({
  courses,
  selectedCodes,
  onToggle,
}: CourseCardListProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {courses.map((course) => {
          const isSelected = selectedCodes.includes(course.code);
          const plan = course.plan; // "2017" | "2025"
          const is2025Equiv =
            plan === "2025" &&
            course.replacesEquiv2017Names &&
            course.replacesEquiv2017Names.length > 0;
          const has2025Equiv = plan === "2017" && course.replacedBy;

          return (
            <motion.label
              key={`${plan}-${course.code}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary/10 border-primary ring-1 ring-primary shadow-sm"
                  : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input bg-background"
                }`}
                onClick={() => onToggle(course.code)}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>

              <div
                className="flex-1 min-w-0"
                onClick={() => onToggle(course.code)}
              >
                {/* Top row: code + badges + credits */}
                <div className="flex justify-between items-start mb-0.5 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground font-semibold">
                      {course.code}
                    </span>
                    {/* Plan badge */}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                        plan === "2025"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}
                    >
                      Sílabo {plan}
                    </span>
                    {course.isRescheduled && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Reprogramado
                      </span>
                    )}
                    {is2025Equiv && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Equiv. Sílabo 2017
                      </span>
                    )}
                    {has2025Equiv && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                        Tiene equiv. 2025
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border border-border shrink-0">
                    {course.credits} cr
                  </span>
                </div>

                {/* Course name */}
                <h3 className="font-bold text-sm">{course.name}</h3>

                {/* Meta row */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    Año {course.year} — Sem {course.semester === 1 ? "A" : "B"}
                  </span>
                  {course.isRescheduled && course.rescheduledReason && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                      {course.rescheduledReason}
                    </span>
                  )}
                </div>

                {/* Equivalence info */}
                {is2025Equiv && course.replacesEquiv2017Names && (
                  <div className="mt-2 pl-3 border-l-2 border-rose-500/30">
                    <div className="flex items-center gap-1 text-[10px] text-rose-500/70 dark:text-rose-400/70 font-semibold uppercase tracking-wide mb-1">
                      <ArrowDown className="w-3 h-3" />
                      Equivalencia Sílabo 2017
                    </div>
                    {course.replacesEquiv2017Names.map((name, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <span className="font-mono text-[10px]">
                          {course.replacesEquiv2017Codes?.[i]}
                        </span>
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {has2025Equiv && course.replacementCourse && (
                  <div className="mt-2 pl-3 border-l-2 border-violet-500/30">
                    <div className="flex items-center gap-1 text-[10px] text-violet-500/70 dark:text-violet-400/70 font-semibold uppercase tracking-wide mb-1">
                      <ArrowDown className="w-3 h-3" />
                      Equivalente en Sílabo 2025
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-mono text-[10px]">
                        {course.replacedBy}
                      </span>
                      <span>{course.replacementCourse.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.label>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
