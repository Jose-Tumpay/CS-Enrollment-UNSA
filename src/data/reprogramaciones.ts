import { Reprogramacion } from '../types';

/**
 * Lista de reprogramaciones de cursos.
 *
 * Una reprogramación permite que un curso que normalmente se dicta en un
 * semestre determinado sea ofertado excepcionalmente en otro semestre,
 * cuando al menos N estudiantes necesitan volver a llevarlo.
 *
 * Formato:
 *   courseCode        → código del curso afectado
 *   originalSemester  → semestre original en la malla (1=A, 2=B)
 *   offeredSemester   → semestre en que se oferta excepcionalmente
 *   enrollmentYear    → año académico en que aplica la reprogramación
 *   minStudents       → mínimo de estudiantes requerido (por defecto: 30)
 *   reason            → descripción del motivo
 *
 * Para agregar una reprogramación futura, basta añadir un objeto a este array.
 * No se necesita modificar la lógica del motor curricular.
 */
export const reprogramaciones: Reprogramacion[] = [
  // Ejemplo basado en el documento de requisitos:
  // "Algoritmos y Estructuras de Datos" (Sílabo 2017) se dicta normalmente en
  // Semestre B, pero al haber ≥30 estudiantes que la desaprobaron, se abrió
  // excepcionalmente en Semestre A del año siguiente.
  {
    courseCode: '1702224', // Algoritmos y Estructuras de Datos (Sílabo 2017)
    originalSemester: 2,
    offeredSemester: 1,
    enrollmentYear: 2026,
    minStudents: 30,
    reason:
      'Algoritmos y Estructuras de Datos normalmente se dicta en Semestre B. ' +
      'Se reprogramó excepcionalmente a Semestre A 2026 porque 34 estudiantes ' +
      'lo desaprobaron y necesitaban recursarlo sin atrasar su avance.',
  },
];
