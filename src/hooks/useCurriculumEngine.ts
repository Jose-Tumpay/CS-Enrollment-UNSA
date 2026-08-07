import { useMemo } from "react";
import {
  CourseWithStatus,
  CourseStatus,
  Course,
  EnrollmentSummary,
} from "../types";
import { courses2017 } from "../data/courses2017";
import { courses2025 } from "../data/courses2025";
import { equivalencias } from "../data/equivalencias";
import { reprogramaciones } from "../data/reprogramaciones";
import { ACADEMIC_RULES } from "../config/academicRules";
import { useStudentStore } from "./useStudentStore";

// ─── Lookup maps (module-level, created once) ─────────────────────────────────

/** 2017 code → 2025 code */
const equiv2017to2025 = new Map<string, string>();
/** 2025 code → 2017 codes[] */
const equiv2025to2017 = new Map<string, string[]>();
/** All 2017 codes that have a 2025 replacement */
const hasPlan2025Replacement = new Set<string>();

for (const e of equivalencias) {
  equiv2025to2017.set(e.plan2025Code, e.plan2017Codes);
  for (const c17 of e.plan2017Codes) {
    equiv2017to2025.set(c17, e.plan2025Code);
    hasPlan2025Replacement.add(c17);
  }
}

const courseMap2017 = new Map(courses2017.map((c) => [c.code, c]));
const courseMap2025 = new Map(courses2025.map((c) => [c.code, c]));

/**
 * Créditos "ideales" por semestre (1..10): la carga de un estudiante que
 * aprueba todo sin atrasos y egresa en 5 años, según el plan oficial.
 * Se calcula sumando los créditos reales de courses2017/courses2025 —
 * nunca se hardcodea, así queda siempre sincronizado con los datos.
 * Índice 0 = Año1-A, índice 1 = Año1-B, ..., índice 9 = Año5-B.
 */
function computeIdealCreditsBySemester(courses: Course[]): number[] {
  const sums = new Array(10).fill(0);
  for (const c of courses) {
    const idx = (c.year - 1) * 2 + (c.semester - 1);
    if (idx >= 0 && idx < 10) sums[idx] += c.credits;
  }
  return sums;
}

const idealCreditsPerSemester2017 = computeIdealCreditsBySemester(courses2017);
const idealCreditsPerSemester2025 = computeIdealCreditsBySemester(courses2025);

/**
 * Expands a course code to the full set of codes that represent "the same
 * requirement" across both plans: itself, plus its direct 2017↔2025
 * equivalent(s) if any exist.
 */
