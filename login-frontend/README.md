# Login Frontend - ISPC

Aplicación Angular para autenticación académica integrada con backend Django.

## Funcionalidades

- Login por usuario/contraseña con JWT
- Registro de cuenta con validaciones de formulario y backend
- Recuperación de contraseña con OTP
- OAuth social Google/GitHub en popup
- Persistencia de sesión en localStorage
- Interceptor Bearer token para requests autenticados

## Requisitos

- Node.js 18+
- npm 10+
- Backend activo en `http://localhost:8000`

## Ejecutar en desarrollo

```bash
npm install
npm start
```

App disponible en `http://localhost:4200`

## Build

```bash
npm run build
```

Salida en `dist/login-frontend`

## Rutas

- `/login` - Inicio de sesión
- `/register` - Registro
- `/forgot-password` - Recuperación OTP
- `/home` - Dashboard

## Endpoints usados

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/logout/`
- `GET /api/user/`
- `POST /api/password-reset-request/`
- `POST /api/password-reset-verify-otp/`
- `POST /api/password-reset-confirm/`
- `GET /accounts/google/login/?process=login`
- `GET /accounts/github/login/?process=login`

## Documentación extendida

Ver `DOCUMENTACION.md` para flujo completo de componentes, servicios y troubleshooting.
