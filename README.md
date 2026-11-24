# Galactic PTZ

Proyecto de simulación 3D con React, TypeScript, Three.js y Zustand. Incluye cámara PTZ, movimiento tipo FPS, disparos, objetivos, controles de Xbox, poderes, niveles y audio adaptativo.

## Características

- Cámara PTZ con movimiento panorámico, inclinación y zoom.
- Controles por teclado y mando Xbox mediante la Gamepad API.
- Combate 3D con proyectiles, objetivos, jefe, escudos y combos.
- Modos Entrenamiento y Desafío.
- Múltiples biomas, niveles y configuraciones gráficas.
- Audio ambiental y musical adaptable al estado del juego.
- Interfaz HUD responsiva.

## Tecnologías

- React 19
- TypeScript
- Vite
- Three.js y React Three Fiber
- Zustand
- Tailwind CSS
- Playwright Core

## Requisitos

- Node.js 20 o superior.
- npm.
- Navegador compatible con WebGL y, opcionalmente, Gamepad API.

## Instalación

```bash
npm install
npm run dev
```

Abre la URL que indique Vite en la terminal.

## Comandos

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Verificación TypeScript y compilación
npm run lint      # Análisis estático
npm run preview   # Servir la compilación de producción
npm run test:e2e  # Pruebas end-to-end
```

## Controles

| Acción | Teclado | Xbox |
|---|---|---|
| Moverse | `W`, `A`, `S`, `D` | Joystick izquierdo |
| Mirar | Ratón | Joystick derecho |
| Disparar | Botón izquierdo | RT o A |
| Zoom táctico | Botón derecho | RB / LB |
| Saltar | `Espacio` | A |
| Recargar | `R` | X |
| Entrar al portal | `E` | — |
| Pausar | `P` o `Escape` | Start |

## Arquitectura

- `src/components/Scene3D`: escena, cámara, objetivos, proyectiles y motor Three.js.
- `src/components/HUD`: interfaz React y menús.
- `src/game`: estado global, configuración, mapas, audio y texturas.
- `src/hooks`: entrada de teclado y mandos.
- `tests/e2e`: pruebas end-to-end.

El estado frecuente del bucle de juego se mantiene en `SceneState` para evitar renders React por frame. El estado de interfaz y partida se mantiene en Zustand.

## Desarrollo seguro

Este repositorio está diseñado para que ningún cambio llegue a `main` sin revisión.

1. Haz un fork del repositorio.
2. Crea una rama desde `main`, por ejemplo `feature/nueva-mejora`.
3. Realiza cambios pequeños y enfocados.
4. Ejecuta `npm run build`, `npm run lint` y `npm run test:e2e`.
5. Abre un Pull Request usando la plantilla del repositorio.
6. Espera a que GitHub Actions termine.
7. El propietario revisa el código y aprueba manualmente.
8. Solo después se permite la fusión.

No se deben enviar cambios directamente a `main`. Los forks no pueden modificar secretos o credenciales del repositorio original.

### Controles preparados

- GitHub Actions valida compilación y lint en Pull Requests.
- Las pruebas smoke deben aprobar antes de considerar el cambio.
- Se requiere al menos una aprobación antes de fusionar.
- Las conversaciones deben estar resueltas.
- CODEOWNERS solicita revisión del propietario.
- Dependabot vigila dependencias npm y GitHub Actions.

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) antes de contribuir y [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

## Audio

Los archivos de audio incluidos tienen atribución CC0. Consulta [public/audio/ATTRIBUTION.md](public/audio/ATTRIBUTION.md) antes de redistribuir el proyecto.
