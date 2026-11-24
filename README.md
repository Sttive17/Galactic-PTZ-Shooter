# Galactic PTZ

**Simulador táctico 3D de cámara PTZ y combate orbital**, desarrollado con React, TypeScript y Three.js. Explora biomas, supera oleadas y niveles, y juega con teclado y ratón o con un mando compatible con la Gamepad API.

[![CI](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml/badge.svg)](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml)

## Jugar

**Prueba el juego en el navegador:** [Abrir Galactic PTZ](https://sttive17.github.io/Galactic-PTZ-Shooter/)

Funciona mejor en un navegador de escritorio con WebGL. Para activar el audio, haz clic en la página; para jugar con un mando, conéctalo antes de iniciar la partida.

## Contenido

- [Características](#características)
- [Experiencia de juego](#experiencia-de-juego)
- [Tecnologías](#tecnologías)
- [Requisitos e instalación](#requisitos-e-instalación)
- [Comandos](#comandos)
- [Cómo jugar](#cómo-jugar)
- [Controles](#controles)
- [Ajustes y compatibilidad](#ajustes-y-compatibilidad)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pruebas](#pruebas)
- [Contribuciones y protección](#contribuciones-y-protección)
- [Seguridad](#seguridad)
- [Privacidad y datos](#privacidad-y-datos)
- [Créditos, copyright y licencia](#créditos-copyright-y-licencia)

## Características

- Cámara en primera persona con giro de 360°, inclinación y zoom.
- Movimiento, salto, sprint, colisiones y plataformas.
- Disparo, munición, recarga, proyectiles y objetivos con diferentes clases.
- Jefes, escudos, combos, puntuación y poderes.
- Campaña de hasta 50 niveles, mapa estelar y modo de oleadas de entrenamiento.
- Biomas y escenarios generados para los niveles.
- Mando compatible con Gamepad API.
- Ajustes de gráficos, audio, sensibilidad y accesibilidad.
- Música y ambiente que cambian según el estado de la partida.

## Experiencia de juego

La partida se juega desde una vista en primera persona. Gira la cámara, desplázate por el escenario, elimina objetivos y usa el entorno para evitar obstáculos. Los impactos aumentan la puntuación y el combo; recibir daño afecta primero al escudo y después a la salud.

| Sistema | Descripción |
|---|---|
| Campaña | Rondas cronometradas de dos minutos, progresión de niveles, encuentros con jefes y avance por biomas. |
| Oleadas | Modo de entrenamiento sin temporizador de campaña; las oleadas aumentan y pueden incluir jefes. |
| Mapa estelar | Vista para consultar y seleccionar niveles de la campaña que estén disponibles. |
| Poderes | Mejoras seleccionables que modifican habilidades o estadísticas de la partida. |
| Movimiento | Caminar, correr con resistencia, saltar, usar plataformas y colisionar con el escenario. |
| Combate | Disparo continuo, cargador, recarga, combos, puntuación, objetivos y jefes. |
| Audio adaptativo | Música, ambiente y efectos varían según el menú, el bioma y el estado del combate. |

## Tecnologías

- React 19 y TypeScript
- Vite 8
- Three.js, React Three Fiber y Drei
- Zustand
- Tailwind CSS
- Playwright Core para pruebas end-to-end
- GitHub Pages para alojar la versión web

## Requisitos e instalación

Se requiere Node.js **20.19+** o **22.12+**, npm y un navegador moderno con WebGL.

```bash
git clone https://github.com/Sttive17/Galactic-PTZ-Shooter.git
cd Galactic-PTZ-Shooter
npm install
npm run dev
```

Abre la dirección local que muestra Vite en la terminal. Para usar un mando, conéctalo antes de iniciar la partida y permite que el navegador lo detecte.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Ejecuta TypeScript y crea la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente la compilación de producción. |
| `npm run lint` | Analiza el código con Oxlint. |
| `npm run test:e2e` | Ejecuta las suites end-to-end. |
| `npm run test:e2e -- --tier smoke` | Ejecuta las pruebas rápidas de arranque, WebGL y audio. |

Las pruebas E2E necesitan Google Chrome o Microsoft Edge instalado. El proyecto usa `playwright-core` y no descarga un navegador automáticamente. Se puede seleccionar el navegador mediante `E2E_BROWSER_PATH` y ejecutar pruebas concretas con `--grep`.

## Publicación web

GitHub Actions compila la aplicación con la ruta base de GitHub Pages y publica el contenido de `dist/` automáticamente al actualizar `main`. El flujo está definido en `.github/workflows/deploy-pages.yml`. Los cambios a la aplicación se publican después de que termine el despliegue; revisa la ejecución **Deploy GitHub Pages** en la pestaña **Actions** del repositorio.

## Cómo jugar

En el menú principal se puede iniciar:

- **Campaña:** progresión por niveles, con jefes y transiciones entre biomas.
- **Mapa estelar:** permite consultar y seleccionar niveles disponibles.
- **Oleadas:** modo de entrenamiento sin el límite de tiempo de la campaña.
- **Ajustes:** opciones de gráficos, pantalla, audio y controles.

La interfaz muestra información de partida como salud, escudo, munición, puntuación y objetivos. La campaña tiene un temporizador por ronda; el entrenamiento continúa mediante oleadas. Al terminar una ronda se puede elegir un poder y continuar la progresión.

## Controles

### Teclado y ratón

| Acción | Control |
|---|---|
| Avanzar / retroceder | `W` / `S` o flechas arriba / abajo |
| Desplazarse lateralmente | `A` / `D` o flechas izquierda / derecha |
| Mirar | Ratón |
| Disparar | Mantener botón izquierdo |
| Apuntar con zoom táctico | Mantener botón derecho |
| Ajustar zoom base | `Q` / `E` o rueda del ratón |
| Saltar | `Espacio` |
| Correr | Mantener `Shift` mientras te mueves |
| Recargar | `R` |
| Entrar al portal activo | `E` |
| Pausar / reanudar | `P` o `Escape` |

El primer clic dentro del área de juego puede bloquear el puntero para permitir mirar alrededor. Pulsa `Escape` para liberar el puntero.

### Mando Xbox / Gamepad API

| Acción | Control |
|---|---|
| Moverse y desplazarse | Joystick izquierdo |
| Mirar | Joystick derecho |
| Disparar | Gatillo derecho (`RT`) |
| Zoom táctico | Gatillo izquierdo (`LT`) |
| Saltar | Botón `A` |
| Recargar | Botón `X` |
| Correr | Pulsar joystick izquierdo (`L3`) |
| Pausar / reanudar | `Start` |

Los nombres y la disponibilidad de los botones pueden variar con mandos no estándar o configuraciones particulares del navegador.

## Ajustes y compatibilidad

El panel de ajustes permite cambiar la calidad gráfica, brillo, sensibilidad de cámara, inversión vertical, vibración de cámara y volúmenes de música y efectos. Los perfiles gráficos disponibles son **Bajo**, **Medio**, **Alto** y **Personalizado**; también hay una opción de detección automática del hardware.

La aplicación requiere WebGL. Si la escena aparece negra o el rendimiento es bajo:

1. Actualiza el navegador y los controladores de gráficos.
2. Comprueba que WebGL esté habilitado en el navegador.
3. Selecciona el perfil **Bajo** desde Ajustes.
4. Cierra otras aplicaciones que utilicen intensivamente la GPU.

Para habilitar audio, interactúa primero con la aplicación: los navegadores suelen bloquear la reproducción de audio hasta que exista una acción del usuario. Si el mando no aparece, conéctalo, pulsa un botón y revisa que el navegador y el sistema operativo lo reconozcan.

## Estructura del proyecto

```text
src/
  components/
    HUD/       Interfaz, menús y paneles
    Scene3D/   Cámara, escenario, enemigos y lógica visual 3D
  game/        Estado, configuración, mapas, poderes y audio
  hooks/       Lectura de teclado y gamepad
  types/       Tipos compartidos
tests/
  e2e/         Suites de pruebas end-to-end
public/
  audio/       Recursos de audio y atribuciones
```

El estado de alta frecuencia del bucle 3D se mantiene en `SceneState` para evitar renders de React en cada frame. El estado de partida e interfaz se gestiona con Zustand.

### Flujo de datos

```text
Teclado / Gamepad
        |
        v
   InputManager -----> SceneState (movimiento y objetos por frame)
        |                       |
        v                       v
   Zustand Store <------ GameManager / sistemas 3D
        |
        v
       HUD
```

`GameEngine` monta el lienzo WebGL y los sistemas de escena. `InputManager` convierte teclado y gamepad en movimiento, apuntado y disparos. `GameManager` coordina temporizadores, transiciones de rondas y estado de combate. Los componentes del HUD leen el estado de Zustand para mostrar menús e indicadores.

## Pruebas

La integración continua de GitHub Actions instala dependencias con `npm ci` y ejecuta la compilación, lint y pruebas smoke en Pull Requests y en cambios a `main`. Las pruebas usan Chrome en modo headless y verifican el arranque, la escena WebGL y funciones principales de audio y configuración.

Para ejecutar una suite local:

```bash
npm run test:e2e -- --tier smoke
npm run test:e2e -- --tier 1
npm run test:e2e -- --tier 2
npm run test:e2e -- --tier 3
npm run test:e2e -- --tier 4
```

El runner también permite filtrar por nombre, por ejemplo:

```bash
npm run test:e2e -- --tier 1 --grep reload
```

## Contribuciones y protección

Las contribuciones externas deben llegar mediante Pull Request; **no hagas push directamente a `main`**.

1. Haz un fork y crea una rama descriptiva desde `main`.
2. Implementa un cambio acotado y no incluyas archivos generados ni credenciales.
3. Ejecuta `npm run build`, `npm run lint` y las pruebas pertinentes.
4. Abre un Pull Request con la plantilla del repositorio y explica los cambios.
5. Espera a que CI pase y a que el propietario revise y apruebe el Pull Request.
6. Resuelve las conversaciones de revisión; el cambio se fusiona solo después de la aprobación.

La rama `main` requiere una aprobación, revisión del propietario indicada en `CODEOWNERS`, checks de CI exitosos e hilos resueltos. Dependabot propone actualizaciones de dependencias. Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

Al preparar un cambio, mantén los commits acotados, actualiza la documentación si cambia el comportamiento visible y no incluyas `node_modules/`, `dist/`, credenciales o archivos locales. Los cambios de escena 3D deben comprobarse en un navegador con WebGL cuando sea posible.

## Seguridad

No publiques tokens, contraseñas ni vulnerabilidades sin corregir en issues o Pull Requests. Consulta [SECURITY.md](SECURITY.md) para reportes privados y recomendaciones.

## Privacidad y datos

El proyecto no necesita una cuenta ni un servidor propio para jugar. Las preferencias de juego y gráficos se guardan en el almacenamiento local del navegador. La carga de las fuentes visuales configuradas en `index.html` requiere conexión a Google Fonts.

## Créditos, copyright y licencia

**Copyright © 2026 Sttive17. Todos los derechos reservados** sobre el código del juego y el material original de este proyecto.

El proyecto usa una licencia propietaria: no se concede permiso general para copiar, reutilizar, modificar, redistribuir o publicar el código o versiones derivadas. Se requiere autorización previa por escrito del titular, salvo que una ley aplicable indique lo contrario. Consulta el archivo [LICENSE](LICENSE).

Los archivos de audio incluidos en `public/audio/` son recursos de terceros publicados bajo CC0 (incluido `tense-combat.mp3`, que también cuenta con una licencia CC-BY 3.0). La atribución, fuentes y contexto de uso están en [public/audio/ATTRIBUTION.md](public/audio/ATTRIBUTION.md). Esos permisos solo se aplican a los recursos identificados allí; no cambian la licencia del código del juego. Las dependencias también conservan sus propias licencias.
