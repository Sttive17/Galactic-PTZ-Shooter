# Seguridad

## Reportar una vulnerabilidad

No publiques vulnerabilidades mediante issues, discusiones o Pull Requests.

Para reportar una vulnerabilidad:

1. Envía un correo al propietario del repositorio desde tu cuenta de GitHub.
2. Describe el impacto, los pasos de reproducción y las versiones afectadas.
3. Incluye pruebas mínimas sin datos reales ni secretos.

El propietario confirmará la recepción, evaluará el impacto y coordinará una corrección antes de divulgar el hallazgo.

## Datos y secretos

- Nunca agregues API keys, tokens, contraseñas o archivos `.env` reales.
- Las preferencias locales deben permanecer en `localStorage`.
- Los archivos binarios generados no deben contener información privada.
- Cualquier secreto detectado debe rotarse inmediatamente.

## Dependencias

Las dependencias se revisan mediante Dependabot. Las actualizaciones deben pasar compilación y pruebas antes de fusionarse.
