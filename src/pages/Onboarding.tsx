import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStudentStore } from '../hooks/useStudentStore';
import { motion } from 'framer-motion';
import { HelpCircle, Sparkles } from 'lucide-react';
import { InteractiveTour, shouldShowTourOnFirstVisit, markTourSeen } from '../components/InteractiveTour';

export function Onboarding() {
  const [, setLocation] = useLocation();
  const { updateEntryYear } = useStudentStore();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [showTour, setShowTour] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2016 }, (_, i) => 2017 + i).reverse();

  const handleStart = () => {
    updateEntryYear(year);
    // Show tour automatically on first visit
    if (shouldShowTourOnFirstVisit()) {
      markTourSeen(); // prevent it from showing again on next visit
      setLocation('/ayuda');
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <>
      {showTour && <InteractiveTour onClose={() => { setShowTour(false); }} />}

      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-card-border p-8 rounded-2xl shadow-xl z-10 relative"
        >
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl mb-6 shadow-lg shadow-primary/20">
            CS
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
            Sistema Inteligente de Planificación
          </h1>
          <p className="text-muted-foreground mb-8">
            Ciencia de la Computación, UNSA. Planifica tu carrera con precisión.
          </p>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Año de ingreso
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-input/50 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              >
                {years.map(y => (
                  <option key={y} value={y} className="bg-background">{y}</option>
                ))}
              </select>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground border border-border/50">
              {year >= 2025 ? (
                <p>Se aplicará el <strong>Plan de Estudios 2025</strong>.</p>
              ) : (
                <p>Se aplicará el <strong>Plan de Estudios 2017</strong>, con soporte para equivalencias de cursos descontinuados.</p>
              )}
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Comenzar
            </button>

            {/* Help link */}
            <button
              onClick={() => setLocation('/ayuda')}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <HelpCircle className="w-4 h-4" />
              ¿Cómo funciona la aplicación?
            </button>
          </div>
        </motion.div>

        <div className="mt-12 text-sm text-muted-foreground/60 z-10 font-mono">
          Datos almacenados localmente. No requiere conexión.
        </div>
      </div>
    </>
  );
}