function expandCodeEquivalents(code: string): string[] {
  const result = new Set([code]);
  const c25 = equiv2017to2025.get(code);
  if (c25) result.add(c25);
  const c17arr = equiv2025to2017.get(code);
  if (c17arr) c17arr.forEach((c) => result.add(c));
  return [...result];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determines whether a Plan 2017 course is still being offered for a given
 * enrollment year, based on the progressive implementation of Plan 2025.
 */
function is2017CourseRetiredForYear(
  course: Course,
  enrollmentYear: number,
): boolean {
  if (course.plan !== "2017") return false;
  return ACADEMIC_RULES.plan2017RetirementFormula(course.year, enrollmentYear);
}

/**
 * Check if a course has a reprogramación that makes it available in the
 * target semester, even if it normally belongs to a different semester.
 */
function getRescheduledSemester(
  courseCode: string,
  enrollmentYear: number,
): { offeredSemester: 1 | 2; reason: string } | null {
  const match = reprogramaciones.find(
    (r) => r.courseCode === courseCode && r.enrollmentYear === enrollmentYear,
  );
  if (!match) return null;
  return { offeredSemester: match.offeredSemester, reason: match.reason ?? "" };
}

/**
 * Returns true when a Plan 2025 course doesn't have a 2025-cohort class yet
 * for the given enrollment year.
 */
export function is2025CourseNotYetActive(
  course: Course,
  enrollmentYear: number,
): boolean {
  if (course.plan !== "2025") return false;
  const currentCohortYear =
    enrollmentYear - ACADEMIC_RULES.firstCohortPlan2025 + 1;
  return course.year > currentCohortYear;
}

// ─────────────────────────────────────────────────────────────────────────────

function computeCourseStatus(
  course: Course,
  effectiveApproved: Set<string>,
  isSimulated: boolean,
): CourseWithStatus {
  const isEffectivelyApproved = effectiveApproved.has(course.code);
  const missingPrerequisites = course.prerequisites.filter(
    (p) => !effectiveApproved.has(p),
  );

  const replacedByCode = hasPlan2025Replacement.has(course.code)
    ? equiv2017to2025.get(course.code)
    : undefined;
  const replacementCourse = replacedByCode
    ? courseMap2025.get(replacedByCode)
    : undefined;

  let status: CourseStatus;
  if (isEffectivelyApproved) {
    status = "approved";
  } else if (missingPrerequisites.length > 0) {
    status = "locked";
  } else if (course.isElective) {
    status = "elective";
  } else {
    status = "available";
  }

  return {
    ...course,
    status,
    missingPrerequisites,
    replacementCourse,
    replacedBy: replacedByCode,
    simulated: isSimulated,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function useCurriculumEngine() {
  const { profile } = useStudentStore();

  return useMemo(() => {
    if (!profile) return null;

    const { entryYear, enrollmentTarget } = profile;
    const enrollYear = enrollmentTarget.year;
    const enrollSem = enrollmentTarget.semester;

    // ── 1. Active plan ────────────────────────────────────────────────────────
    const activePlan =
      entryYear < ACADEMIC_RULES.firstCohortPlan2025 ? "2017" : "2025";

    // ── 2. Student context ────────────────────────────────────────────────────
    const studentCareerYear = Math.max(
      1,
      Math.min(5, enrollYear - entryYear + 1),
    );

    const activePlan2017CareerYears =
      ACADEMIC_RULES.activePlan2017CareerYears(enrollYear);
    const retiredPlan2017CareerYears = [1, 2, 3, 4, 5].filter(
      (y) => !activePlan2017CareerYears.includes(y),
    );

    // ── 3. Cross-plan effective approvals ─────────────────────────────────────
    // BUG FIX: ONLY approvedCourses count for prerequisites/progress.
    // simulatedCourses are for enrollment planning ONLY and must NOT unlock anything.
    const directApproved = new Set(profile.approvedCourses);

    const effectiveApproved = new Set<string>(directApproved);

    for (const code of directApproved) {
      const c25 = equiv2017to2025.get(code);
      if (c25) effectiveApproved.add(c25);
      const c17arr = equiv2025to2017.get(code);
      if (c17arr) c17arr.forEach((c) => effectiveApproved.add(c));
    }

    const simulatedSet = new Set(profile.simulatedCourses);

    // ── 4. Resolve BOTH plans' active courses ─────────────────────────────────
    const kept2017: Course[] = [];
    for (const c of courses2017) {
      const isRetired = is2017CourseRetiredForYear(c, enrollYear);
      const alreadyApproved = effectiveApproved.has(c.code);

      if (!isRetired) {
        kept2017.push(c);
      } else if (alreadyApproved) {
        // Retired but passed — keep as history (not enrollable)
        kept2017.push(c);
      }
      // Retired & not approved: omitted
    }

    const kept2025: Course[] = [];
    for (const c of courses2025) {
      const notYetActive = is2025CourseNotYetActive(c, enrollYear);
      if (!notYetActive) {
        kept2025.push(c);
      }
    }

    const resolvedCourses: Course[] = [...kept2017, ...kept2025];

    // ── 5. Compute per-course status ──────────────────────────────────────────
    // Status is based ONLY on approved courses (effectiveApproved), NOT simulated.
    const coursesWithStatus: CourseWithStatus[] = resolvedCourses.map(
      (course) => {
        const isSimulated = simulatedSet.has(course.code);
        const result = computeCourseStatus(
          course,
          effectiveApproved,
          isSimulated,
        );

        const isRetiredForPeriod =
          course.plan === "2017" &&
          is2017CourseRetiredForYear(course, enrollYear) &&
          !effectiveApproved.has(course.code);

        // For 2025 courses: which 2017 codes does this replace?
        const replacesEquiv2017Codes = equiv2025to2017.get(course.code);
        const replacesEquiv2017Names = replacesEquiv2017Codes?.map(
          (c) => courseMap2017.get(c)?.name ?? c,
        );

        return {
          ...result,
          isRetiredForPeriod,
          noEquivalenceAvailable: false,
          isInjectedEquivalent:
            !!replacesEquiv2017Codes && course.plan === "2025",
          replacesEquiv2017Codes,
          replacesEquiv2017Names,
        };
      },
    );

    // ── 6. Enrollment availability ────────────────────────────────────────────
    const coursesWithEnrollment: CourseWithStatus[] = coursesWithStatus.map(
      (course) => {
        if (course.status === "approved") {
          return { ...course, availableForEnrollment: false };
        }
        if ((course.missingPrerequisites?.length ?? 0) > 0) {
          return { ...course, availableForEnrollment: false };
        }
        // Retired Plan 2017 course kept only as history — not enrollable
        if (course.isRetiredForPeriod) {
          return { ...course, availableForEnrollment: false };
        }

        const reschedule = getRescheduledSemester(course.code, enrollYear);
        const isRescheduled =
          reschedule !== null && reschedule.offeredSemester === enrollSem;
        const inTargetSemester = course.semester === enrollSem || isRescheduled;

        return {
          ...course,
          availableForEnrollment: inTargetSemester,
          isRescheduled,
          rescheduledReason: isRescheduled ? reschedule?.reason : undefined,
        };
      },
    );

    // ── 7. Progress statistics ────────────────────────────────────────────────
    let totalCredits = 0;
    let approvedCredits = 0;
    let approvedCount = 0;
    const totalCount = coursesWithEnrollment.length;

    for (const c of coursesWithEnrollment) {
      totalCredits += c.credits;
      if (profile.approvedCourses.includes(c.code)) {
        approvedCredits += c.credits;
        approvedCount++;
      }
    }

    const progressPercentage =
      totalCredits > 0 ? (approvedCredits / totalCredits) * 100 : 0;

    // ── 8. Full plan views ────────────────────────────────────────────────────
    const fullCourses2017: CourseWithStatus[] = courses2017.map((c) => {
      const isSimulated = simulatedSet.has(c.code);
      const result = computeCourseStatus(c, effectiveApproved, isSimulated);
      const isRetiredForPeriod =
        is2017CourseRetiredForYear(c, enrollYear) &&
        !effectiveApproved.has(c.code);
      return { ...result, isRetiredForPeriod };
    });

    const fullCourses2025: CourseWithStatus[] = courses2025.map((c) => {
      const isSimulated = simulatedSet.has(c.code);
      return computeCourseStatus(c, effectiveApproved, isSimulated);
    });

    // ── 9. Bottleneck detection ───────────────────────────────────────────────
    const getDescendants = (
      code: string,
      visited = new Set<string>(),
    ): Set<string> => {
      if (visited.has(code)) return visited;
      visited.add(code);
      const equivalents = expandCodeEquivalents(code);
      for (const c of coursesWithEnrollment) {
        if (c.prerequisites.some((p) => equivalents.includes(p)))
          getDescendants(c.code, visited);
      }
      return visited;
    };

    const nonApproved = coursesWithEnrollment.filter(
      (c) => !effectiveApproved.has(c.code),
    );
    let maxDownstream = 0;
    const downstreamCounts: Record<string, number> = {};

    for (const c of nonApproved) {
      const count = getDescendants(c.code).size - 1;
      downstreamCounts[c.code] = count;
      if (count > maxDownstream) maxDownstream = count;
    }

    const bottleneckCourses = nonApproved.filter(
      (c) => downstreamCounts[c.code] === maxDownstream && maxDownstream > 0,
    );

    // ── 10. Progress by year / semester ───────────────────────────────────────
    const progressByYear = [1, 2, 3, 4, 5].map((yr) => {
      const yrCourses = coursesWithEnrollment.filter((c) => c.year === yr);
      const approved = yrCourses.filter((c) => effectiveApproved.has(c.code));
      return {
        year: yr,
        total: yrCourses.length,
        approved: approved.length,
        percentage:
          yrCourses.length > 0 ? (approved.length / yrCourses.length) * 100 : 0,
      };
    });

    const progressBySemester = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => {
      const yr = Math.ceil(sem / 2);
      const s: 1 | 2 = sem % 2 === 0 ? 2 : 1;
      const semCourses = coursesWithEnrollment.filter(
        (c) => c.year === yr && c.semester === s,
      );
      const approved = semCourses.filter((c) => effectiveApproved.has(c.code));
      return {
        semester: sem,
        name: `${yr}-${s === 1 ? "A" : "B"}`,
        total: semCourses.length,
        approved: approved.length,
        percentage:
          semCourses.length > 0
            ? (approved.length / semCourses.length) * 100
            : 0,
      };
    });

    // ── 11. Estimated semesters remaining ──────────────────────────────────────
    const getLongestPath = (code: string): number => {
      const children = coursesWithEnrollment.filter(
        (c) => c.prerequisites.includes(code) && !effectiveApproved.has(c.code),
      );
      if (children.length === 0) return 1;
      return 1 + Math.max(...children.map((c) => getLongestPath(c.code)));
    };

    const availableNow = coursesWithEnrollment.filter(
      (c) =>
        !effectiveApproved.has(c.code) &&
        (c.missingPrerequisites?.length ?? 0) === 0,
    );
    let longestPath = 0;
    for (const c of availableNow) {
      longestPath = Math.max(longestPath, getLongestPath(c.code));
    }

    const remainingCredits = totalCredits - approvedCredits;
    const estimatedSemestersRemaining = Math.max(
      Math.ceil(remainingCredits / ACADEMIC_RULES.maxCreditsPerSemester),
      longestPath,
    );

    // ── 12. Enrollment summary (for Simulator) ────────────────────────────────
    const selectedCourseObjs = coursesWithEnrollment.filter((c) =>
      simulatedSet.has(c.code),
    );
    const simulatedCredits = selectedCourseObjs.reduce(
      (s, c) => s + c.credits,
      0,
    );

    // willUnlock: projection of what WOULD unlock IF the selected courses were approved.
    // This is for display purposes only in the simulator panel.
    const projectedApproved = new Set(effectiveApproved);
    for (const code of profile.simulatedCourses) {
      projectedApproved.add(code);
      const c25 = equiv2017to2025.get(code);
      if (c25) projectedApproved.add(c25);
      const c17arr = equiv2025to2017.get(code);
      if (c17arr) c17arr.forEach((c) => projectedApproved.add(c));
    }

    const willUnlock = coursesWithEnrollment.filter(
      (c) =>
        c.status === "locked" &&
        c.missingPrerequisites?.every((p) => {
          const equivalents = expandCodeEquivalents(p);
          return (
            equivalents.some((eq) => profile.simulatedCourses.includes(eq)) ||
            equivalents.some(
              (eq) =>
                coursesWithEnrollment.find((x) => x.code === eq)?.status ===
                "approved",
            )
          );
        }),
    );

    const enrollmentSummary: EnrollmentSummary = {
      selectedCourses: selectedCourseObjs,
      totalCredits: simulatedCredits,
      isUnderMinimum:
        profile.simulatedCourses.length > 0 &&
        simulatedCredits < ACADEMIC_RULES.minCreditsPerSemester,
      isOverMaximum: simulatedCredits > ACADEMIC_RULES.maxCreditsPerSemester,
      creditWarning:
        simulatedCredits > ACADEMIC_RULES.maxCreditsPerSemester
          ? `Excedes el máximo de ${ACADEMIC_RULES.maxCreditsPerSemester} créditos.`
          : profile.simulatedCourses.length > 0 &&
              simulatedCredits < ACADEMIC_RULES.minCreditsPerSemester
            ? `Estás por debajo del mínimo de ${ACADEMIC_RULES.minCreditsPerSemester} créditos.`
            : null,
      willUnlock,
    };

    // ── 13. Helper: what does approving `code` unlock? ────────────────────────
    const unlockedBy = (courseCode: string): CourseWithStatus[] => {
      const equivalents = expandCodeEquivalents(courseCode);
      return coursesWithEnrollment.filter((c) =>
        c.prerequisites.some((p) => equivalents.includes(p)),
      );
    };

    // ── 14. Trayectoria ideal de créditos ─────────────────────────────────────
    const idealCreditsPerSemesterArr =
      activePlan === "2017"
        ? idealCreditsPerSemester2017
        : idealCreditsPerSemester2025;

    const idealCreditsBySemester = idealCreditsPerSemesterArr.map(
      (credits, i) => {
        const yr = Math.floor(i / 2) + 1;
        const s: 1 | 2 = i % 2 === 0 ? 1 : 2;
        return {
          semester: i + 1,
          name: `${yr}-${s === 1 ? "A" : "B"}`,
          credits,
        };
      },
    );

    const currentSemesterIndex = Math.max(
      1,
      Math.min(10, (studentCareerYear - 1) * 2 + enrollSem),
    );

    const idealCreditsCumulativeToDate = idealCreditsPerSemesterArr
      .slice(0, currentSemesterIndex)
      .reduce((sum, c) => sum + c, 0);

    const creditsAheadBehind = approvedCredits - idealCreditsCumulativeToDate;

    const recommendedCreditsThisSemester =
      idealCreditsPerSemesterArr[currentSemesterIndex - 1] ?? 0;

    return {
      activePlan,
      studentCareerYear,
      activePlan2017CareerYears,
      retiredPlan2017CareerYears,
      courses: coursesWithEnrollment,
      fullCourses2017,
      fullCourses2025,
      effectiveApproved,
      totalCredits,
      approvedCredits,
      totalCount,
      approvedCount,
      progressPercentage,
      progressByYear,
      progressBySemester,
      estimatedSemestersRemaining,
      idealCreditsBySemester,
      idealCreditsCumulativeToDate,
      creditsAheadBehind,
      recommendedCreditsThisSemester,
      unlockedBy,
      bottleneckCourses,
      downstreamCounts,
      enrollmentTarget,
      enrollmentSummary,
    };
  }, [profile]);
}
