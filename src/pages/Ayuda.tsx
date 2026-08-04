import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Sparkles, Map, CheckSquare, Palette,
  BarChart2, BookOpen, ChevronDown, ChevronRight,
  Play, RotateCcw, Lock, CheckCircle2, Zap, RefreshCw,
  AlertTriangle, Info, BookMarked, GraduationCap,
} from 'lucide-react';
import { InteractiveTour, resetTour } from '../components/InteractiveTour';

// ── Color legend (single source of truth) ─────────────────────────────────────
const COLOR_LEGEND = [
  {
    label: 'Aprobado',
    description: 'Ya cursaste y aprobaste este curso.',
    className: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    label: 'Disponible',
    description: 'Cumples todos los prerrequisitos. Puedes matricularlo.',
    className: 'bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: 'Bloqueado',
    description: 'Aún te faltan prerrequisitos para llevar este curso.',
    className: 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    icon: <Lock className="w-4 h-4" />,
  },
  {
    label: 'Electivo',
    description: 'Curso optativo. Cumples prerrequisitos y puedes elegirlo.',
    className: 'bg-slate-500/20 border-slate-500/40 text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
    icon: <BookMarked className="w-4 h-4" />,
  },
  {
    label: 'Descontinuado / Reemplazado',
    description: 'Este curso del Sílabo 2017 ya no se oferta. La app mostrará su equivalente en el Sílabo 2025.',
    className: 'bg-rose-900/20 border-rose-900/40 text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-900 dark:bg-rose-700',
    icon: <RefreshCw className="w-4 h-4" />,
  },
];

// ── FAQ data ───────────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: '¿Por qué no puedo matricular un curso?',
    a: 'Probablemente no has aprobado todos sus prerrequisitos. Haz clic sobre el curso en la Malla para ver exactamente qué te falta. También verifica que estés planificando el semestre correcto (A o B), ya que los cursos solo aparecen disponibles en su semestre correspondiente.',
  },
  {
    q: '¿Por qué aparece un curso equivalente en mi malla?',
    a: 'Cuando un curso del Sílabo 2017 ya no se oferta para el año de matrícula que seleccionaste, la app lo sustituye automáticamente por su equivalente oficial en el Sílabo 2025. Esto refleja la implementación progresiva del nuevo plan curricular.',
  },
  {
    q: '¿Por qué un curso ya no existe en mi malla?',
    a: 'La UNSA implementa el Sílabo 2025 de forma progresiva. Los cursos del Sílabo 2017 se retiran gradualmente a medida que la promoción 2024 (última del plan antiguo) avanza en su carrera. La fórmula es: un curso de año N se retira cuando el año de matrícula supera 2024 + N.',
  },
  {
    q: '¿Cómo reinicio mi progreso?',
    a: 'Puedes reiniciar desde la sección "Progreso" → "Herramientas de Aprobación Masiva" → "Reiniciar todo el progreso". También desde el menú lateral (botón "Reiniciar Perfil"). Se pedirá confirmación antes de borrar.',
  },
  {
    q: '¿Qué es una reprogramación de curso?',
    a: 'Cuando al menos 30 estudiantes necesitan repetir un curso, la universidad puede abrirlo excepcionalmente en un semestre diferente al original. La aplicación detecta estas reprogramaciones y muestra los cursos disponibles, marcándolos con la etiqueta "Reprogramado".',
  },
  {
    q: '¿Qué significa el punto naranja parpadeante en una tarjeta?',
    a: 'Indica un "curso crítico" o cuello de botella: al aprobarlo se desbloqueará el mayor número de materias del plan. Prioriza estos cursos en tu matrícula para avanzar más rápido.',
  },
  {
    q: '¿Cómo se calculan los créditos del simulador?',
    a: 'La app suma los créditos de todos los cursos que marcas en el simulador. El mínimo permitido es 12 créditos por semestre y el máximo es 24. Verás una barra de progreso y una advertencia si estás fuera de ese rango.',
  },
  {
    q: '¿Si apruebo un curso equivalente, se contabiliza en ambos planes?',
    a: 'Sí. Las equivalencias son bidireccionales. Si apruebas un curso del Sílabo 2017, su equivalente del Sílabo 2025 también queda marcado como aprobado automáticamente, y viceversa. Nunca tendrás que cursar dos veces el mismo contenido.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Todo se guarda en el almacenamiento local de tu navegador (localStorage). No se envía ningún dato a servidores externos. Puedes exportar tu progreso como archivo JSON desde "Progreso" como respaldo.',
  },
];

