# ISPC Programa III - Frontend

Repositorio frontend para autenticación y dashboard académico de Programación III.

## Estado Actual

Aplicación Angular (standalone) conectada al backend Django con:

- Login JWT (`access` + `refresh`)
- Registro de usuario (username, email, password)
- Validaciones de duplicado (usuario/email existentes)
- Recuperación de contraseña por OTP (3 pasos)
- OAuth Google/GitHub vía popup y proveedor real
- Interceptor HTTP con Bearer token

## Estructura

- `login-frontend/`: aplicación Angular principal
- `README.md`: resumen del repo frontend
- `login-frontend/README.md`: guía técnica de la app
- `login-frontend/DOCUMENTACION.md`: documentación funcional detallada

## Requisitos

- Node.js 18+
- npm 10+
- Backend ejecutándose en `http://localhost:8000`

## Inicio Rápido

```bash
cd login-frontend
npm install
npm start
```

Frontend: `http://localhost:4200`

## Scripts

```bash
npm start
npm run build
npm test
```

## Integración Backend

API base usada por frontend:

- `http://localhost:8000/api`

OAuth social usado por popup:

- `http://localhost:8000/accounts/google/login/?process=login`
- `http://localhost:8000/accounts/github/login/?process=login`

## Documentación

- Guía técnica: `login-frontend/README.md`
- Guía completa: `login-frontend/DOCUMENTACION.md`
