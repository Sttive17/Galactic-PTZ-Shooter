# Galactic PTZ

**Simulador táctico 3D de cámara PTZ y combate orbital**, desarrollado con React, TypeScript y Three.js. Explora biomas, supera oleadas y niveles, y juega con teclado y ratón o con un mando compatible con la Gamepad API.

[![CI](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml/badge.svg)](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml)

## Contenido

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos e instalación](#requisitos-e-instalación)
- [Comandos](#comandos)
- [Cómo jugar](#cómo-jugar)
- [Controles](#controles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pruebas](#pruebas)
- [Contribuciones y protección](#contribuciones-y-protección)
- [Seguridad](#seguridad)
- [Créditos y licencia](#créditos-y-licencia)

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

## Tecnologías

- React 19 y TypeScript
- Vite 8
- Three.js, React Three Fiber y Drei
- Zustand
- Tailwind CSS
- Playwright Core para pruebas end-to-end

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

Las pruebas E2E necesitan Google Chrome o Microsoft Edge instalado. El proyecto usa `playwright-core` y no descarga un navegador automáticamente.

## Cómo jugar

En el menú principal se puede iniciar:

- **Campaña:** progresión por niveles, con jefes y transiciones entre biomas.
- **Mapa estelar:** permite consultar y seleccionar niveles disponibles.
- **Oleadas:** modo de entrenamiento sin el límite de tiempo de la campaña.
- **Ajustes:** opciones de gráficos, pantalla, audio y controles.

La interfaz muestra información de partida como salud, escudo, munición, puntuación y objetivos. Algunos controles, poderes y acciones dependen del estado actual del juego.

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

## Pruebas

La integración continua ejecuta compilación, lint y pruebas smoke en Pull Requests y en cambios a `main`.

Para ejecutar una suite local:

```bash
npm run test:e2e -- --tier smoke
npm run test:e2e -- --tier 1
npm run test:e2e -- --tier 2
npm run test:e2e -- --tier 3
npm run test:e2e -- --tier 4
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

## Seguridad

No publiques tokens, contraseñas ni vulnerabilidades sin corregir en issues o Pull Requests. Consulta [SECURITY.md](SECURITY.md) para reportes privados y recomendaciones.

## Créditos y licencia

Los recursos de audio incluidos tienen atribución CC0; revisa [public/audio/ATTRIBUTION.md](public/audio/ATTRIBUTION.md).

El repositorio no incluye actualmente un archivo de licencia para el código del juego. Por lo tanto, no se concede permiso general para reutilizar, redistribuir o publicar versiones modificadas del código. Para proponer cambios, envía un Pull Request y espera la aprobación del propietario.
