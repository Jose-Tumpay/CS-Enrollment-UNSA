# Guía de Contribución

¡Gracias por querer mejorar esta herramienta para los estudiantes de CS-UNSA!

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
5. Abre un Pull Request describiendo el cambio y su motivación

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

---

## Preguntas frecuentes para contribuidores

**¿Por qué `lastCohortPlan2017 = 2024`?**  
Porque 2024 fue el último año en que se abrió admisión para el Sílabo 2017. La fórmula de retiro depende de este valor.

**¿Cómo agrego una reprogramación?**  
Agrega una entrada en `reprogramaciones.ts` con el código del curso, el año de matrícula y el semestre en que se reprograma. El motor la detecta automáticamente.

**¿Cómo agrego una equivalencia nueva?**  
Edita `equivalencias.ts`. El formato es `{ plan2025Code: 'XXXX', plan2017Codes: ['YYYY'] }`. Las equivalencias son bidireccionales: no necesitas agregar el mapeo inverso.

---

## Código de conducta

Este proyecto es para estudiantes de CS-UNSA. Sé respetuoso, constructivo y recuerda que los datos académicos incorrectos afectan a tus compañeros. Cita siempre la fuente oficial cuando corrijas datos.
