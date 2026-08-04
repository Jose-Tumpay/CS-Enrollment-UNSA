# Revisión del repo Jose-Tumpay/CS-Enrollment-UNSA

Cloné el repo real (no el .rar) y lo verifiqué de punta a punta con el
monorepo completo (`pnpm install`, `pnpm typecheck`, `pnpm build`).

## Bugs de datos confirmados (idénticos a los del .rar, siguen sin corregir en GitHub)

1. `2504250` y `2504251` sin su prerrequisito `2504138`. **Corregido.**
2. 3 equivalencias oficiales faltantes: `2504250`←`1705268`, `2505156`←`1705161`,
   `2505262`←`1701114`. **Corregido.**
3. `reprogramaciones.ts` vacío con un código de curso inventado (`CS2101`) en
   el ejemplo comentado. **Reemplazado por el caso real** (1702224, 2026-A, 34 estudiantes).

## Bug nuevo encontrado en el motor (no estaba en mi revisión anterior del .rar)

**`unlockedBy`, la detección de cuellos de botella, y el "willUnlock" del
simulador comparan códigos de curso de forma literal (`===`)**, sin cruzar la
frontera de equivalencia. Cuando un curso activo (ej. año 3) tiene como
prerrequisito un curso YA retirado (ej. año 2), ese prerrequisito se
sustituye en la lista por su equivalente 2025 — pero el curso que lo requiere
sigue apuntando al código 2017 viejo. Resultado: esas 3 funciones
sub-reportan qué desbloquea un curso, justo en el límite entre lo retirado y
lo vigente (que es una situación *común*, no un caso raro).

Verificado con datos reales: `1703131` (año 3, activo en 2026) requiere
`1702224` (año 2, retirado → sustituido por `2502219`). Antes del fix,
`unlockedBy('2502219')` no encontraba a `1703131`. Después del fix, sí.

Esto afecta 3 lugares visibles: "cursos críticos" en el Dashboard, el badge
de cuello de botella en la Malla, y "esto desbloqueará" en el Simulador.
**No afecta** si puedes matricular o no un curso — esa lógica ya usaba el set
de aprobados con equivalencias aplicadas correctamente.

## Bug de portabilidad confirmado

`vite.config.ts` exige `PORT`/`BASE_PATH` (los inyecta Replit automáticamente)
y usa 3 plugins exclusivos de Replit. Siguiendo el README tal cual
(`pnpm --filter @workspace/malla-cs run dev`), sin esas variables, **falla**.
No lo cambié en el patch (`malla-cs-bugfixes.patch`) porque dentro del
monorepo real es una decisión de la plataforma, no un bug de lógica — pero
en `malla-cs-standalone/` (esta carpeta) sí lo dejé portable, para que
corra en cualquier lado sin pnpm ni Replit.

## Qué te entrego

- **`malla-cs-bugfixes.patch`** — aplícalo directo a tu repo real con
  `git apply malla-cs-bugfixes.patch` (o revísalo como si fuera un PR).
  Solo toca los archivos de datos y el motor — no toca configuración.
- **`malla-cs-standalone/`** (esta carpeta) — la misma app ya corregida,
  pero con `vite.config.ts`/`package.json`/`tsconfig.json` reescritos para
  correr con `npm install && npm run dev` en cualquier máquina, sin pnpm ni
  el resto del monorepo.

## Verificación

```
pnpm typecheck  → 0 errores (en el monorepo real)
pnpm build      → ✓ build exitosa
npm install && npm run build (standalone) → ✓ build exitosa, sin pnpm
```
