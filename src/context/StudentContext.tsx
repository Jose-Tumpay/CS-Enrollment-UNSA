import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StudentProfile, EnrollmentTarget } from '../types';

const STORE_KEY = 'student_profile_v2';

const currentYear = new Date().getFullYear();

function getDefaultEnrollmentTarget(): EnrollmentTarget {
  const month = new Date().getMonth() + 1; // 1-12
  return {
    year: currentYear,
    semester: month >= 3 && month <= 7 ? 1 : 2,
  };
}

interface StudentContextValue {
  profile: StudentProfile | null;
  isLoaded: boolean;
  updateEntryYear: (year: number) => void;
  toggleCourseApproved: (code: string) => void;
  toggleCourseSimulated: (code: string) => void;
  approveCourses: (codes: string[]) => void;
  unapproveCourses: (codes: string[]) => void;
  clearSimulated: () => void;
  resetProfile: () => void;
  approveSimulated: () => void;
  saveProfile: (profile: StudentProfile) => void;
  setEnrollmentTarget: (target: EnrollmentTarget) => void;
}

const StudentContext = createContext<StudentContextValue | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StudentProfile;
        if (!parsed.enrollmentTarget) {
          parsed.enrollmentTarget = getDefaultEnrollmentTarget();
        }
        setProfile(parsed);
      } else {
        // Migrate from legacy key
        const legacy = localStorage.getItem('student_profile');
        if (legacy) {
          const parsed = JSON.parse(legacy) as StudentProfile;
          const migrated: StudentProfile = {
            ...parsed,
            enrollmentTarget: parsed.enrollmentTarget ?? getDefaultEnrollmentTarget(),
          };
          localStorage.setItem(STORE_KEY, JSON.stringify(migrated));
          setProfile(migrated);
        }
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = useCallback((newProfile: StudentProfile) => {
    const toSave: StudentProfile = { ...newProfile, lastUpdated: new Date().toISOString() };
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
    setProfile(toSave);
  }, []);

  const updateEntryYear = useCallback((year: number) => {
    const base: StudentProfile = {
      entryYear: year,
      approvedCourses: [],
      simulatedCourses: [],
      enrollmentTarget: getDefaultEnrollmentTarget(),
    };
    saveProfile(profile ? { ...profile, entryYear: year } : base);
  }, [profile, saveProfile]);

  const toggleCourseApproved = useCallback((code: string) => {
    if (!profile) return;
    const isApproved = profile.approvedCourses.includes(code);
    const updated = isApproved
      ? profile.approvedCourses.filter(c => c !== code)
      : [...profile.approvedCourses, code];
    saveProfile({ ...profile, approvedCourses: updated });
  }, [profile, saveProfile]);

  const toggleCourseSimulated = useCallback((code: string) => {
    if (!profile) return;
    const isSimulated = profile.simulatedCourses.includes(code);
    const updated = isSimulated
      ? profile.simulatedCourses.filter(c => c !== code)
      : [...profile.simulatedCourses, code];
    saveProfile({ ...profile, simulatedCourses: updated });
  }, [profile, saveProfile]);

  // Approve a batch of courses (adds to existing approvals, deduplicates)
  const approveCourses = useCallback((codes: string[]) => {
    if (!profile) return;
    const updated = Array.from(new Set([...profile.approvedCourses, ...codes]));
    saveProfile({ ...profile, approvedCourses: updated });
  }, [profile, saveProfile]);

  // Remove approval from a batch of courses
  const unapproveCourses = useCallback((codes: string[]) => {
    if (!profile) return;
    const codeSet = new Set(codes);
    const updated = profile.approvedCourses.filter(c => !codeSet.has(c));
    saveProfile({ ...profile, approvedCourses: updated });
  }, [profile, saveProfile]);

  const clearSimulated = useCallback(() => {
    if (!profile) return;
    saveProfile({ ...profile, simulatedCourses: [] });
  }, [profile, saveProfile]);

  const resetProfile = useCallback(() => {
    localStorage.removeItem(STORE_KEY);
    setProfile(null);
  }, []);

  const approveSimulated = useCallback(() => {
    if (!profile) return;
    const updatedApproved = Array.from(new Set([...profile.approvedCourses, ...profile.simulatedCourses]));
    saveProfile({ ...profile, approvedCourses: updatedApproved, simulatedCourses: [] });
  }, [profile, saveProfile]);

  const setEnrollmentTarget = useCallback((target: EnrollmentTarget) => {
    if (!profile) return;
    saveProfile({ ...profile, enrollmentTarget: target });
  }, [profile, saveProfile]);

  return (
    <StudentContext.Provider value={{
      profile,
      isLoaded,
      updateEntryYear,
      toggleCourseApproved,
      toggleCourseSimulated,
      approveCourses,
      unapproveCourses,
      clearSimulated,
      resetProfile,
      approveSimulated,
      saveProfile,
      setEnrollmentTarget,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudentContext(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudentContext must be used within StudentProvider');
  return ctx;
}
