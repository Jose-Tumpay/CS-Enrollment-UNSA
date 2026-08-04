import { useState } from 'react';
import { courses2017 } from '../data/courses2017';
import { courses2025 } from '../data/courses2025';
import { equivalencias } from '../data/equivalencias';
import { ArrowRight, AlertTriangle, PlusCircle, MinusCircle, Info } from 'lucide-react';

export function Comparador() {
  const [filterYear, setFilterYear] = useState<number | 'ALL'>('ALL');

  const filtered2017 = filterYear === 'ALL' ? courses2017 : courses2017.filter(c => c.year === filterYear);
  const filtered2025 = filterYear === 'ALL' ? courses2025 : courses2025.filter(c => c.year === filterYear);

  const newCourses = filtered2025.filter(c25 => !equivalencias.some(e => e.plan2025Code === c25.code && e.plan2017Codes.length > 0));
  const removedCourses = filtered2017.filter(c17 => !equivalencias.some(e => e.plan2017Codes.includes(c17.code)));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Comparador de Mallas</h1>
          <p className="text-muted-foreground mt-1">Diferencias clave entre el Plan 2017 y Plan 2025</p>
        </div>
        
        <select 
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="bg-card border border-border text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        >
          <option value="ALL">Todos los años</option>
          <option value={1}>1er Año</option>
          <option value={2}>2do Año</option>
          <option value={3}>3er Año</option>
          <option value={4}>4to Año</option>
          <option value={5}>5to Año</option>
        </select>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
          <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400">Cursos Nuevos</h3>
            <p className="text-sm opacity-80">{newCourses.length} introducidos en 2025</p>
          </div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
          <MinusCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-600 dark:text-rose-400">Cursos Retirados</h3>
            <p className="text-sm opacity-80">{removedCourses.length} del plan 2017 sin equivalente directo</p>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-600 dark:text-blue-400">Equivalencias</h3>
            <p className="text-sm opacity-80">{equivalencias.filter(e => e.plan2017Codes.length > 0).length} mapeos de convalidación</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Plan 2017 Column */}
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 sticky top-0">
            <h2 className="text-xl font-bold text-center">Plan 2017</h2>
            <div className="text-center text-sm text-muted-foreground">{filtered2017.length} cursos</div>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {filtered2017.map(course => {
              const isRemoved = removedCourses.includes(course);
              const equiv = equivalencias.find(e => e.plan2017Codes.includes(course.code));
              const mapped2025 = equiv ? courses2025.find(c => c.code === equiv.plan2025Code) : null;

              return (
                <div key={course.code} className={`p-4 rounded-xl border ${isRemoved ? 'border-rose-500/30 bg-rose-500/5' : 'border-border bg-background'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs font-semibold opacity-70">{course.code}</span>
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{course.credits} cr</span>
                  </div>
                  <h3 className="font-bold text-sm mb-2">{course.name}</h3>
                  
                  {isRemoved ? (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-1 rounded inline-flex">
                      <MinusCircle className="w-3 h-3" /> Descontinuado
                    </div>
                  ) : mapped2025 ? (
                    <div className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2 rounded flex flex-col gap-1 border border-blue-500/20">
                      <div className="flex items-center gap-1 font-semibold">
                        <ArrowRight className="w-3 h-3" /> Convalida con:
                      </div>
                      <div className="truncate font-mono">{mapped2025.code} - {mapped2025.name}</div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan 2025 Column */}
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 sticky top-0">
            <h2 className="text-xl font-bold text-center">Plan 2025</h2>
            <div className="text-center text-sm text-muted-foreground">{filtered2025.length} cursos</div>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {filtered2025.map(course => {
              const isNew = newCourses.includes(course);
              const equiv = equivalencias.find(e => e.plan2025Code === course.code);
              const mapped2017 = equiv && equiv.plan2017Codes.length > 0 
                ? courses2017.filter(c => equiv.plan2017Codes.includes(c.code)) 
                : [];

              return (
                <div key={course.code} className={`p-4 rounded-xl border ${isNew ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-background'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs font-semibold opacity-70">{course.code}</span>
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{course.credits} cr</span>
                  </div>
                  <h3 className="font-bold text-sm mb-2">{course.name}</h3>
                  
                  {isNew ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-flex">
                      <PlusCircle className="w-3 h-3" /> Curso Nuevo
                    </div>
                  ) : mapped2017.length > 0 ? (
                    <div className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded flex flex-col gap-1 border border-amber-500/20">
                      <div className="flex items-center gap-1 font-semibold">
                        <ArrowRight className="w-3 h-3" /> Viene de:
                      </div>
                      {mapped2017.map(c => (
                        <div key={c.code} className="truncate font-mono">{c.code} - {c.name}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}