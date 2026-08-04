import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Map, CheckSquare, BarChart2, BookOpen, Palette, HelpCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
  action?: { label: string; href: string };
  position?: 'left' | 'right' | 'center';
}

const TOUR_KEY = 'malla_cs_tour_seen_v1';

const TOUR_STEPS: TourStep[] = [
  {
    title: '¡Bienvenido al Planner UNSA!',
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    description:
      'Esta herramienta te ayuda a planificar tu matrícula, conocer qué cursos puedes llevar, identificar prerrequisitos faltantes, visualizar tu avance y entender la transición entre los sílabos 2017 y 2025.',
    tip: 'Todo tu progreso se guarda automáticamente en tu navegador. No necesitas cuenta ni conexión a internet.',
  },
  {
    title: 'Paso 1 — Tu Malla Curricular',
    icon: <Map className="w-6 h-6 text-blue-500" />,
    description:
      'En la sección "Malla Curricular" verás todos tus cursos organizados por año y semestre. Haz clic en cualquier curso para ver sus prerrequisitos, estado y detalles. Puedes cambiar entre "Mi Malla", "Sílabo 2017 completo" y "Sílabo 2025 completo".',
    tip: 'Los cursos del Sílabo 2017 que ya no se oferten aparecerán reemplazados automáticamente por su equivalente del Sílabo 2025.',
    action: { label: 'Ir a la Malla →', href: '/malla' },
  },
  {
    title: 'Paso 2 — Registrar cursos aprobados',
    icon: <CheckSquare className="w-6 h-6 text-emerald-500" />,
    description:
      'Haz clic sobre un curso en la Malla y luego pulsa "Marcar como aprobado". El sistema recalculará inmediatamente todos los prerrequisitos y cursos disponibles. También puedes usar la aprobación masiva en la sección "Progreso" para aprobar un año o semestre completo.',
    tip: 'Si apruebas un curso que tiene equivalencia, el sistema marca automáticamente ambas versiones (2017 y 2025) como aprobadas.',
  },
  {
    title: 'Paso 3 — Los colores de los cursos',
    icon: <Palette className="w-6 h-6 text-purple-500" />,
    description:
      'Cada color indica el estado de un curso:\n🟢 Verde = Aprobado\n🔵 Azul = Disponible (prerrequisitos cumplidos)\n🔴 Rojo = Bloqueado (faltan prerrequisitos)\n🟡 Amarillo = Electivo disponible\n⚫ Gris = Descontinuado (reemplazado por equivalente)',
    tip: 'Un punto naranja parpadeante en la esquina de un curso significa que es "curso crítico": desbloqueará el mayor número de materias al aprobarlo.',
  },
  {
    title: 'Paso 4 — Simular tu matrícula',
    icon: <CheckSquare className="w-6 h-6 text-primary" />,
    description:
      'En el "Simulador de Matrícula" elige el año y semestre que planeas matricularte. Solo aparecerán los cursos disponibles para ese periodo. Selecciona los que deseas llevar y la app verificará créditos (mín. 12, máx. 24), prerrequisitos y equivalencias automáticamente.',
    tip: 'Cuando termines de planificar, puedes convertir los cursos simulados en aprobados con el botón "Aprobar Cursos".',
    action: { label: 'Ir al Simulador →', href: '/simulador' },
  },
  {
    title: 'Paso 5 — Revisar tu Progreso',
    icon: <BarChart2 className="w-6 h-6 text-amber-500" />,
    description:
      'La sección "Progreso" muestra tu línea de tiempo académica, créditos aprobados vs. pendientes, y un gráfico por año. También encontrarás herramientas de aprobación masiva para configurar rápidamente tu historial.',
    tip: 'Puedes exportar tu progreso como archivo JSON y compartirlo o hacer una copia de seguridad.',
    action: { label: 'Ver Progreso →', href: '/progreso' },
  },
  {
    title: 'Paso 6 — Entender las equivalencias',
    icon: <BookOpen className="w-6 h-6 text-rose-500" />,
    description:
      'Con la transición al Sílabo 2025, algunos cursos del Sílabo 2017 ya no se ofertarán. La aplicación sustituye automáticamente esos cursos por sus equivalentes en el nuevo sílabo, según el año de matrícula que selecciones. Aprobar cualquiera de los dos equivalentes vale para ambos.',
    tip: 'En la vista "Comparador" puedes ver lado a lado la lista completa de equivalencias entre ambos planes.',
    action: { label: 'Ver Comparador →', href: '/comparador' },
  },
  {
    title: '¡Todo listo!',
    icon: <HelpCircle className="w-6 h-6 text-emerald-500" />,
    description:
      'Ya conoces las funciones principales. Si en algún momento tienes dudas, visita la sección "¿Cómo usar?" desde el menú lateral para releer esta guía o repetir el tour.',
    tip: 'Recuerda: cualquier cambio se guarda automáticamente. ¡No hay botón "Guardar"!',
  },
];

interface InteractiveTourProps {
  onClose: () => void;
}

export function InteractiveTour({ onClose }: InteractiveTourProps) {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  const handleFinish = () => {
    localStorage.setItem(TOUR_KEY, '1');
    onClose();
  };

  const handleAction = (href: string) => {
    handleFinish();
    setLocation(href);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="tour-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) handleFinish(); }}
      >
        <motion.div
          key={`tour-step-${step}`}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted w-full">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {current.icon}
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">{current.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    Paso {step + 1} de {TOUR_STEPS.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleFinish}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
              {current.description}
            </div>

            {/* Tip */}
            {current.tip && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary mb-5">
                <span className="font-semibold">💡 Tip: </span>
                {current.tip}
              </div>
            )}

            {/* Action */}
            {current.action && (
              <button
                onClick={() => handleAction(current.action!.href)}
                className="w-full mb-4 py-2.5 px-4 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
              >
                {current.action.label}
              </button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={isFirst}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              {/* Dot indicators */}
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all ${
                      i === step
                        ? 'w-4 h-2 bg-primary'
                        : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    }`}
                  />
                ))}
              </div>

              {isLast ? (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  ¡Entendido! <Sparkles className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Returns true if the user has never completed the tour */
export function shouldShowTourOnFirstVisit(): boolean {
  try {
    return !localStorage.getItem(TOUR_KEY);
  } catch {
    return false;
  }
}

export function markTourSeen() {
  try {
    localStorage.setItem(TOUR_KEY, '1');
  } catch {}
}

export function resetTour() {
  try {
    localStorage.removeItem(TOUR_KEY);
  } catch {}
}
