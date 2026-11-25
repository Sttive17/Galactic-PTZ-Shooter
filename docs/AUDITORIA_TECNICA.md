# Auditoría técnica — Galactic PTZ Shooter

Fecha de revisión: 25 de noviembre de 2026.

## Alcance

Se revisaron el `README.md`, los componentes React, el estado Zustand, los sistemas R3F/Three.js, los recursos locales, las pruebas E2E y la compilación de producción. Esta auditoría describe el estado que está implementado en el repositorio, no únicamente las funciones documentadas.

## Arquitectura actual

- **Cliente:** React 19, TypeScript y Vite 8.
- **Escena:** Three.js con React Three Fiber y Drei. `GameEngine` concentra el canvas y las capas de escena; los HUD se renderizan sobre él.
- **Estado:** Zustand en `src/game/gameState.ts`, con preferencias, progreso de campaña, armería, poderes, salud, armas, habilidades y estadísticas persistentes.
- **Contenido:** 50 niveles organizados en cinco capítulos, 22 variantes de bioma, 11 arquetipos de enemigo, ocho jefes y cinco armas.
- **Entradas:** teclado, ratón, controles táctiles y Gamepad API con hápticos cuando el mando lo permite.
- **Persistencia:** `localStorage` para preferencias, gráficos, armería y hoja de servicio.

## Funciones verificadas

| Área | Estado observado |
| --- | --- |
| Menú, mapa estelar, armería y ajustes | Implementados y visibles en ejecución. |
| Transición de despliegue y HUD | Implementados; la campaña inicia con una elección de poder. |
| Combate | Disparo, cinco arquetipos de arma, munición, recarga, EMP, Frenesí, enemigos, jefes, cajas y botín están conectados al estado de juego. |
| Progresión | Niveles, mapa por capítulos, nanitas, mejoras, árbol de doctrina con dependencias, skins, logros y estadísticas persistentes están presentes. |
| Escenas | Cinco familias de biomas con obstáculos, iluminación, partículas, clima y props. |
| Recursos 3D | Modelos GLB locales organizados bajo `public/models/` y `public/assets/models/`, con atribución CC0 documentada. |
| Controles | Componentes y hooks para PC, táctil y mando están presentes. |

## Correcciones aplicadas durante esta auditoría

1. Se eliminó la precarga global de todos los modelos GLB al abrir la aplicación. Cada modelo se carga bajo demanda desde el componente que lo utiliza; `preloadModels` queda disponible para precargar únicamente un conjunto concreto antes de una transición.
2. El menú ahora toma el número de poderes y arquetipos desde los catálogos de código. Así evita desajustes entre la interfaz, el README y el contenido real.
3. Se reforzó el paquete visual prioritario: plataforma de hangar para la Vanguard, módulos GLB de suelo y escaleras en el capítulo inicial, drones de logística que usan los assets nuevos y rigs visibles para identificar los jefes en combate.
4. Se añadió un árbol de doctrina persistente con dos ramas y cuatro nodos desbloqueables. Sus efectos modifican enfriamientos de EMP/Frenesí, duración de Frenesí, nanitas recogidas y regeneración de escudo.
5. Se corrigió la inicialización de misión para que el escudo y casco de las mejoras permanentes se apliquen también al reiniciar, comenzar una misión o elegir un nivel desde el mapa.

## Riesgos y trabajo técnico pendiente

| Prioridad | Hallazgo | Próxima acción recomendada |
| --- | --- | --- |
| Alta | El bundle de producción principal es de aproximadamente 1.73 MB sin comprimir. | Separar HUD/modales y dependencias 3D en fragmentos de carga diferida, midiendo el arranque antes y después. |
| Alta | Oxlint reporta mutaciones de props y objetos creados durante el render en varios componentes de escena. | Migrar estos datos a `useMemo`, refs o estado local; empezar por `Targets`, `Projectiles`, `Environment` y `SpaceBackdrop`. |
| Media | Hay dos catálogos de modelos: `public/models/` y `public/assets/models/`. | Mantenerlos durante la migración y consolidarlos en una sola estructura después de inventariar cada referencia. |
| Media | Ocho configuraciones de jefe reutilizan dos mallas principales y superponen efectos para diferenciar fases. | Cuando se incorporen nuevos GLB compatibles, asignar siluetas únicas por familia de jefe sin cambiar sus patrones de IA. |
| Media | La cobertura E2E existe por niveles, límites, combinaciones y escenarios, pero las pruebas no cubren aún cada ruta de carga de GLB. | Añadir un caso que espere la carga de cada familia utilizada por capítulo y revise errores de red. |

## Verificación realizada

- `npm run build`: correcto.
- `npm run lint`: finaliza correctamente con avisos de React sobre mutabilidad; no bloquea la compilación.
- Navegador local: menú, inicio de campaña, selección de poder, cinemática de despliegue y escena jugable comprobados; no se observaron errores de consola durante la prueba.
