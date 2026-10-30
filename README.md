# VetAndes Web (vetandes-frontend)

SPA en Angular 22 (componentes standalone y signals) para la clínica veterinaria VetAndes. Consume la API `vetandes-backend`.

## Ejecutar

```bash
npm install
ng serve          # o: npm start
```

Abre http://localhost:4200. El backend debe estar levantado en http://localhost:8080. La URL de la API está en `src/environments/environment.ts`.

## Usuarios de prueba

| Usuario     | Contraseña | Rol           | Ve en el menú |
|-------------|------------|---------------|---------------|
| admin       | Vet2026*   | ADMIN         | Todo |
| recepcion   | Vet2026*   | RECEPCIONISTA | Prestaciones (solo lectura), Mascotas, Nueva atención, Atenciones |
| veterinario | Vet2026*   | VETERINARIO   | Prestaciones, Mascotas (solo lectura), Atenciones (anular), Reporte |
| inactivo    | Vet2026*   | RECEPCIONISTA | No puede ingresar (401) |

## Estructura

```
src/app/
├── core/
│   ├── auth/          auth.model.ts, auth-service.ts (sesión con signals + sessionStorage)
│   ├── guards/        auth-guard, invitado-guard, permiso-guard
│   ├── interceptors/  auth-interceptor (Bearer), sesion-interceptor (401 → login)
│   ├── config/        menu.ts (cada opción con su permiso)
│   ├── services/      un servicio HTTP por recurso
│   ├── models/        interfaces de la API
│   └── utils/         http-error.ts (mensaje y campos del backend)
├── shared/            directives/si-permiso, pages/acceso-denegado, pages/no-encontrado,
│                      pipes/edad-pipe, validators/fecha-no-futura
├── layout/            main-layout, header, sidebar
└── features/          auth/login, inicio, prestaciones, mascotas,
                       atenciones (consulta, registro, detalle), reportes
```

## Rutas

| Ruta | Permiso (data.permiso) |
|------|------------------------|
| /login | Solo invitados (`invitadoGuard`), fuera del layout |
| /inicio | Sesión (`authGuard` en el layout) |
| /prestaciones · /nuevo · /:id/editar | PRESTACION_LEER · PRESTACION_ESCRIBIR |
| /mascotas · /nuevo · /:id/editar | MASCOTA_LEER · MASCOTA_ESCRIBIR |
| /atenciones · /atenciones/nueva · /atenciones/:id | ATENCION_LEER · ATENCION_REGISTRAR · ATENCION_LEER |
| /reportes | REPORTE_VER |
| /acceso-denegado | Ruta sin permiso escrita a mano (la sesión continúa) |
| ** | Página 404 |

Todas las features se cargan de forma diferida (`loadChildren` / `loadComponent`).

## Seguridad en la SPA

- **Token:** se agrega en un solo lugar, `authInterceptor`, y solo a las URL de `environment.apiUrl`.
- **401:** `sesionInterceptor` cierra la sesión y vuelve a `/login?returnUrl=...`. El 401 del propio login solo muestra "Usuario o contraseña incorrectos".
- **403:** no cierra la sesión; se muestra el mensaje del backend.
- **Sesión:** se guarda en `sessionStorage` (clave `vetandes.sesion`) con `expiraEn`. Al recargar, si ya venció, se descarta. Mientras la app está abierta, un temporizador cierra la sesión al vencer.
- **Menú y botones:** se filtran con `computed()` y la directiva `*siPermiso`, que dependen del signal de permisos. Por eso cambian solos al cambiar de usuario. Ocultarlos es comodidad: el backend responde 403 de todas formas.

## Demostraciones del examen

1. **Registrar una atención como `recepcion`:** en *Nueva atención* busca la mascota, agrega 3 prestaciones y verás el descuento del 10 % al instante. Al registrar aparece el mensaje con el número AT-…
2. **Entrar como `veterinario`:** "Nueva atención" no aparece en el menú, y escribir `/atenciones/nueva` a mano muestra "Acceso denegado".
3. **Vencimiento:** en DevTools → Application → Session Storage, edita `vetandes.sesion` y cambia `expiraEn` a `2020-01-01T00:00:00.000Z`. Pulsa F5 y la SPA pide iniciar sesión.
4. **409 en mascotas:** registra una mascota con el mismo nombre para el mismo propietario (por ejemplo, Firulais del propietario Carmen Rosa). El mensaje del backend aparece en la página.
