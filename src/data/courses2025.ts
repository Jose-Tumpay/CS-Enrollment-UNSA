import { Course } from '../types';

export const courses2025: Course[] = [
  // PRIMER AÑO - PRIMER SEMESTRE
  { code: '2501101', name: 'FUNDAMENTOS DE LA MATEMÁTICA', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 1, semester: 1, component: 'D', prerequisites: [], plan: '2025' },
  { code: '2501102', name: 'METODOLOGÍA DEL TRABAJO ACADÉMICO', credits: 2, hoursTheory: 0, hoursPractice: 4, hoursLab: 0, year: 1, semester: 1, component: 'D', prerequisites: [], plan: '2025' },
  { code: '2501103', name: 'INTRODUCCIÓN A LA CIENCIA DE LA COMPUTACIÓN', credits: 4, hoursTheory: 2, hoursPractice: 0, hoursLab: 4, year: 1, semester: 1, component: 'D', prerequisites: [], plan: '2025' },
  { code: '2501104', name: 'INGLÉS I', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 1, semester: 1, component: 'D', prerequisites: [], plan: '2025' },
  { code: '2501105', name: 'INTRODUCCIÓN A LA PROGRAMACIÓN', credits: 5, hoursTheory: 2, hoursPractice: 2, hoursLab: 4, year: 1, semester: 1, component: 'F', prerequisites: [], plan: '2025' },
  { code: '2501106', name: 'ESTRUCTURAS DISCRETAS I', credits: 5, hoursTheory: 4, hoursPractice: 2, hoursLab: 0, year: 1, semester: 1, component: 'F', prerequisites: [], plan: '2025' },

  // PRIMER AÑO - SEGUNDO SEMESTRE
  { code: '2501207', name: 'ESTRUCTURAS DISCRETAS II', credits: 5, hoursTheory: 4, hoursPractice: 2, hoursLab: 0, year: 1, semester: 2, component: 'F', prerequisites: ['2501106','2501105'], plan: '2025' },
  { code: '2501208', name: 'PROGRAMACIÓN I', credits: 5, hoursTheory: 2, hoursPractice: 2, hoursLab: 4, year: 1, semester: 2, component: 'F', prerequisites: ['2501105'], plan: '2025' },
  { code: '2501209', name: 'CÁLCULO EN UNA VARIABLE', credits: 5, hoursTheory: 4, hoursPractice: 2, hoursLab: 0, year: 1, semester: 2, component: 'D', prerequisites: ['2501101'], plan: '2025' },
  { code: '2501210', name: 'INGLÉS II', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 1, semester: 2, component: 'D', prerequisites: ['2501104'], plan: '2025' },
  { code: '2501211', name: 'LINGÜÍSTICA, COMPRENSIÓN Y REDACCIÓN ACADÉMICA', credits: 3, hoursTheory: 1, hoursPractice: 4, hoursLab: 0, year: 1, semester: 2, component: 'D', prerequisites: [], plan: '2025' },
  { code: '2501212', name: 'REALIDAD NACIONAL', credits: 2, hoursTheory: 1, hoursPractice: 2, hoursLab: 0, year: 1, semester: 2, component: 'E', prerequisites: [], plan: '2025' },

  // SEGUNDO AÑO - PRIMER SEMESTRE
  { code: '2502113', name: 'ARQUITECTURA DE COMPUTADORES', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 2, semester: 1, component: 'F', prerequisites: ['2501207'], plan: '2025' },
  { code: '2502114', name: 'PROGRAMACIÓN II', credits: 5, hoursTheory: 2, hoursPractice: 2, hoursLab: 4, year: 2, semester: 1, component: 'F', prerequisites: ['2501208'], plan: '2025' },
  { code: '2502115', name: 'ÁLGEBRA LINEAL', credits: 5, hoursTheory: 4, hoursPractice: 2, hoursLab: 0, year: 2, semester: 1, component: 'F', prerequisites: ['2501209'], plan: '2025' },
  { code: '2502116', name: 'CÁLCULO EN VARIAS VARIABLES', credits: 5, hoursTheory: 4, hoursPractice: 2, hoursLab: 0, year: 2, semester: 1, component: 'D', prerequisites: ['2501209'], plan: '2025' },
  { code: '2502117', name: 'INGLÉS III', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 2, semester: 1, component: 'D', prerequisites: ['2501210'], plan: '2025' },
  { code: '2502118', name: 'CIUDADANÍA E INTERCULTURALIDAD', credits: 2, hoursTheory: 1, hoursPractice: 2, hoursLab: 0, year: 2, semester: 1, component: 'E', prerequisites: [], plan: '2025' },

  // SEGUNDO AÑO - SEGUNDO SEMESTRE
  { code: '2502219', name: 'ESTRUCTURA DE DATOS', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 2, semester: 2, component: 'F', prerequisites: ['2502114'], plan: '2025' },
  { code: '2502220', name: 'REDES Y COMUNICACIÓN', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 2, semester: 2, component: 'F', prerequisites: ['2502113'], plan: '2025' },
  { code: '2502221', name: 'SISTEMAS OPERATIVOS', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 2, semester: 2, component: 'F', prerequisites: ['2502113'], plan: '2025' },
  { code: '2502222', name: 'LENGUAJES DE PROGRAMACIÓN', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 2, semester: 2, component: 'F', prerequisites: ['2502114'], plan: '2025' },
  { code: '2502223', name: 'INGLÉS IV', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 2, semester: 2, component: 'D', prerequisites: ['2502117'], plan: '2025' },
  { code: '2502224', name: 'ECOLOGÍA Y CONSERVACIÓN AMBIENTAL', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 2, semester: 2, component: 'E', prerequisites: [], plan: '2025' },

  // TERCER AÑO - PRIMER SEMESTRE
  { code: '2503125', name: 'ANÁLISIS Y DISEÑO DE ALGORITMOS', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 1, component: 'F', prerequisites: ['2502219'], plan: '2025' },
  { code: '2503126', name: 'ESTRUCTURA DE DATOS AVANZADOS', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 1, component: 'F', prerequisites: ['2502219'], plan: '2025' },
  { code: '2503127', name: 'COMPILADORES', credits: 3, hoursTheory: 2, hoursPractice: 0, hoursLab: 2, year: 3, semester: 1, component: 'F', prerequisites: ['2502221'], plan: '2025' },
  { code: '2503128', name: 'PROGRAMACIÓN CONCURRENTE Y PARALELA', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 1, component: 'F', prerequisites: ['2502220'], plan: '2025' },
  { code: '2503129', name: 'BASE DE DATOS I', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 1, component: 'F', prerequisites: ['2502114','2501207'], plan: '2025' },
  { code: '2503130', name: 'ESTADÍSTICA Y PROBABILIDADES', credits: 4, hoursTheory: 3, hoursPractice: 2, hoursLab: 0, year: 3, semester: 1, component: 'F', prerequisites: ['2502116'], plan: '2025' },

  // TERCER AÑO - SEGUNDO SEMESTRE
  { code: '2503231', name: 'PROGRAMACIÓN COMPETITIVA', credits: 3, hoursTheory: 0, hoursPractice: 0, hoursLab: 6, year: 3, semester: 2, component: 'F', prerequisites: ['2503125','2503126'], plan: '2025' },
  { code: '2503232', name: 'INGENIERÍA DE SOFTWARE I', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 2, component: 'F', prerequisites: ['2502114'], plan: '2025' },
  { code: '2503233', name: 'SISTEMAS DISTRIBUIDOS', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 2, component: 'F', prerequisites: ['2503128'], plan: '2025' },
  { code: '2503234', name: 'TEORÍA DE LA COMPUTACIÓN', credits: 5, hoursTheory: 4, hoursPractice: 2, hoursLab: 0, year: 3, semester: 2, component: 'F', prerequisites: ['2503125'], plan: '2025' },
  { code: '2503235', name: 'INTELIGENCIA ARTIFICIAL I', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 2, component: 'F', prerequisites: ['2503130'], plan: '2025' },
  { code: '2503236', name: 'ECUACIONES DIFERENCIALES', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 3, semester: 2, component: 'F', prerequisites: ['2502116','2502115'], plan: '2025' },

  // CUARTO AÑO - PRIMER SEMESTRE
  { code: '2504137', name: 'INVESTIGACIÓN CIENCIA DE LA COMPUTACIÓN', credits: 4, hoursTheory: 3, hoursPractice: 2, hoursLab: 0, year: 4, semester: 1, component: 'F', prerequisites: ['2503125'], plan: '2025' },
  { code: '2504138', name: 'INGENIERÍA DE SOFTWARE II', credits: 3, hoursTheory: 1, hoursPractice: 2, hoursLab: 2, year: 4, semester: 1, component: 'F', prerequisites: ['2503232'], plan: '2025' },
  { code: '2504139', name: 'DESARROLLO DE APLICACIONES WEB', credits: 3, hoursTheory: 2, hoursPractice: 0, hoursLab: 2, year: 4, semester: 1, component: 'F', prerequisites: ['2503129'], plan: '2025' },
  { code: '2504140', name: 'BASE DE DATOS II', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 4, semester: 1, component: 'G', prerequisites: ['2503129'], plan: '2025' },
  { code: '2504141', name: 'ÉTICA GENERAL Y DEONTOLOGÍA', credits: 2, hoursTheory: 1, hoursPractice: 2, hoursLab: 0, year: 4, semester: 1, component: 'E', prerequisites: [], plan: '2025' },
  { code: '2504142', name: 'DISEÑO DE VIDEOJUEGOS (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 4, semester: 1, component: 'G', prerequisites: [], plan: '2025', isElective: true },
  { code: '2504143', name: 'INTELIGENCIA ARTIFICIAL II (E)', credits: 4, hoursTheory: 2, hoursPractice: 0, hoursLab: 4, year: 4, semester: 1, component: 'G', prerequisites: ['2503235'], plan: '2025', isElective: true },
  { code: '2504144', name: 'SEGURIDAD EN COMPUTACIÓN (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 4, semester: 1, component: 'G', prerequisites: ['2502220'], plan: '2025', isElective: true },

  // CUARTO AÑO - SEGUNDO SEMESTRE
  { code: '2504245', name: 'PROYECTOS I', credits: 4, hoursTheory: 3, hoursPractice: 2, hoursLab: 0, year: 4, semester: 2, component: 'G', prerequisites: ['2504137'], plan: '2025' },
  { code: '2504246', name: 'INTERACCIÓN HUMANO COMPUTADOR', credits: 4, hoursTheory: 2, hoursPractice: 0, hoursLab: 4, year: 4, semester: 2, component: 'F', prerequisites: ['2504139','2504138'], plan: '2025' },
  { code: '2504247', name: 'BIG DATA', credits: 4, hoursTheory: 3, hoursPractice: 0, hoursLab: 2, year: 4, semester: 2, component: 'G', prerequisites: ['2503233'], plan: '2025' },
  { code: '2504248', name: 'FÍSICA COMPUTACIONAL', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 4, semester: 2, component: 'F', prerequisites: ['2503236'], plan: '2025' },
  { code: '2504249', name: 'POLÍTICAS PÚBLICAS Y ANTICORRUPCIÓN', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 4, semester: 2, component: 'E', prerequisites: [], plan: '2025' },
  { code: '2504250', name: 'DESARROLLO DE APLICACIONES MÓVIL (E)', credits: 4, hoursTheory: 3, hoursPractice: 0, hoursLab: 2, year: 4, semester: 2, component: 'G', prerequisites: ['2504138'], plan: '2025', isElective: true },
  { code: '2504251', name: 'DESARROLLO DE TECNOLOGÍAS EMERGENTES (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 4, semester: 2, component: 'G', prerequisites: ['2504138'], plan: '2025', isElective: true },
  { code: '2504252', name: 'INTELIGENCIA ARTIFICIAL III (E)', credits: 4, hoursTheory: 2, hoursPractice: 0, hoursLab: 4, year: 4, semester: 2, component: 'G', prerequisites: ['2504143'], plan: '2025', isElective: true },

  // QUINTO AÑO - PRIMER SEMESTRE
  { code: '2505153', name: 'PROYECTOS II', credits: 4, hoursTheory: 3, hoursPractice: 2, hoursLab: 0, year: 5, semester: 1, component: 'G', prerequisites: ['2504245'], plan: '2025' },
  { code: '2505154', name: 'CLOUD COMPUTING', credits: 3, hoursTheory: 2, hoursPractice: 0, hoursLab: 2, year: 5, semester: 1, component: 'F', prerequisites: ['2504247'], plan: '2025' },
  { code: '2505155', name: 'COMPUTACIÓN GRÁFICA', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 1, component: 'F', prerequisites: ['2503126','2504248'], plan: '2025' },
  { code: '2505156', name: 'CIENCIA DE DATOS', credits: 4, hoursTheory: 2, hoursPractice: 0, hoursLab: 4, year: 5, semester: 1, component: 'G', prerequisites: ['2504247','2504140'], plan: '2025' },
  { code: '2505157', name: 'MATEMÁTICA APLICADA A LA COMPUTACIÓN', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 1, component: 'F', prerequisites: ['2504248'], plan: '2025' },
  { code: '2505158', name: 'VISIÓN COMPUTACIONAL (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 1, component: 'G', prerequisites: [], plan: '2025', isElective: true },
  { code: '2505159', name: 'DESARROLLO DE SOFTWARE EMPRESARIAL (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 1, component: 'G', prerequisites: [], plan: '2025', isElective: true },

  // QUINTO AÑO - SEGUNDO SEMESTRE
  { code: '2505260', name: 'TRABAJO DE INVESTIGACIÓN', credits: 5, hoursTheory: 3, hoursPractice: 4, hoursLab: 0, year: 5, semester: 2, component: 'G', prerequisites: ['2505153'], plan: '2025' },
  { code: '2505261', name: 'VISUALIZACIÓN DE DATOS', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 2, component: 'G', prerequisites: ['2504246'], plan: '2025' },
  { code: '2505262', name: 'DESARROLLO EMOCIONAL, GESTIÓN DE CONFLICTOS Y LIDERAZGO', credits: 3, hoursTheory: 2, hoursPractice: 2, hoursLab: 0, year: 5, semester: 2, component: 'E', prerequisites: [], plan: '2025' },
  { code: '2505263', name: 'PRÁCTICAS PRE-PROFESIONALES', credits: 4, hoursTheory: 0, hoursPractice: 8, hoursLab: 0, year: 5, semester: 2, component: 'G', prerequisites: [], plan: '2025' },
  { code: '2505264', name: 'CIBERSEGURIDAD (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 2, component: 'G', prerequisites: [], plan: '2025', isElective: true },
  { code: '2505265', name: 'ROBÓTICA (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 2, component: 'G', prerequisites: [], plan: '2025', isElective: true },
  { code: '2505266', name: 'PROCESAMIENTO DE LENGUAJE NATURAL (E)', credits: 4, hoursTheory: 2, hoursPractice: 2, hoursLab: 2, year: 5, semester: 2, component: 'G', prerequisites: [], plan: '2025', isElective: true },
];