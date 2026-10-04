# Documentación - ISPC Programa III Frontend

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Instalación y Ejecución](#instalación-y-ejecución)
3. [Arquitectura](#arquitectura)
4. [Servicios](#servicios)
5. [Componentes](#componentes)
6. [Rutas](#rutas)
7. [Flujos de Autenticación](#flujos-de-autenticación)
8. [Contratos de API](#contratos-de-api)
9. [Troubleshooting](#troubleshooting)

---

## Descripción General

Frontend Angular 21 (standalone components) para autenticación académica con backend Django.

Incluye:

- Login JWT
- Registro de usuarios
- Recuperación de contraseña OTP
- OAuth Google/GitHub en popup
- Persistencia de sesión

---

## Instalación y Ejecución

```bash
npm install
npm start
```

Aplicación: `http://localhost:4200`

Build producción:

```bash
npm run build
```

---

## Arquitectura

Estructura principal:

- `src/app/services/auth.service.ts`: lógica de auth y sesiones
- `src/app/services/auth.interceptor.ts`: Bearer token automático
- `src/app/login/`: login + OAuth popup
- `src/app/register/`: registro de usuarios
- `src/app/forgot-password/`: flujo OTP
- `src/app/home/`: pantalla protegida
- `src/app/app.routes.ts`: rutas de aplicación
- `src/app/app.config.ts`: providers e interceptores

---

## Servicios

### AuthService

Métodos principales:

- `login(username, password)`
- `register(username, email, password, password2)`
- `logout()`
- `getToken()`
- `isAuthenticated()`
- `getGoogleOAuthUrl()`
- `getGitHubOAuthUrl()`
- `completeOAuthLogin(access, refresh)`

Estado reactivo:

- `currentUser$`
- `isAuthenticated$`

Persistencia en localStorage:

- `token`
- `refresh_token`
- `user`

### AuthInterceptor

Adjunta `Authorization: Bearer <token>` en requests autenticados.

---

## Componentes

### Login (`/login`)

- Formulario username/password
- Botones OAuth Google/GitHub
- OAuth por popup con `postMessage`
- Manejo de errores 401/400

### Register (`/register`)

- Campos: username, email, password, password2
- Validaciones locales (required, email, minLength, match)
- Validaciones backend inline (username/email duplicados, contraseña débil)

### Forgot Password (`/forgot-password`)

Flujo de 3 pasos:

1. Solicitud OTP por email
2. Verificación OTP
3. Confirmación con nueva contraseña

Payload final usa `otp`, `new_password`, `new_password2`.

### Home (`/home`)

- Requiere sesión activa
- Permite logout

---

## Rutas

- `/` -> login
- `/login` -> login
- `/register` -> registro
- `/forgot-password` -> recuperar contraseña
- `/home` -> home
- `**` -> redirige a `/`

---

## Flujos de Autenticación

### Login JWT

1. Usuario envía credenciales
2. `POST /api/login/`
3. Respuesta con `access`, `refresh`, `user`
4. Front guarda sesión y navega a `/home`

### Registro

1. Usuario completa formulario
2. `POST /api/register/`
3. Backend valida duplicados y password
4. Front muestra errores por campo o confirma creación

### OAuth Popup (Google/GitHub)

1. Front abre popup a `/accounts/{provider}/login/?process=login`
2. Usuario autentica en proveedor real
3. Backend redirige con tokens
4. Popup envía tokens a ventana principal por `postMessage`
5. Front completa sesión y navega a `/home`

---

## Contratos de API

### Register

`POST /api/register/`

```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "password2": "SecurePassword123!"
}
```

Respuesta exitosa:

```json
{
  "refresh": "...",
  "access": "...",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com"
  }
}
```

### Login

`POST /api/login/`

```json
{
  "username": "newuser",
  "password": "SecurePassword123!"
}
```

Respuesta exitosa igual a register (`refresh`, `access`, `user`).

### Password Reset

1) `POST /api/password-reset-request/`

```json
{ "email": "user@example.com" }
```

2) `POST /api/password-reset-verify-otp/`

```json
{ "email": "user@example.com", "otp": "123456" }
```

3) `POST /api/password-reset-confirm/`

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewPassword123!",
  "new_password2": "NewPassword123!"
}
```

---

## Troubleshooting

### 400 en register

Causas comunes:

- username duplicado
- email duplicado
- contraseña débil

### 401 en login

- credenciales inválidas

### OAuth abre página intermedia en vez de proveedor

- Verificar URLs con `?process=login`
- Verificar backend con `SOCIALACCOUNT_LOGIN_ON_GET = True`

### CORS error

- Revisar `CORS_ALLOWED_ORIGINS` en backend
- Confirmar frontend en `http://localhost:4200`
