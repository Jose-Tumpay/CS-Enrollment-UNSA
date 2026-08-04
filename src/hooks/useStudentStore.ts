// Thin compatibility wrapper — all state now lives in StudentContext
// so every component that calls this hook shares the same reactive state.
export { useStudentContext as useStudentStore } from '../context/StudentContext';