// ── Steps ──────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: 1,
    icon: <GraduationCap className="w-5 h-5" />,
    title: 'Seleccionar el año de ingreso',
    color: 'text-primary bg-primary/10 border-primary/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Al ingresar por primera vez, la aplicación te pedirá que indiques el año en que ingresaste a la carrera.
          Este dato es fundamental porque:
        </p>
        <ul className="space-y-1.5 list-none">
          {[
            'Si ingresaste antes de 2025 → se aplica el Sílabo 2017.',
            'Si ingresaste en 2025 o después → se aplica el Sílabo 2025.',
            'El motor de equivalencias determinará automáticamente qué cursos están vigentes para cada año de matrícula.',
          ].map(t => (
            <li key={t} className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              {t}
            </li>
          ))}
        </ul>
        <p>Puedes cambiar tu año de ingreso en cualquier momento desde el menú lateral (botón "Reiniciar Perfil").</p>
      </div>
    ),
  },
  {
    number: 2,
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: 'Registrar los cursos aprobados',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Hay tres formas de registrar tus cursos aprobados:</p>
        <div className="space-y-2">
          {[
            ['Uno por uno', 'Haz clic en un curso en la Malla → botón "Marcar como aprobado" en el panel lateral.'],
            ['Por año o semestre', 'En "Progreso" → "Herramientas de Aprobación Masiva" → elige un año o semestre completo.'],
            ['Todos los disponibles', 'En el mismo panel masivo, aprueba todos los cursos cuyos prerrequisitos ya cumples.'],
          ].map(([titulo, desc]) => (
            <div key={titulo} className="flex items-start gap-3 bg-muted/40 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-xs">{titulo}</p>
                <p className="text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs">Todos los cambios se guardan automáticamente. No hay botón "Guardar".</p>
        </div>
      </div>
    ),
  },
  {
    number: 3,
    icon: <Palette className="w-5 h-5" />,
    title: 'Comprender los colores',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    content: (
      <div className="space-y-2">
        {COLOR_LEGEND.map(item => (
          <div
            key={item.label}
            className={`flex items-start gap-3 rounded-xl border p-3 ${item.className}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${item.dot} mt-1 shrink-0`} />
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                {item.icon} {item.label}
              </div>
              <p className="text-xs mt-0.5 opacity-80">{item.description}</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Un punto naranja parpadeante indica un "curso crítico": al aprobarlo desbloqueas más materias que con cualquier otro.
        </p>
      </div>
    ),
  },
  {
    number: 4,
    icon: <Map className="w-5 h-5" />,
    title: 'Explorar la malla curricular',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>La sección <strong className="text-foreground">Malla Curricular</strong> es el centro de la aplicación. Desde ahí puedes:</p>
        <ul className="space-y-2">
          {[
            ['Cambiar vista', 'Usa el selector "Mi Malla / Sílabo 2017 / Sílabo 2025" para ver diferentes planes.'],
            ['Horizontal / Vertical', 'Cambia el layout con los botones de cuadrícula o lista en la barra superior.'],
            ['Buscar', 'Escribe el nombre o código del curso en la barra de búsqueda.'],
            ['Filtrar', 'Filtra por estado (aprobado, disponible, bloqueado) o por área académica.'],
            ['Ver detalles', 'Haz clic en cualquier tarjeta para ver prerrequisitos, créditos, horas y cursos que desbloquea.'],
          ].map(([acc, desc]) => (
            <li key={acc} className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
              <span><strong className="text-foreground">{acc}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    number: 5,
    icon: <CheckSquare className="w-5 h-5" />,
    title: 'Utilizar el simulador de matrícula',
    color: 'text-primary bg-primary/10 border-primary/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>El <strong className="text-foreground">Simulador de Matrícula</strong> te permite planificar qué cursos llevarás en el próximo semestre.</p>
        <ol className="space-y-2 list-none">
          {[
            'Selecciona el año y semestre (A o B) que planeas matricular.',
            'La app mostrará solo los cursos disponibles para ese periodo.',
            'Marca los cursos que deseas llevar usando los checkboxes.',
            'Observa la barra de créditos: mínimo 12, máximo 24 créditos.',
            'Ve qué cursos se desbloquearán al aprobar tu selección.',
            'Confirma con "Aprobar Cursos" para registrarlo en tu historial.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    number: 6,
    icon: <RefreshCw className="w-5 h-5" />,
    title: 'Interpretar las equivalencias',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          La UNSA está transitando del Sílabo 2017 al Sílabo 2025. Esto afecta a estudiantes que ingresaron antes de 2025:
        </p>
        <div className="space-y-2">
          {[
            ['Retiro progresivo', 'Los cursos del Sílabo 2017 se retiran gradualmente. Un curso de año N del plan 2017 se retira cuando el año de matrícula supera 2024 + N.'],
            ['Sustitución automática', 'Cuando un curso se retira, la app lo reemplaza automáticamente por su equivalente del Sílabo 2025 en tu malla.'],
            ['Equivalencia bidireccional', 'Si aprobaste el curso 2017, se considera aprobado el equivalente 2025 (y viceversa). Nunca repetirás el mismo contenido.'],
          ].map(([titulo, desc]) => (
            <div key={titulo} className="flex items-start gap-3 bg-muted/40 rounded-lg p-3">
              <RefreshCw className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-xs">{titulo}</p>
                <p className="text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: 7,
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Consultar el progreso',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>La sección <strong className="text-foreground">Progreso</strong> te muestra un panorama completo de tu avance:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Porcentaje de avance', 'Créditos aprobados / Total de créditos de la carrera.'],
            ['Créditos aprobados', 'Suma de créditos de todos los cursos que has pasado.'],
            ['Créditos pendientes', 'Lo que te falta: total − aprobados.'],
            ['Semestres restantes', 'Estimado basado en los créditos pendientes y la ruta crítica de prerrequisitos.'],
            ['Progreso por año', 'Gráfico de barras mostrando % completado por año académico.'],
            ['Línea de tiempo', 'Historial cronológico de cursos aprobados por semestre.'],
          ].map(([titulo, desc]) => (
            <div key={titulo} className="bg-muted/40 rounded-lg p-2.5">
              <p className="font-semibold text-foreground text-xs">{titulo}</p>
              <p className="text-xs mt-0.5 opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ── Accordion item ─────────────────────────────────────────────────────────────
function AccordionItem({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-sm pr-4">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function Ayuda() {
  const [showTour, setShowTour] = useState(false);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleStartTour = () => {
    resetTour();
    setShowTour(true);
  };

  return (
    <>
      {showTour && <InteractiveTour onClose={() => setShowTour(false)} />}

      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-10 pb-20">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">¿Cómo usar la página?</h1>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Guía completa para que puedas aprovechar al máximo todas las herramientas del Sistema Inteligente de Planificación de Matrícula.
          </p>

          {/* Tour button */}
          <button
            onClick={handleStartTour}
            className="flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Play className="w-4 h-4" />
            Iniciar tour interactivo
            <span className="text-xs font-normal opacity-70">({7} pasos)</span>
          </button>
        </header>

        {/* ── Welcome ─────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-card border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Bienvenida</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Esta herramienta te ayuda a <strong className="text-foreground">planificar tu matrícula</strong>,
            conocer qué cursos puedes llevar, identificar los prerrequisitos que te faltan,
            visualizar tu avance en la carrera y comprender la transición entre los{' '}
            <strong className="text-foreground">sílabos 2017 y 2025</strong>. Todo funciona
            en tu navegador — sin cuenta, sin conexión, sin perder tus datos.
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🗺️', label: 'Malla visual' },
              { icon: '✅', label: 'Historial de cursos' },
              { icon: '📊', label: 'Simulador de matrícula' },
              { icon: '🔄', label: 'Equivalencias 2017↔2025' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-background/60 border border-border rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Steps ───────────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Guía paso a paso
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, idx) => (
              <div key={step.number} className={`border rounded-2xl overflow-hidden ${openStep === idx ? 'border-border' : 'border-border/50'}`}>
                <button
                  onClick={() => setOpenStep(openStep === idx ? null : idx)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${step.color}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Paso {step.number}</div>
                    <div className="font-bold text-sm">{step.title}</div>
                  </div>
                  <motion.div animate={{ rotate: openStep === idx ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openStep === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-border">
                        {step.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ── Color Legend summary ─────────────────────────────────────────── */}
        <section>
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            Leyenda de colores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COLOR_LEGEND.map(item => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-xl border p-3.5 ${item.className}`}
              >
                <div className={`w-3 h-3 rounded-full ${item.dot} shrink-0`} />
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs mt-0.5 opacity-80">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-amber-600 dark:text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p><strong>Punto naranja parpadeante</strong> — curso crítico: al aprobarlo desbloqueas más cursos que con cualquier otro.</p>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Preguntas frecuentes
          </h2>
          <div className="space-y-2">
            {FAQ.map((item, idx) => (
              <AccordionItem
                key={idx}
                title={item.q}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {item.a}
              </AccordionItem>
            ))}
          </div>
        </section>

        {/* ── Repeat tour ─────────────────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-2xl p-6 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">¿Quieres repasar?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Puedes repetir el tour interactivo en cualquier momento para refrescar cómo funciona la aplicación.
          </p>
          <button
            onClick={handleStartTour}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <RotateCcw className="w-4 h-4" />
            Repetir tour
          </button>
        </section>
      </div>
    </>
  );
}
