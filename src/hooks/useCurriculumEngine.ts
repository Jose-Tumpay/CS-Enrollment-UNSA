import { useMemo } from 'react';
import { CourseWithStatus, CourseStatus, Course, EnrollmentSummary } from '../types';
import { courses2017 } from '../data/courses2017';
import { courses2025 } from '../data/courses2025';
import { equivalencias } from '../data/equivalencias';
import { reprogramaciones } from '../data/reprogramaciones';
import { ACADEMIC_RULES } from '../config/academicRules';
import { useStudentStore } from './useStudentStore';

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

const courseMap2017 = new Map(courses2017.map(c => [c.code, c]));
const courseMap2025 = new Map(courses2025.map(c => [c.code, c]));

/**
 * Expands a course code to the full set of codes that represent "the same
 * requirement" across both plans: itself, plus its direct 2017↔2025
 * equivalent(s) if any exist.
 *
 * Why this is needed: when a Plan 2017 course is retired and injected as its
 * 2025 replacement in the resolved course list, courses that still list the
 * OLD 2017 code as a prerequisite are not automatically rewritten. Direct
 * string comparison (`prerequisites.includes(code)`) then fails to link the
 * injected replacement to the courses it actually unlocks. Any graph
 * traversal over `prerequisites` (unlockedBy, bottleneck detection, the
 * simulator's "willUnlock" preview) must match through this expanded set,
 * not raw code equality — otherwise it silently under-reports downstream
 * impact for every course sitting right at the plan-2017/plan-2025
 * substitution boundary (which is common: any active year's prerequisites
 * usually live in the year just before it, and that year is often already
 * retired). The core "can I enroll" gate is unaffected by this, since it
 * already checks `effectiveApproved`, which is built with the same
 * expansion.
 */
function expandCodeEquivalents(code: string): string[] {
  const result = new Set([code]);
  const c25 = equiv2017to2025.get(code);
  if (c25) result.add(c25);
  const c17arr = equiv2025to2017.get(code);
  if (c17arr) c17arr.forEach(c => result.add(c));
  return [...result];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determines whether a Plan 2017 course is still being offered for a given
 * enrollment year, based on the progressive implementation of Plan 2025.
 *
 * The 2024 cohort (last Plan 2017 cohort) started year 1 in 2024.
 * Their progression: Year N → academic year 2024 + (N-1) = 2023 + N
 *
 * A Plan 2017 Year-N course is retired when enrollmentYear > 2023 + N.
 *
 * Example (enrollmentYear = 2026):
 *   Year 1: 2026 > 2024 → retired  (no 2017 student is in year 1)
 *   Year 2: 2026 > 2025 → retired  (no 2017 student is in year 2)
 *   Year 3: 2026 > 2026 → active   (2024 cohort is in year 3)
 *   Year 4: 2026 > 2027 → active
 *   Year 5: 2026 > 2028 → active
 */
function is2017CourseRetiredForYear(course: Course, enrollmentYear: number): boolean {
  if (course.plan !== '2017') return false;
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
    r =>
      r.courseCode === courseCode &&
      r.enrollmentYear === enrollmentYear,
  );
  if (!match) return null;
  return { offeredSemester: match.offeredSemester, reason: match.reason ?? '' };
}

/**
 * Returns true when a Plan 2025 course doesn't have a 2025-cohort class yet
 * for the given enrollment year.
 *
 * The 2025 cohort started year 1 in 2025 (when they enrolled).
 * cohortCareerYear = enrollmentYear - firstCohortPlan2025 + 1
 *
 * Example — enrollmentYear 2026:
 *   cohortCareerYear = 2026 - 2025 + 1 = 2
 *   → years 3-5 not yet active for the 2025 cohort.
 */
export function is2025CourseNotYetActive(course: Course, enrollmentYear: number): boolean {
  if (course.plan !== '2025') return false;
  const currentCohortYear = enrollmentYear - ACADEMIC_RULES.firstCohortPlan2025 + 1;
  return course.year > currentCohortYear;
}

// ─────────────────────────────────────────────────────────────────────────────

