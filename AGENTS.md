# AGENTS.md — SiredeMovil
Contexto persistente para sesiones de Codex en este repositorio.
Mostrar menos
---
## Descripción del proyecto
**SIREDE** (Sistema de Información para el Registro y Evaluación del Desempeño Estudiantil) es una aplicación móvil en React Native + Expo para la **Universidad Tecnológica de Santander (UTS)**. Permite a directivos académicos consultar estadísticas de graduación, deserción y retención de estudiantes por programa académico y corte semestral, cargar datos desde archivos CSV y generar informes en PDF.
El repositorio original pertenece a `andrespradaa/SiredeMovil`. El fork activo del proyecto es `rampmail29/SiredeMovil`.
---
## Stack tecnológico
| Capa | Tecnología |
|---|---|
| Framework | React Native 0.76.9 + Expo SDK 52 |
| Navegación | React Navigation 6 (Stack + Drawer + Bottom Tabs) |
| Autenticación | Firebase Authentication (email/password) |
| Base de datos de usuario | Firebase Firestore |
| Almacenamiento de archivos | Firebase Storage (fotos de perfil, documentos) |
| Backend REST | SiredeBackend (Node.js + Express + Prisma + PostgreSQL) |
| Parsing CSV | PapaParse |
| Gráficas | react-native-gifted-charts, react-native-chart-kit, victory-native |
| PDF | expo-print + expo-sharing |
| Testing | Jest 29 + jest-expo 52 + @testing-library/react-native 12 |
---
## Arquitectura de navegación
```
Stack Navigator (auth flow)
├── VideoScreen          — splash / intro
├── InicioSesion         — login Firebase
├── PasswordChangeScreen — cambio obligatorio de clave (primer login)
├── InitialSetupScreen   — wizard de configuración inicial
└── Drawer Navigator (menú lateral)
    ├── Tab Navigator (tabs principales)
    │   ├── Inicio           — dashboard con animaciones
    │   ├── Estadisticas     — hub → Cohorte o Matrícula
    │   └── Informes         — hub → por Estudiante o por Carrera
    ├── Perfil               — gestión de perfil de usuario
    ├── SireBot              — asistente IA
    ├── Reporte              — reportes generales
    ├── Cargar               — carga de archivos CSV
    └── AcercaDe             — información de la app
```
---
## Estructura de archivos clave
```
SiredeMovil/
├── App.js                          — punto de entrada
├── components/
│   ├── Config.js                   — API_BASE_URL (IP local del backend)
│   ├── Facultades.js               — listado estático de programas por facultad
│   ├── MainNavigator.js            — configuración completa de navegación + carga de fuentes
│   ├── InicioSesion.js             — login Firebase, reset de clave, detección de setup
│   ├── Cargar.js                   — carga de CSV (matrícula y graduados)
│   ├── CortesAcademicos.js         — selector de cortes (periodo inicial/final)
│   ├── ProgramasAcademicos.js      — selector de programa académico (por facultad)
│   ├── OpcionesInforme.js          — botones para generar informe por tipo
│   ├── InformeCarrera.js           — flujo completo: programa → corte → informe
│   ├── InformeEstudiante.js        — búsqueda y selección de estudiante individual
│   ├── StudentDetail.js            — detalle completo del estudiante
│   ├── StudentDetail2.js           — vista alternativa de detalle
│   ├── GraficarPdf.js              — generación de PDF con gráficas
│   ├── GraficarEstadisticas.js     — gráficas de estadísticas (pie + bar)
│   ├── GraficarPorCohorte.js       — gráficas por cohorte
│   ├── GraficarPorMatriculas.js    — gráficas por matrícula
│   ├── Estadis_Cohorte.js          — estadísticas por cohorte
│   ├── Estadis_Matricula.js        — estadísticas por rango de matrícula
│   ├── Perfil.js                   — gestión de perfil (foto, nombre, teléfono)
│   ├── SideBar.js                  — drawer personalizado
│   └── ...
├── utils/                          — funciones puras compartidas (creadas en refactor)
│   ├── stringUtils.js              — capitalizeFirstLetter, normalizeString
│   └── csvUtils.js                 — detectCsvFormat, extractProgramFromData, isNormalFormat, isGraduadosFormat
├── services/
│   └── firebaseFunction.js         — utilidades Firebase Admin (creación de usuarios)
├── __tests__/                      — tests unitarios y de componente
│   ├── utils/
│   │   ├── stringUtils.test.js
│   │   └── csvUtils.test.js
│   └── components/
│       ├── CargarCSV.test.js
│       ├── ProgramasAcademicos.test.js
│       ├── InformeEstudiante.test.js
│       └── OpcionesInforme.test.js
├── jest.setup.js                   — mocks globales para Jest
├── assets/                         — fuentes, imágenes, vídeos, gifs
└── package.json
```
---
## Conexión con el backend
El backend es el repositorio **`rampmail29/SiredeBackend`** (Node.js + Express + Prisma + PostgreSQL).
- La URL base se configura en `components/Config.js`:
  ```js
  export const API_BASE_URL = 'http://192.168.18.21:4001';
  ```
  Esta es la IP local de la máquina donde corre el backend. Debe actualizarse si cambia la red.
