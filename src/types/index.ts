export type ComponentType = 'D' | 'E' | 'F' | 'G';
// D = Est.Gen.: Capacidades de Aprendizaje
// E = Est.Gen.: Form.Humanist.Ident. y Ciudadania
// F = Estudios Específicos
// G = Estudios de Especialidad

export type CourseStatus = 'approved' | 'available' | 'locked' | 'equivalent' | 'elective' | 'phased_out';

export interface Course {
  code: string;
  name: string;
  credits: number;
  hoursTheory: number;
  hoursPractice: number;
  hoursLab: number;
  year: number;         // 1-5
  semester: number;     // 1 or 2
  component: ComponentType;
  prerequisites: string[];  // course codes
  plan: '2017' | '2025';
  isElective?: boolean;
}

export interface Equivalency {
  plan2025Code: string;    // course in new plan
  plan2017Codes: string[]; // equivalent courses in old plan
}

/**
 * Reprogramación: permite que un curso se oferte en un semestre distinto al
 * original, cuando hay suficiente demanda de estudiantes que necesitan repetirlo.
 */
export interface Reprogramacion {
  courseCode: string;
  originalSemester: 1 | 2;
  offeredSemester: 1 | 2;
  enrollmentYear: number;
  minStudents?: number;  // default: ACADEMIC_RULES.minStudentsForReschedule
  reason?: string;
}

export interface EnrollmentTarget {
  year: number;       // e.g. 2026
  semester: 1 | 2;   // 1 = Semestre A, 2 = Semestre B
}

export interface StudentProfile {
  entryYear: number;
  approvedCourses: string[];
  simulatedCourses: string[];
  enrollmentTarget: EnrollmentTarget;
  lastUpdated?: string;
}

export interface CourseWithStatus extends Course {
  status: CourseStatus;
  missingPrerequisites?: string[];
  replacementCourse?: Course;       // If retired, the 2025 replacement
  simulated?: boolean;
  availableForEnrollment?: boolean; // meets ALL enrollment rules
  replacedBy?: string;              // 2025 code that replaces this 2017 course
  isRetiredForPeriod?: boolean;     // true when Plan 2017 course is no longer offered for the enrollment year
  isRescheduled?: boolean;          // true when offered via reprogramación
  rescheduledReason?: string;

  // ── Transition flags (Plan 2017 → Plan 2025) ──────────────────────────────
  /**
   * true when this is a Plan 2025 course injected into a Plan 2017 student's
   * list because the original 2017 course is no longer offered.
   */
  isInjectedEquivalent?: boolean;
  /** Codes of the Plan 2017 course(s) this 2025 course replaces. */
  replacesEquiv2017Codes?: string[];
  /** Display names of those 2017 courses. */
  replacesEquiv2017Names?: string[];
  /**
   * true when this Plan 2017 course is retired for the current enrollment year
   * AND has no official equivalent in Plan 2025.
   * The student cannot enroll in it until an extraordinary reprogramación or
   * an official academic disposition is issued.
   */
  noEquivalenceAvailable?: boolean;
}

/** Summary of the current enrollment simulation */
export interface EnrollmentSummary {
  selectedCourses: CourseWithStatus[];
  totalCredits: number;
  isUnderMinimum: boolean;
  isOverMaximum: boolean;
  creditWarning: string | null;
  willUnlock: CourseWithStatus[];
}