function computeCourseStatus(
  course: Course,
  effectiveApproved: Set<string>,
  isSimulated: boolean,
): CourseWithStatus {
  const isEffectivelyApproved = effectiveApproved.has(course.code);
  const missingPrerequisites = course.prerequisites.filter(p => !effectiveApproved.has(p));

  const replacedByCode = hasPlan2025Replacement.has(course.code)
    ? equiv2017to2025.get(course.code)
    : undefined;
  const replacementCourse = replacedByCode
    ? courseMap2025.get(replacedByCode)
    : undefined;

  let status: CourseStatus;
  if (isEffectivelyApproved) {
    status = 'approved';
  } else if (missingPrerequisites.length > 0) {
    status = 'locked';
  } else if (course.isElective) {
    status = 'elective';
  } else {
    status = 'available';
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
    const activePlan = entryYear < ACADEMIC_RULES.firstCohortPlan2025 ? '2017' : '2025';

    // ── 2. Student context ────────────────────────────────────────────────────
    // Career year the student is in during the enrollment period
    const studentCareerYear = Math.max(1, Math.min(5, enrollYear - entryYear + 1));

    // For Plan 2017 students: which career years of the 2017 plan are still
    // being offered for the selected enrollment year?
    // Active years are those where the last cohort (2024) still has students.
    // Minimum active year = enrollYear - lastCohortPlan2017 + 1 = enrollYear - 2023
    const activePlan2017CareerYears = ACADEMIC_RULES.activePlan2017CareerYears(enrollYear);
    const retiredPlan2017CareerYears = [1, 2, 3, 4, 5].filter(
      y => !activePlan2017CareerYears.includes(y),
    );

    // ── 3. Cross-plan effective approvals ─────────────────────────────────────
    // Approving one side of an equivalency automatically approves the other.
    const directApproved = new Set([
      ...profile.approvedCourses,
      ...profile.simulatedCourses,
    ]);

    const effectiveApproved = new Set<string>(directApproved);

    for (const code of directApproved) {
      const c25 = equiv2017to2025.get(code);
      if (c25) effectiveApproved.add(c25);
      const c17arr = equiv2025to2017.get(code);
      if (c17arr) c17arr.forEach(c => effectiveApproved.add(c));
    }

    const simulatedSet = new Set(profile.simulatedCourses);

    // ── 4. Resolve student's course list (smart substitution) ─────────────────
    //
    // Decision order for Plan 2017 students:
    //   a) Is the course still offered for enrollYear? (activePlan2017CareerYears)
    //   b) If NOT offered AND not yet approved → inject 2025 equivalent
    //   c) If NOT offered BUT already approved → keep as approved history
    //   d) If NO 2025 equivalent exists → keep but mark unavailable
    //
    // For Plan 2025 students: use Plan 2025 courses directly.

    const injected2025Codes = new Set<string>();
    /**
     * Maps each injected 2025 code → the array of 2017 codes it replaces.
     * A single 2025 course can replace more than one 2017 course.
     */
    const injected2025To2017 = new Map<string, string[]>();
    /**
     * 2017 course codes that are retired for this enrollment year AND have
     * no official equivalent in Plan 2025. Students are stuck until an
     * extraordinary reprogramación or academic disposition is issued.
     */
    const retiredNoEquivCodes = new Set<string>();

    let resolvedCourses: Course[];

    if (activePlan === '2017') {
      const kept2017: Course[] = [];

      for (const c of courses2017) {
        const isRetired = is2017CourseRetiredForYear(c, enrollYear);
        const alreadyApproved = effectiveApproved.has(c.code);

        if (!isRetired) {
          // Still being offered — keep as-is
          kept2017.push(c);
        } else if (alreadyApproved) {
          // Retired but student already passed it — keep as approved history
          kept2017.push(c);
        } else {
          // Retired and not yet approved → inject 2025 equivalent (if exists)
          const code2025 = equiv2017to2025.get(c.code);
          if (code2025) {
            injected2025Codes.add(code2025);
            // Record which 2017 course(s) this 2025 code replaces
            const existing = injected2025To2017.get(code2025) ?? [];
            existing.push(c.code);
            injected2025To2017.set(code2025, existing);
          } else {
            // No equivalent: keep original but it'll be unavailable for enrollment
            kept2017.push(c);
            retiredNoEquivCodes.add(c.code);
          }
        }
      }

      const injected2025: Course[] = Array.from(injected2025Codes)
        .map(code => courseMap2025.get(code))
        .filter((c): c is Course => !!c);

      resolvedCourses = [...kept2017, ...injected2025];
    } else {
      resolvedCourses = [...courses2025];
    }

    // ── 5. Compute per-course status ──────────────────────────────────────────
    const coursesWithStatus: CourseWithStatus[] = resolvedCourses.map(course => {
      const isSimulated = simulatedSet.has(course.code);
      const result = computeCourseStatus(course, effectiveApproved, isSimulated);

      // Mark if it's retired for this enrollment period (Plan 2017 course,
      // not yet approved, and the 2017 plan year has been phased out)
      const isRetiredForPeriod = is2017CourseRetiredForYear(course, enrollYear) &&
        !effectiveApproved.has(course.code);

      // Plan 2017 course retired with NO official 2025 equivalent
      const noEquivalenceAvailable = retiredNoEquivCodes.has(course.code);

      // Plan 2025 course injected to replace a retired 2017 course
      const isInjectedEquivalent = injected2025Codes.has(course.code);
      const replacesEquiv2017Codes = isInjectedEquivalent
        ? (injected2025To2017.get(course.code) ?? [])
        : undefined;
      const replacesEquiv2017Names = replacesEquiv2017Codes?.map(
        c => courseMap2017.get(c)?.name ?? c,
      );

      return {
        ...result,
        isRetiredForPeriod,
        noEquivalenceAvailable,
        isInjectedEquivalent,
        replacesEquiv2017Codes,
        replacesEquiv2017Names,
      };
    });

    // ── 6. Enrollment availability ────────────────────────────────────────────
    //
    // Decision order (mirrors the spec):
    //   1. Already approved → not available
    //   2. Missing prerequisites → not available
    //   3. Retired Plan 2017 course (still in list as history) → not available
    //   4. Check semester match (or reprogramación override)
    //   5. All checks pass → availableForEnrollment = true

    const coursesWithEnrollment: CourseWithStatus[] = coursesWithStatus.map(course => {
      if (course.status === 'approved') {
        return { ...course, availableForEnrollment: false };
      }
      if ((course.missingPrerequisites?.length ?? 0) > 0) {
        return { ...course, availableForEnrollment: false };
      }
      // Retired Plan 2017 course kept only as approved history — not enrollable
      if (course.isRetiredForPeriod) {
        return { ...course, availableForEnrollment: false };
      }

      // Check if it's in the target semester (or rescheduled to it)
      const reschedule = getRescheduledSemester(course.code, enrollYear);
      const isRescheduled = reschedule !== null && reschedule.offeredSemester === enrollSem;
      const inTargetSemester = course.semester === enrollSem || isRescheduled;

      return {
        ...course,
        availableForEnrollment: inTargetSemester,
        isRescheduled,
        rescheduledReason: isRescheduled ? reschedule?.reason : undefined,
      };
    });

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

    const progressPercentage = totalCredits > 0 ? (approvedCredits / totalCredits) * 100 : 0;

    // ── 8. Full plan views (for "Ver sílabo completo") ────────────────────────
    const fullCourses2017: CourseWithStatus[] = courses2017.map(c => {
      const isSimulated = simulatedSet.has(c.code);
      const result = computeCourseStatus(c, effectiveApproved, isSimulated);
      const isRetiredForPeriod = is2017CourseRetiredForYear(c, enrollYear) && !effectiveApproved.has(c.code);
      return { ...result, isRetiredForPeriod };
    });

    const fullCourses2025: CourseWithStatus[] = courses2025.map(c => {
      const isSimulated = simulatedSet.has(c.code);
      return computeCourseStatus(c, effectiveApproved, isSimulated);
    });

    // ── 9. Bottleneck detection ───────────────────────────────────────────────
    const getDescendants = (code: string, visited = new Set<string>()): Set<string> => {
      if (visited.has(code)) return visited;
      visited.add(code);
      const equivalents = expandCodeEquivalents(code);
      for (const c of coursesWithEnrollment) {
        if (c.prerequisites.some(p => equivalents.includes(p))) getDescendants(c.code, visited);
      }
      return visited;
    };

    const nonApproved = coursesWithEnrollment.filter(c => !effectiveApproved.has(c.code));
    let maxDownstream = 0;
    const downstreamCounts: Record<string, number> = {};

    for (const c of nonApproved) {
      const count = getDescendants(c.code).size - 1;
      downstreamCounts[c.code] = count;
      if (count > maxDownstream) maxDownstream = count;
    }

    const bottleneckCourses = nonApproved.filter(
      c => downstreamCounts[c.code] === maxDownstream && maxDownstream > 0,
    );

    // ── 10. Progress by year / semester ───────────────────────────────────────
    const progressByYear = [1, 2, 3, 4, 5].map(yr => {
      const yrCourses = coursesWithEnrollment.filter(c => c.year === yr);
      const approved = yrCourses.filter(c => effectiveApproved.has(c.code));
      return {
        year: yr,
        total: yrCourses.length,
        approved: approved.length,
        percentage: yrCourses.length > 0 ? (approved.length / yrCourses.length) * 100 : 0,
      };
    });

    const progressBySemester = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sem => {
      const yr = Math.ceil(sem / 2);
      const s: 1 | 2 = sem % 2 === 0 ? 2 : 1;
      const semCourses = coursesWithEnrollment.filter(c => c.year === yr && c.semester === s);
      const approved = semCourses.filter(c => effectiveApproved.has(c.code));
      return {
        semester: sem,
        name: `${yr}-${s === 1 ? 'A' : 'B'}`,
        total: semCourses.length,
        approved: approved.length,
        percentage: semCourses.length > 0 ? (approved.length / semCourses.length) * 100 : 0,
      };
    });

    // ── 11. Estimated semesters remaining ──────────────────────────────────────
    const getLongestPath = (code: string): number => {
      const children = coursesWithEnrollment.filter(
        c => c.prerequisites.includes(code) && !effectiveApproved.has(c.code),
      );
      if (children.length === 0) return 1;
      return 1 + Math.max(...children.map(c => getLongestPath(c.code)));
    };

    const availableNow = coursesWithEnrollment.filter(
      c => !effectiveApproved.has(c.code) && (c.missingPrerequisites?.length ?? 0) === 0,
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
    const selectedCourseObjs = coursesWithEnrollment.filter(c =>
      simulatedSet.has(c.code),
    );
    const simulatedCredits = selectedCourseObjs.reduce((s, c) => s + c.credits, 0);
    const willUnlock = coursesWithEnrollment.filter(
      c =>
        c.status === 'locked' &&
        c.missingPrerequisites?.every(p => {
          const equivalents = expandCodeEquivalents(p);
          return (
            equivalents.some(eq => profile.simulatedCourses.includes(eq)) ||
            equivalents.some(
              eq => coursesWithEnrollment.find(x => x.code === eq)?.status === 'approved',
            )
          );
        }),
    );

    const enrollmentSummary: EnrollmentSummary = {
      selectedCourses: selectedCourseObjs,
      totalCredits: simulatedCredits,
      isUnderMinimum: profile.simulatedCourses.length > 0 &&
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
      return coursesWithEnrollment.filter(c => c.prerequisites.some(p => equivalents.includes(p)));
    };

    return {
      // Plan & student context
      activePlan,
      studentCareerYear,
      activePlan2017CareerYears,
      retiredPlan2017CareerYears,

      // Courses
      courses: coursesWithEnrollment,
      fullCourses2017,
      fullCourses2025,

      // Approvals
      effectiveApproved,

      // Progress
      totalCredits,
      approvedCredits,
      totalCount,
      approvedCount,
      progressPercentage,
      progressByYear,
      progressBySemester,
      estimatedSemestersRemaining,

      // Navigation helpers
      unlockedBy,
      bottleneckCourses,
      downstreamCounts,

      // Enrollment
      enrollmentTarget,
      enrollmentSummary,
    };
  }, [profile]);
}