### Endpoints usados por el frontend
| Endpoint | Método | Uso |
|---|---|---|
| `/api/programas` | GET | Lista de programas académicos |
| `/api/estudiantes?search=X` | GET | Búsqueda de estudiantes por nombre |
| `/api/obtener/:id` | GET | Detalle de un estudiante |
| `/api/cargageneral` | POST | Carga CSV de matrícula (formato normal) |
| `/api/cargagraduados` | POST | Carga CSV de graduados |
| `/api/estadisticas/cohorte` | GET | Estadísticas por cohorte |
| `/api/estadisticas/matricula` | GET | Estadísticas por rango de matrícula |
---
## Formatos de archivo CSV
Dos formatos esperados, detectados automáticamente por el nombre del archivo:
| Formato | Patrón de nombre | Ejemplo | Campo del programa |
|---|---|---|---|
| Normal (matrícula) | `YYYY-P.csv` | `2023-1.csv` | `PROG_NOMBRE` |
| Graduados | `graduados_YYYY-P.csv` | `graduados_2023-1.csv` | `nombre_programa` |
La lógica de detección está en `utils/csvUtils.js`.
---
## Infraestructura de testing
Configurada en la sesión de abril 2025. Ejecutar con:
```bash
npm test           # corre todos los tests una vez
npm run test:watch # modo watch
```
### Setup global (`jest.setup.js`)
Mocks globales para: Firebase (auth, firestore, storage), `@react-navigation/native`, `react-native-flash-message`, `expo-document-picker`, `papaparse`, `@rneui/themed` (CheckBox), `@expo/vector-icons`, `expo-av`, `expo-video`, `expo-linear-gradient`, `expo-print`, `expo-sharing`, `expo-media-library`, `expo-image-picker`, `expo-image-manipulator`, `@react-native-async-storage/async-storage`, `react-native-svg`, `react-native-reanimated`, `react-native-gesture-handler`, y `global.fetch`.
### Cobertura actual (94 tests, 6 suites)
| Suite | Qué prueba |
|---|---|
| `utils/stringUtils.test.js` | `capitalizeFirstLetter`, `normalizeString` (17 tests) |
| `utils/csvUtils.test.js` | Detección de formato CSV, extracción de programa (27 tests) |
| `CargarCSV.test.js` | Render, selección de archivo, formatos, flujo de carga, modales (16 tests) |
| `ProgramasAcademicos.test.js` | Render, toggle de sección, callback de selección, estado vacío (12 tests) |
| `InformeEstudiante.test.js` | Búsqueda, limpieza, error, navegación (12 tests) |
| `OpcionesInforme.test.js` | Navegación con datos, errores sin datos, loading (13 tests) |
---
## Estado del proyecto (abril 2025)
### Completado
- **Backend (SiredeBackend):** refactor del controlador de graduados, separación en capas (controller → service → repository), pruebas unitarias con Jest + Prisma mock.
- **Frontend — Refactor de utilidades:** funciones puras extraídas a `utils/stringUtils.js` y `utils/csvUtils.js`, eliminando duplicación entre `Cargar.js` y `ProgramasAcademicos.js`.
- **Frontend — Infraestructura de testing:** Jest + jest-expo 52 + @testing-library/react-native configurados desde cero.
- **Frontend — Bug corregido en `OpcionesInforme.js`:** la función `generarInformeDesertados` accedía a `academicData.desertados` (siempre `undefined`) cuando la propiedad real es `academicData.desertores`. Detectado por los tests y corregido.
- **Frontend — Limpieza:** eliminados `console.log` de debug en `Cargar.js` y `OpcionesInforme.js`.
### Pendiente
- **Pruebas de integración de carga de graduados** — probar el flujo completo de subida de CSV de graduados contra el backend real (requiere datos de prueba).
- **Tests para componentes restantes** — `CortesAcademicos`, `StudentDetail`, `GraficarPdf`, `Estadis_Cohorte`, `Estadis_Matricula`.
- **Refactor de `StudentDetail.js`** — componente de 583 líneas con lógica de Firebase Storage, API y UI mezcladas; candidato a extracción de hooks.
- **Autenticación en tests** — los tests de componentes que dependen de Firebase Auth (`InicioSesion`, `Perfil`) requieren mocks más detallados de Firestore.
---
## Notas importantes
- **`firebaseConfig.js` está en `.gitignore`** — no existe en el repo, debe configurarse localmente con las credenciales del proyecto Firebase de UTS.
- **La IP del backend es local** — `192.168.18.21:4001` es la IP de la máquina de desarrollo. En producción o desde otra red habrá que actualizarla en `Config.js`.
- **Fuentes personalizadas** — Montserrat y MyriadPro se cargan en `MainNavigator.js` con `expo-font`. Los tests mockean `expo-font`.
- **`react-native-reanimated`** requiere el plugin de Babel en `babel.config.js` y su mock en `jest.setup.js`.
- **Versión de jest-expo debe coincidir con Expo SDK** — el proyecto usa Expo SDK 52, por lo tanto `jest-expo@52`. No usar versiones superiores (jest-expo@55 es incompatible con RN 0.76.x).

