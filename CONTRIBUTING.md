# Contribuir

## Antes de empezar

- Crea una rama descriptiva desde `main`.
- Trabaja en una sola mejora por Pull Request.
- No incluyas secretos, claves, contraseñas, datos personales ni archivos generados.
- No modifiques `node_modules`, `dist` ni archivos locales.

## Validación requerida

```bash
npm install
npm run build
npm run lint
npm run test:e2e
```

Solo abre el Pull Request cuando todos los comandos funcionen en tu entorno.

## Pull Requests

- Describe qué cambia y por qué.
- Incluye pasos reproducibles y capturas si afecta la interfaz.
- Identifica cambios sensibles a WebGL, audio, juego o controles.
- Responde a todas las observaciones.
- El propietario debe revisar y aprobar manualmente el cambio.

Los Pull Requests no deben fusionarse hasta que las pruebas terminen correctamente y todas las conversaciones estén resueltas.
