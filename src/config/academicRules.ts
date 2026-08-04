/**
 * Reglas académicas configurables del Sistema de Planificación de Matrícula.
 *
 * Modificar estos valores para adaptar la aplicación a cambios reglamentarios
 * sin tocar la lógica principal del motor curricular.
 */

export const ACADEMIC_RULES = {
  // ── Créditos por semestre ──────────────────────────────────────────────────
  /** Mínimo de créditos que debe llevar un estudiante en cada semestre. */
  minCreditsPerSemester: 12,
  /** Máximo de créditos permitidos por semestre. */
  maxCreditsPerSemester: 24,

  // ── Transición de planes ───────────────────────────────────────────────────
  /**
   * Último año de ingreso que pertenece al Sílabo 2017.
   * A partir del año siguiente se aplica el Sílabo 2025.
   */
  lastCohortPlan2017: 2024,

  /**
   * Año desde el cual se oferta el Sílabo 2025.
   */
  firstCohortPlan2025: 2025,

  /**
   * ─────────────────────────────────────────────────────────────────────────
   * FÓRMULA DE RETIRO PROGRESIVO DEL PLAN 2017
   * ─────────────────────────────────────────────────────────────────────────
   *
   * La cohorte 2024 es la última del Sílabo 2017. Su avance académico:
   *
   *   Año 1 de carrera  →  año académico 2024  (año que ingresaron)
   *   Año 2 de carrera  →  año académico 2025
   *   Año 3 de carrera  →  año académico 2026
   *   Año 4 de carrera  →  año académico 2027
   *   Año 5 de carrera  →  año académico 2028
   *
   * El último año en que se ofrece un curso de año N del Plan 2017 es:
   *
   *   lastYearOffered(N) = lastCohortPlan2017 + (N - 1)
   *                      = 2024 + N - 1
   *                      = 2023 + N
   *
   * Un curso de año N está RETIRADO cuando:
   *   enrollmentYear > lastYearOffered(N)
   *   enrollmentYear > 2023 + N
   *
   * Verificación (enrollmentYear = 2026):
   *   Año 1: retirado si 2026 > 2024  → TRUE  ✓ (cohorte 2024 ya está en año 3)
   *   Año 2: retirado si 2026 > 2025  → TRUE  ✓ (nadie del plan 2017 está en año 2)
   *   Año 3: retirado si 2026 > 2026  → FALSE ✓ (cohorte 2024 está cursando año 3)
   *   Año 4: retirado si 2026 > 2027  → FALSE ✓
   *   Año 5: retirado si 2026 > 2028  → FALSE ✓
   *
   * Verificación (enrollmentYear = 2027):
   *   Año 1,2,3: retirados (TRUE)   Año 4,5: activos (FALSE)  ✓
   *
   * Progresión completa del retiro:
   *   2025 → retira año 1
   *   2026 → retira años 1-2
   *   2027 → retira años 1-3
   *   2028 → retira años 1-4
   *   2029 → retira años 1-5 (Plan 2017 completamente retirado)
   */
  plan2017RetirementFormula: (courseYear: number, enrollmentYear: number): boolean => {
    // lastYearOffered = lastCohortPlan2017 + (courseYear - 1)
    const lastYearOffered = ACADEMIC_RULES.lastCohortPlan2017 - 1 + courseYear;
    return enrollmentYear > lastYearOffered;
  },

  /**
   * Dado un año de matrícula, devuelve los años de carrera del Plan 2017
   * que aún siguen vigentes (tienen al menos una cohorte activa del plan 2017).
   *
   * Un año de carrera N está vigente si enrollmentYear <= 2023 + N
   * i.e., N >= enrollmentYear - 2023
   */
  activePlan2017CareerYears: (enrollmentYear: number): number[] => {
    return [1, 2, 3, 4, 5].filter(
      n => !ACADEMIC_RULES.plan2017RetirementFormula(n, enrollmentYear),
    );
  },

  // ── Reprogramaciones ───────────────────────────────────────────────────────
  /**
   * Número mínimo de estudiantes que necesitan el curso para que la
   * universidad lo programe en un semestre distinto al original.
   */
  minStudentsForReschedule: 30,

  // ── Selectores de periodo ─────────────────────────────────────────────────
  /** Cuántos años hacia atrás mostrar en el selector de periodo de matrícula. */
  enrollmentYearsBefore: 1,
  /** Cuántos años hacia adelante mostrar en el selector de periodo de matrícula. */
  enrollmentYearsAhead: 4,
} as const;
