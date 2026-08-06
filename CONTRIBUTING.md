# Guía de Contribución

¡Gracias por querer mejorar esta herramienta para los estudiantes de CS-UNSA!

Al participar en este proyecto, aceptas seguir nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

## Antes de empezar

1. **Lee el README** para entender cómo funciona el proyecto.
2. **Revisa las issues abiertas** — tu idea puede ya estar en discusión.
3. **Abre una issue** antes de empezar a programar cambios grandes, para no duplicar esfuerzo.

---

## Tipos de contribución

### 🐛 Reportar un bug

Abre una issue con:
- Descripción del problema
- Pasos para reproducirlo (año de ingreso, periodo simulado, cursos involucrados)
- Comportamiento esperado vs. comportamiento actual

### ✏️ Corregir datos académicos

Los archivos de datos están en `src/data/`:

| Archivo | Qué contiene |
|---------|-------------|
| `courses2017.ts` | Cursos del Sílabo 2017 con créditos, horas y prerrequisitos |
| `courses2025.ts` | Cursos del Sílabo 2025 |
| `equivalencias.ts` | Tabla de equivalencias entre ambos planes |
| `reprogramaciones.ts` | Reprogramaciones extraordinarias vigentes |

Si encontraste un error en prerrequisitos, créditos, o equivalencias, puedes corregirlo directamente y abrir un Pull Request con la fuente oficial (resolución, sílabo oficial, etc.).

### 💻 Contribuir código

1. **Fork** el repositorio
2. Crea una rama descriptiva: `git checkout -b fix/prereq-curso-1702224` o `feat/comparador-planes`
3. Haz tus cambios
4. Verifica que TypeScript compile sin errores: `npm run typecheck`
5. Verifica que el proyecto compile: `npm run build`
6. Abre un Pull Request describiendo el cambio y su motivación (usa la plantilla que aparece automáticamente)

---

## Reglas del motor curricular

Toda la lógica académica vive en `useCurriculumEngine.ts`. Las reglas configurables están en `academicRules.ts` — **no toques la lógica del motor para cambiar umbrales o constantes**, solo edita ese archivo de configuración.

### Prioridad de decisión del motor

El motor decide si un curso está disponible siguiendo este orden:

1. ¿El estudiante ya lo aprobó? → no disponible
2. ¿Faltan prerrequisitos? → bloqueado
3. ¿Es un curso 2017 retirado (sin equivalencia)? → no disponible, mostrar aviso
4. ¿Coincide con el semestre objetivo? (o hay reprogramación) → disponible

### Equivalencias bidireccionales

Aprobar un curso en cualquiera de los dos planes marca automáticamente su equivalente como aprobado. Esto se maneja en `effectiveApproved` dentro del motor.

**Nota para quien toque `unlockedBy` o cualquier cálculo de "qué desbloquea este curso":** compara siempre a través de la frontera de equivalencia, no solo por código literal (`===`). Un curso activo puede tener como prerrequisito un curso ya retirado, y viceversa.

---

## Preguntas frecuentes para contribuidores

**¿Por qué `lastCohortPlan2017 = 2024`?**
Porque 2024 fue el último año en que se abrió admisión para el Sílabo 2017. La fórmula de retiro depende de este valor.

**¿Cómo agrego una reprogramación?**
Agrega una entrada en `reprogramaciones.ts` con el código del curso, el año de matrícula y el semestre en que se reprograma. El motor la detecta automáticamente.

**¿Cómo agrego una equivalencia nueva?**
Edita `equivalencias.ts`. El formato es `{ plan2025Code: 'XXXX', plan2017Codes: ['YYYY'] }`. Las equivalencias son bidireccionales: no necesitas agregar el mapeo inverso.

---

## Sobre los datos académicos

Este proyecto no es oficial ni está afiliado a la UNSA. Toda corrección de datos (créditos, prerrequisitos, equivalencias, reprogramaciones) debe estar respaldada por una fuente oficial verificable (resolución, sílabo publicado, comunicado de la Escuela Profesional). Cita esa fuente en tu Pull Request — los datos académicos incorrectos afectan la matrícula real de tus compañeros.
