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

  // ── Course lists ────────────────────────────────────────────────────────────

  // All courses available for enrollment this semester
  const availableForSemester = engine.courses.filter(
    (c) => c.availableForEnrollment,
  );

  // Regular courses: Plan 2017 courses still being offered, or Plan 2025 native courses
  const regularCourses = availableForSemester.filter(
    (c) => !c.isInjectedEquivalent,
  );

  // Plan 2025 equivalents injected for Plan 2017 students (replacements for retired courses)
  const injectedEquivalents = availableForSemester.filter(
    (c) => c.isInjectedEquivalent,
  );

  // Rescheduled courses (for the notice banner)
  const rescheduledCourses = availableForSemester.filter(
    (c) => c.isRescheduled,
  );

  // Retired 2017 courses with NO official 2025 equivalent — student is stuck
  const noEquivCourses =
    engine.activePlan === "2017"
      ? engine.courses.filter((c) => c.noEquivalenceAvailable === true)
      : [];

  // Courses locked by missing prerequisites (correct semester, but blocked)
  const lockedThisSemester = engine.courses.filter(
    (c) =>
      c.semester === target.semester &&
      c.status !== "approved" &&
      !c.availableForEnrollment &&
      (c.missingPrerequisites?.length ?? 0) > 0,
  );

  const wrongSemesterAvailable = engine.courses.filter(
    (c) =>
      c.status === "available" &&
      c.semester !== target.semester &&
      !c.isRescheduled,
  );

  // ── Credit bar ──────────────────────────────────────────────────────────────
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

  // ── Context labels ──────────────────────────────────────────────────────────
  const studentCareerYearLabel = `Año ${engine.studentCareerYear} de carrera`;
  const retired2017YearsLabel =
    engine.retiredPlan2017CareerYears.length > 0
      ? `Años ${engine.retiredPlan2017CareerYears.join(", ")} del Sílabo 2017 no se ofertan en ${target.year}`
      : null;

  const totalNotRegular = injectedEquivalents.length + noEquivCourses.length;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Simulador de Matrícula
        </h1>
        <p className="text-muted-foreground mt-1">
          Solo se muestran los cursos realmente ofertados para el periodo
          seleccionado, según tu plan y el avance de las promociones.
        </p>
      </header>

      {/* ── Period Selector ──────────────────────────────────────────────────── */}
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
              &nbsp;·&nbsp; Plan {engine.activePlan}
              &nbsp;·&nbsp; {studentCareerYearLabel}
              &nbsp;·&nbsp; {availableForSemester.length} cursos disponibles
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

      {/* ── Main Grid ───────────────────────────────────────────────────────── */}
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

          {/* ── Section 1: Cursos disponibles (regulares) ─────────────────── */}
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
                  {injectedEquivalents.length > 0
                    ? "Revisa la sección de equivalentes del Sílabo 2025 a continuación."
                    : "Es posible que ya los hayas aprobado todos, o que debas aprobar prerrequisitos primero."}
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

          {/* ── Section 2: Equivalentes del Sílabo 2025 (inyectados) ─────── */}
          {engine.activePlan === "2017" &&
            (injectedEquivalents.length > 0 || noEquivCourses.length > 0) && (
              <div>
                <h2 className="text-xl font-bold border-b border-border pb-2 mb-1 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <Ban className="w-5 h-5 shrink-0" />
                  Cursos retirados del Sílabo 2017
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalNotRegular})
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Estos cursos ya no se ofertan en {target.year} porque la
                  promoción 2024 (última del Sílabo 2017) los superó.
                  {injectedEquivalents.length > 0 &&
                    " Los que tienen equivalencia oficial del Sílabo 2025 pueden matricularse normalmente."}
                </p>

                {/* Injected 2025 equivalents */}
                {injectedEquivalents.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <AnimatePresence initial={false}>
                      {injectedEquivalents.map((course) => {
                        const isSelected = profile.simulatedCourses.includes(
                          course.code,
                        );
                        return (
                          <motion.div
                            key={`equiv-${course.code}`}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                          >
                            {/* 2025 course card — enrollable */}
                            <label
                              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-primary/10 border-primary ring-1 ring-primary shadow-sm"
                                  : "bg-card border-rose-500/30 hover:border-rose-500/60 hover:bg-muted/50"
                              }`}
                            >
                              {/* Checkbox */}
                              <div
                                className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-input bg-background"
                                }`}
                                onClick={() =>
                                  toggleCourseSimulated(course.code)
                                }
                              >
                                {isSelected && (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </div>

                              <div
                                className="flex-1 min-w-0"
                                onClick={() =>
                                  toggleCourseSimulated(course.code)
                                }
                              >
                                {/* Top row: code + badges + credits */}
                                <div className="flex justify-between items-start mb-0.5 gap-2">
                                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                                    {course.code}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {course.isRescheduled && (
                                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        Reprogramado
                                      </span>
                                    )}
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                      Equivalencia Sílabo 2017
                                    </span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border border-border">
                                      {course.credits} cr
                                    </span>
                                  </div>
                                </div>

                                {/* Course name (2025) */}
                                <h3 className="font-bold text-sm">
                                  {course.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Año {course.year} — Sem{" "}
                                  {course.semester === 1 ? "A" : "B"} · Sílabo
                                  2025
                                </p>

                                {/* Equivalence mapping */}
                                {(course.replacesEquiv2017Names?.length ?? 0) >
                                  0 && (
                                  <div className="mt-2 pl-3 border-l-2 border-rose-500/30">
                                    <div className="flex items-center gap-1 text-[10px] text-rose-500/70 dark:text-rose-400/70 font-semibold uppercase tracking-wide mb-1">
                                      <ArrowDown className="w-3 h-3" />
                                      Equivale a
                                    </div>
                                    {course.replacesEquiv2017Names!.map(
                                      (name, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-1.5"
                                        >
                                          <span className="font-mono text-[10px] text-muted-foreground">
                                            {course.replacesEquiv2017Codes?.[i]}
                                          </span>
                                          <span className="text-xs font-medium text-foreground/80">
                                            {name}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground italic">
                                            · Sílabo 2017
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            </label>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* No-equivalent courses */}
                {noEquivCourses.length > 0 && (
                  <div className="space-y-3">
                    {noEquivCourses.map((course) => (
                      <div
                        key={`noequiv-${course.code}`}
                        className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
                      >
                        {/* Header row */}
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-mono text-xs text-muted-foreground font-semibold">
                              {course.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Sin equivalencia
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border border-border">
                              {course.credits} cr
                            </span>
                          </div>
                        </div>

                        {/* Name and location */}
                        <h3 className="font-bold text-sm mb-0.5">
                          {course.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Año {course.year} — Sem{" "}
                          {course.semester === 1 ? "A" : "B"} · Sílabo 2017
                        </p>

                        {/* Warning message */}
                        <div className="mt-3 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                          Este curso ya no se oferta y{" "}
                          <strong>
                            no posee una equivalencia oficial en el Sílabo 2025
                          </strong>
                          . Para aprobarlo sería necesaria una reprogramación
                          extraordinaria o una disposición especial de la
                          Escuela Profesional.
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* ── Section 3: Bloqueados este semestre ───────────────────────── */}
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

          {/* ── Other semester info ────────────────────────────────────────── */}
          {wrongSemesterAvailable.length > 0 && (
            <div className="bg-muted/30 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                <AlertTriangle className="w-4 h-4" />
                {wrongSemesterAvailable.length} cursos disponibles en Semestre{" "}
                {target.semester === 1 ? "B" : "A"} (no este periodo)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wrongSemesterAvailable.slice(0, 10).map((c) => (
                  <span
                    key={c.code}
                    className="text-xs bg-background border border-border px-2 py-1 rounded font-mono opacity-70"
                  >
                    {c.code}
                  </span>
                ))}
                {wrongSemesterAvailable.length > 10 && (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    +{wrongSemesterAvailable.length - 10} más
                  </span>
                )}
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
                  className={`font-bold text-2xl ${isOverMaximum ? "text-destructive" : isUnderMinimum ? "text-amber-500" : "text-primary"}`}
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

            {/* Recommended load vs selected (reference only, not an official limit) */}
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
                      className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                    >
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs truncate">{c.name}</span>
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
                              ↳ Equiv. de: {c.replacesEquiv2017Names![0]}
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
          return (
            <motion.label
              key={`reg-${course.code}`}
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
                <div className="flex justify-between items-start mb-0.5 gap-2">
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    {course.code}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {course.isRescheduled && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Reprogramado
                      </span>
                    )}
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border border-border">
                      {course.credits} cr
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-sm">{course.name}</h3>
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
              </div>
            </motion.label>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
