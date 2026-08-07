# Malla Curricular CS — UNSA

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

**Sistema Inteligente de Planificación de Matrícula**
Escuela Profesional de Ciencia de la Computación — Universidad Nacional de San Agustín, Arequipa

Una aplicación web que ayuda a los estudiantes a planificar su matrícula considerando el cambio de currícula entre el **Sílabo 2017** y el **Sílabo 2025**, las equivalencias entre ambos planes, el retiro progresivo de cursos y las reprogramaciones oficiales.

<!-- 🔗 Reemplaza esto con tu link real cuando lo despliegues (Vercel/Netlify/GitHub Pages) -->
**[▶ Ver demo en vivo](https://cs-enrollment-unsa-kaml.vercel.app/progreso)** · [Reportar un bug](../../issues/new?labels=bug) · [Pedir una función](../../issues/new?labels=enhancement)

<!-- 🖼 Muy recomendado: agrega aquí un screenshot o GIF corto de la app.
     ![Vista de la malla](docs/screenshot-malla.png) -->

---

## Tabla de contenidos

- [¿Qué hace?](#qué-hace)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Ejecutar localmente](#ejecutar-localmente)
- [Cómo contribuir](#cómo-contribuir)
- [Lógica del retiro progresivo del Sílabo 2017](#lógica-del-retiro-progresivo-del-sílabo-2017)
- [Preguntas frecuentes](#preguntas-frecuentes)
- [Licencia](#licencia)

---

## ¿Qué hace?

- **Malla interactiva** — visualiza tu avance por año y semestre, con estados por curso (aprobado, disponible, bloqueado, retirado, sin equivalencia)
- **Simulador de matrícula** — selecciona cursos y verifica créditos, prerrequisitos y restricciones antes de matricularte
- **Soporte para transición curricular** — si eres del Sílabo 2017 y un curso ya no se oferta, la app muestra automáticamente su equivalente del Sílabo 2025
- **Cursos sin equivalencia** — identifica los cursos retirados que no tienen equivalente oficial y te informa sobre las alternativas
- **Progreso académico** — estadísticas de avance por año, semestre y créditos
- **Sin backend** — todo funciona en el navegador con `localStorage`; no se envía ningún dato a un servidor

---

## Stack tecnológico

| Capa        | Tecnología                     |
| ----------- | ------------------------------- |
| Framework   | React 18 + TypeScript          |
| Bundler     | Vite                            |
| Estilos     | Tailwind CSS v4                |
| Animaciones | Framer Motion                  |
| Iconos      | Lucide React                   |
| Routing     | Wouter                          |
| Estado      | React Context + `localStorage` |

---

## Estructura del proyecto

```
src/
├── config/
│   └── academicRules.ts      # Reglas académicas configurables (créditos, años, fórmulas)
├── data/
│   ├── courses2017.ts        # Cursos del Sílabo 2017 (68 cursos)
│   ├── courses2025.ts        # Cursos del Sílabo 2025 (66 cursos)
│   ├── equivalencias.ts      # Tabla de equivalencias entre ambos planes
│   └── reprogramaciones.ts   # Reprogramaciones extraordinarias vigentes
├── hooks/
│   ├── useCurriculumEngine.ts  # Motor curricular principal (toda la lógica académica)
│   └── useStudentStore.ts      # Acceso al contexto del estudiante
├── context/
│   └── StudentContext.tsx    # Estado global del perfil del estudiante
├── pages/
│   ├── Malla.tsx             # Vista de la malla curricular
│   ├── Simulador.tsx         # Simulador de matrícula
│   ├── Progreso.tsx          # Estadísticas de avance
│   ├── Dashboard.tsx         # Página principal
│   ├── Ayuda.tsx             # Guía de uso y preguntas frecuentes
│   └── Onboarding.tsx        # Pantalla de bienvenida
└── components/
    ├── Layout.tsx            # Navegación lateral y barra móvil
    └── InteractiveTour.tsx   # Tour guiado para nuevos usuarios
```

---

## Ejecutar localmente

Requiere **Node.js 18+** y npm.

```bash
# Clonar el repositorio
git clone https://github.com/Jose-Tumpay/CS-Enrollment-UNSA.git
cd CS-Enrollment-UNSA

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:<puerto>/` (Vite lo indica en la consola).

Otros comandos útiles:

```bash
npm run build      # build de producción
npm run serve      # sirve el build de producción localmente
npm run typecheck  # verifica que TypeScript compile sin errores
```

---

## Cómo contribuir

¡Las contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md) para la guía completa y [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) para las normas de la comunidad.

Las áreas donde más se necesita ayuda:

- **Datos**: verificar y corregir los datos de cursos, prerrequisitos y equivalencias
- **Bugs**: reportar o corregir comportamientos incorrectos del motor curricular
- **UI/UX**: mejorar la interfaz, accesibilidad y experiencia móvil
- **Nuevas funciones**: ver las [issues abiertas](../../issues)

No necesitas ser un experto en el proyecto para contribuir — corregir un dato de un curso o reportar un bug con buenos pasos de reproducción ya ayuda muchísimo.

---

## Lógica del retiro progresivo del Sílabo 2017

La cohorte 2024 es la última del Sílabo 2017. Su progresión determina qué años siguen activos:

- Año académico 2025 → se retiran los cursos de **1.er año** del Sílabo 2017
- Año académico 2026 → se retiran los cursos de **1.er y 2.do año**
- Año académico 2027 → se retiran los cursos de **1.er, 2.do y 3.er año**
- Año académico 2029 → el Sílabo 2017 queda completamente retirado

Fórmula: un curso del año `N` se retira cuando `añoDeMatrícula > 2023 + N`.

---

## Preguntas frecuentes

**¿Mis datos de matrícula se guardan en algún servidor?**
No. Todo se guarda en `localStorage` de tu navegador; nadie más tiene acceso a esa información.

**¿Es una herramienta oficial de la UNSA?**
No, es un proyecto independiente hecho por y para estudiantes. Ante cualquier duda oficial sobre tu matrícula, confirma siempre con la Escuela Profesional o la Oficina de Registros Académicos.

**Más preguntas** están respondidas dentro de la app, en la sección "Ayuda".

---

## Licencia

[MIT](LICENSE) — libre para usar, modificar y distribuir.

---

*Hecho por y para estudiantes de Ciencia de la Computación — UNSA Arequipa.*
