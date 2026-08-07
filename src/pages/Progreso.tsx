import { useState } from "react";
import { useCurriculumEngine } from "../hooks/useCurriculumEngine";
import { useStudentStore } from "../hooks/useStudentStore";
import {
  Download,
  Printer,
  CheckCircle2,
  Layers,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookCheck,
  Zap,
  RotateCcw,
} from "lucide-react";

type BulkPanel = "year" | "semester" | "quick" | null;

export function Progreso() {
  const engine = useCurriculumEngine();
  const { profile, approveCourses, unapproveCourses, resetProfile } =
    useStudentStore();
  const [openPanel, setOpenPanel] = useState<BulkPanel>(null);

  if (!engine || !profile) return null;

  // ── Export / Import / Print ────────────────────────────────────────────────
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `malla-cs-progreso-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── Bulk helpers ───────────────────────────────────────────────────────────
  // Use the full plan courses (2017 or 2025) based on student's active plan.
  // This ensures we only ever approve courses from the student's own plan.
  const planCourses =
    engine.activePlan === "2017"
      ? engine.fullCourses2017
      : engine.fullCourses2025;

  const coursesByYear = (year: number) =>
    planCourses.filter((c) => c.year === year).map((c) => c.code);

  const coursesBySemester = (year: number, semester: 1 | 2) =>
    planCourses
      .filter((c) => c.year === year && c.semester === semester)
      .map((c) => c.code);

  const availableNow = planCourses
    .filter(
      (c) =>
        (c.missingPrerequisites?.length ?? 0) === 0 && c.status !== "approved",
    )
    .map((c) => c.code);

  const confirm = (msg: string) => window.confirm(msg);

  const handleApproveYear = (year: number) => {
    if (
      !confirm(
        `¿Aprobar todos los cursos del Año ${year}? Esto actualizará tu historial.`,
      )
    )
      return;
    approveCourses(coursesByYear(year));
  };

  const handleUnapproveYear = (year: number) => {
    if (!confirm(`¿Quitar aprobación de todos los cursos del Año ${year}?`))
      return;
    unapproveCourses(coursesByYear(year));
  };

  const handleApproveSemester = (year: number, semester: 1 | 2) => {
    const label = `Año ${year} — Semestre ${semester === 1 ? "A" : "B"}`;
    if (!confirm(`¿Aprobar todos los cursos de ${label}?`)) return;
    approveCourses(coursesBySemester(year, semester));
  };

  const handleUnapproveSemester = (year: number, semester: 1 | 2) => {
    const label = `Año ${year} — Semestre ${semester === 1 ? "A" : "B"}`;
    if (!confirm(`¿Quitar aprobación de los cursos de ${label}?`)) return;
    unapproveCourses(coursesBySemester(year, semester));
  };

  const handleApproveAvailable = () => {
    if (availableNow.length === 0) return;
    if (
      !confirm(
        `¿Aprobar los ${availableNow.length} cursos actualmente disponibles?`,
      )
    )
      return;
    approveCourses(availableNow);
  };

  const handleReset = () => {
    if (
      !confirm("¿Reiniciar todo el progreso? Esta acción no se puede deshacer.")
    )
      return;
    resetProfile();
  };

  // ── Timeline ───────────────────────────────────────────────────────────────
  const approvedBySemester = engine.progressBySemester
    .filter((sem) => sem.approved > 0)
    .map((sem) => {
      const year = Math.ceil(sem.semester / 2);
      const semesterPart: 1 | 2 = sem.semester % 2 === 0 ? 2 : 1;
      const courses = engine.courses.filter(
        (c) =>
          c.year === year &&
          c.semester === semesterPart &&
          c.status === "approved",
      );
      return { ...sem, courses };
    });

  const toggle = (panel: BulkPanel) =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tu Historial</h1>
          <p className="text-muted-foreground mt-1">
            {engine.approvedCount} cursos aprobados · {engine.approvedCredits}{" "}
            créditos
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden flex-wrap">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 text-sm font-bold transition-colors"
          >
            <Printer className="w-4 h-4" /> PDF
          </button>
        </div>
      </header>

      {/* ── Bulk Approval Tools ──────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden print:hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Herramientas de Aprobación Masiva
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Marca o quita cursos en bloque para configurar tu historial
            rápidamente.
          </p>
        </div>

        <div className="divide-y divide-border">
          {/* Quick actions */}
          <div>
            <button
              onClick={() => toggle("quick")}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 font-semibold">
                <BookCheck className="w-4 h-4 text-emerald-500" />
                Acciones Rápidas
              </div>
              {openPanel === "quick" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {openPanel === "quick" && (
              <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleApproveAvailable}
                  disabled={availableNow.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar todos disponibles ({availableNow.length})
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar todo el progreso
                </button>
              </div>
            )}
          </div>

          {/* By year */}
          <div>
            <button
              onClick={() => toggle("year")}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 font-semibold">
                <Layers className="w-4 h-4 text-blue-500" />
                Aprobar / Quitar por Año
              </div>
              {openPanel === "year" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {openPanel === "year" && (
              <div className="px-5 pb-4 space-y-2">
                {[1, 2, 3, 4, 5].map((year) => {
                  const total = coursesByYear(year).length;
                  const approved = planCourses.filter(
                    (c) => c.year === year && c.status === "approved",
                  ).length;
                  return (
                    <div
                      key={year}
                      className="flex items-center justify-between gap-3 bg-muted/30 rounded-lg px-4 py-2.5"
                    >
                      <div>
                        <span className="font-semibold text-sm">
                          Año {year}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {approved}/{total} cursos
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveYear(year)}
                          className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-medium transition-colors"
                        >
                          Aprobar todo
                        </button>
                        <button
                          onClick={() => handleUnapproveYear(year)}
                          className="text-xs px-3 py-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-medium transition-colors"
                        >
                          Quitar todo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By semester */}
          <div>
            <button
              onClick={() => toggle("semester")}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 font-semibold">
                <Layers className="w-4 h-4 text-purple-500" />
                Aprobar / Quitar por Semestre
              </div>
              {openPanel === "semester" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {openPanel === "semester" && (
              <div className="px-5 pb-4 space-y-2">
                {[1, 2, 3, 4, 5].flatMap((year) =>
                  ([1, 2] as const).map((sem) => {
                    const codes = coursesBySemester(year, sem);
                    const approved = planCourses.filter(
                      (c) =>
                        c.year === year &&
                        c.semester === sem &&
                        c.status === "approved",
                    ).length;
                    return (
                      <div
                        key={`${year}-${sem}`}
                        className="flex items-center justify-between gap-3 bg-muted/30 rounded-lg px-4 py-2.5"
                      >
                        <div>
                          <span className="font-semibold text-sm">
                            Año {year} — Sem {sem === 1 ? "A" : "B"}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {approved}/{codes.length} cursos
                          </span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveSemester(year, sem)}
                            className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-medium transition-colors"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleUnapproveSemester(year, sem)}
                            className="text-xs px-3 py-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-medium transition-colors"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-2xl p-6 print:border-0 print:p-0">
        <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Línea de Tiempo
        </h2>

        {approvedBySemester.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trash2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              Aún no has marcado ningún curso como aprobado.
            </p>
            <p className="text-sm mt-1 opacity-70">
              Usa la Malla Curricular o las herramientas de arriba para
              comenzar.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-3 md:ml-6 space-y-10 pb-8">
            {approvedBySemester.map((sem) => (
              <div key={sem.name} className="relative pl-6 md:pl-8">
                <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 ring-4 ring-card" />

                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  Semestre {sem.name}
                  <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                    {sem.approved} cursos
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sem.courses.map((course) => (
                    <div
                      key={course.code}
                      className="bg-background border border-border rounded-xl p-3 flex justify-between items-center print:border-gray-300"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs text-muted-foreground font-semibold mb-0.5">
                          {course.code}
                        </div>
                        <div
                          className="font-bold text-sm truncate"
                          title={course.name}
                        >
                          {course.name}
                        </div>
                      </div>
                      <div className="ml-3 shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        {course.credits} cr
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
