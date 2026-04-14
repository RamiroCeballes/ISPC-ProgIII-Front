# Documentación - ISPC Programa III Frontend

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Configuración Inicial](#configuración-inicial)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Módulos y Servicios](#módulos-y-servicios)
5. [Componentes](#componentes)
6. [Rutas de la Aplicación](#rutas-de-la-aplicación)
7. [Autenticación](#autenticación)
8. [Recuperación de Contraseña](#recuperación-de-contraseña)
9. [Endpoints del Backend](#endpoints-del-backend)
10. [Guía de Desarrollo](#guía-de-desarrollo)
11. [Despliegue](#despliegue)

---

## Descripción General

**ISPC Programa III Frontend** es una aplicación web construida con Angular 21 que proporciona una interfaz moderna y segura para la autenticación y acceso a un dashboard académico. La aplicación implementa autenticación basada en tokens JWT y un flujo de recuperación de contraseña con OTP.

### Características Principales

- Interfaz de login limpia y moderna con estética Google
- Autenticación segura con tokens JWT
- Flujo de recuperación de contraseña con OTP (One-Time Password)
- Dashboard con acceso a funcionalidades académicas
- Gestión de sesiones con persistencia en localStorage
- Protección de rutas para usuarios autenticados
- Diseño responsive para dispositivos móviles
- Manejo robusto de errores
- Interceptor HTTP para automatizar envío de tokens

### Stack Tecnológico

- **Framework**: Angular 21 (Standalone Components)
- **Lenguaje**: TypeScript 5.9
- **Gestión de Estado**: RxJS
- **Formularios**: Reactive Forms
- **HTTP**: HttpClient con Interceptores
- **Estilos**: CSS3 (Gradientes, Flexbox, Grid)
- **Enrutamiento**: Angular Router

---

## Configuración Inicial

### Requisitos Previos

- Node.js v18 o superior
- npm 10.x o superior
- Git

### Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/ISPC/ISPC-ProgIII-Front.git
cd ISPC-ProgIII-Front/login-frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Asegurar que el backend esté disponible en `http://localhost:8000`

### Configuración del Entorno

El archivo principal de configuración es `src/app/services/auth.service.ts`. Actualiza la URL del API si es necesario:

```typescript
private apiUrl = 'http://localhost:8000/api';
```

### Iniciar Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

---

## Estructura del Proyecto

```
login-frontend/
├── public/                          # Archivos estáticos públicos
├── src/
│   ├── app/
│   │   ├── services/                # Servicios compartidos
│   │   │   ├── auth.service.ts      # Autenticación con JWT
│   │   │   └── auth.interceptor.ts  # Interceptor Bearer token
│   │   ├── login/                   # Componente de Login
│   │   │   ├── login.ts
│   │   │   ├── login.html
│   │   │   ├── login.css
│   │   │   └── login.spec.ts
│   │   ├── home/                    # Componente Dashboard
│   │   │   ├── home.ts
│   │   │   ├── home.html
│   │   │   ├── home.css
│   │   │   └── home.spec.ts
│   │   ├── forgot-password/         # Recuperación de Contraseña con OTP
│   │   │   ├── forgot-password.ts
│   │   │   ├── forgot-password.html
│   │   │   ├── forgot-password.css
│   │   │   └── forgot-password.spec.ts
│   │   ├── app.routes.ts            # Definición de rutas
│   │   ├── app.config.ts            # Configuración Angular
│   │   ├── app.ts                   # Componente raíz
│   │   ├── app.html
│   │   ├── app.css
│   │   └── app.spec.ts
│   ├── styles.css                   # Estilos globales
│   ├── main.ts                      # Punto de entrada
│   └── index.html                   # HTML base
├── angular.json                     # Angular CLI config
├── tsconfig.json                    # TypeScript config
├── tsconfig.app.json                # TypeScript app config
├── package.json                     # Dependencias
├── README.md                        # Información general
└── DOCUMENTACION.md                 # Este archivo
```

---

## Módulos y Servicios

### AuthService

**Ubicación**: `src/app/services/auth.service.ts`

Gestiona toda la autenticación y sesiones del usuario.

#### Métodos

- `login(username: string, password: string): Observable<any>` - Autentica usuario
- `logout(): void` - Cierra sesión
- `getToken(): string | null` - Retorna JWT token
- `isAuthenticated(): boolean` - Verifica sesión activa

#### Observables Públicos

- `currentUser$: Observable<any>` - Usuario actual
- `isAuthenticated$: Observable<boolean>` - Estado de autenticación

#### Almacenamiento Local

- `token`: JWT para peticiones autenticadas
- `user`: Datos del usuario en JSON

### AuthInterceptor

**Ubicación**: `src/app/services/auth.interceptor.ts`

Agrega automáticamente el token Bearer en todas las peticiones HTTP.

---

## Componentes

### Login Component

**Ubicación**: `src/app/login/`

Permite autenticarse al sistema.

- Formulario reactivo con validaciones
- Error handling contextual
- Link a recuperación de contraseña
- Redirección automática a dashboard

### Home Component

**Ubicación**: `src/app/home/`

Dashboard post-autenticación con:

- Información del usuario
- Botón logout
- 4 tarjetas de acceso rápido:
  - Materias
  - Tareas
  - Calificaciones
  - Anuncios
- Protección de ruta

### Forgot Password Component

**Ubicación**: `src/app/forgot-password/`

Flujo de 3 pasos para resetear contraseña:

**Paso 1**: Ingresar email
- Validación: email válido requerido
- Envía código OTP

**Paso 2**: Verificar código
- Validación: 6 dígitos numéricos
- Input monoespaciado
- Verifica OTP contra servidor

**Paso 3**: Nueva contraseña
- Validación: mínimo 8 caracteres
- Confirmación: debe coincidir
- Actualiza en servidor
- Redirige a login

#### Características

- Barra de progreso visual
- Botón "Atrás" entre pasos
- Mensajes de éxito/error
- Estados de carga

---

## Rutas de la Aplicación

```
/              → Login
/forgot-password → Recuperación de contraseña
/home          → Dashboard (protegida)
**             → Redirige a /
```

---

## Autenticación

### Flujo de Login

```
1. Usuario ingresa credenciales
2. POST /api/login/
3. Backend retorna JWT token
4. Frontend almacena en localStorage
5. Componentes se actualizan
6. Navega a /home
7. Interceptor agrega token en peticiones futuras
```

### Persistencia

- Session se restaura automáticamente al iniciar la app
- Token y usuario se almacenan en localStorage
- Usuario no pierde sesión al cerrar navegador

---

## Recuperación de Contraseña

### Flujo OTP

```
1. Click en "¿Olvidaste contraseña?" → /forgot-password
2. Ingresa email
3. Backend genera OTP y envía por email
4. Usuario ingresa código de 6 dígitos
5. Backend verifica OTP
6. Usuario ingresa nueva contraseña
7. Backend actualiza contraseña
8. Redirige a /login
```

### Seguridad

- OTP de corta validez (típicamente 5-10 minutos)
- Token temporal único por solicitud
- Contraseña encriptada en servidor
- OTPs no se almacenan en frontend

---

## Endpoints del Backend

### Login

**POST /api/login/**
```json
Request: { "username": "string", "password": "string" }
Response: { "token": "jwt...", "user": { ... } }
```

### Password Reset - Paso 1

**POST /api/password-reset-request/**
```json
Request: { "email": "string" }
Response: { "message": "Código enviado" }
```

### Password Reset - Paso 2

**POST /api/password-reset-verify-otp/**
```json
Request: { "email": "string", "otp": "string" }
Response: { "token": "temp_token..." }
```

### Password Reset - Paso 3

**POST /api/password-reset-confirm/**
```json
Request: { "email": "string", "token": "string", "new_password": "string" }
Response: { "message": "Contraseña actualizada" }
```

### Headers Requeridos (Autenticado)

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

---

## Estilos y Diseño

### Colores

| Tipo | Hex |
|------|-----|
| Primario | #4f46e5 |
| Error | #ef4444 |
| Éxito | #10b981 |
| Fondo | #f5f7fa |

### Tipografía

- **Font**: System fonts (-apple-system, Segoe UI, etc.)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Monospace**: Courier New (OTP)

### Responsive

- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

---

## Guía de Desarrollo

### Crear Componente

```bash
ng generate component components/mi-componente
```

### Usar AuthService

```typescript
export class MiComponente {
  private authService = inject(AuthService);
  usuario$ = this.authService.currentUser$;
}
```

### Validador Personalizado

```typescript
const miValidador: ValidatorFn = (control) => {
  // Lógica
  return esValido ? null : { miError: true };
};
```

---

## Scripts

```bash
npm start       # Desarrollo
npm run build   # Producción
npm run watch   # Watch mode
npm test        # Tests
```

---

## Despliegue

### Build

```bash
npm run build
```

Genera archivos en `dist/login-frontend/`

### Servidor Web

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Solución de Problemas

**Página en blanco después de login**
- Verificar token en localStorage
- Revisar respuesta del backend
- Revisar console (F12)

**CORS error**
- Backend debe permitir `http://localhost:4200`

**OTP no llega**
- Verificar email en sistema
- Revisar spam

---

## Mejoras Futuras

- Refresh token automático
- 2FA adicional
- OAuth (Google, GitHub)
- Tests automatizados
- Tema oscuro
- Auditoría de cambios
- Notificaciones en tiempo real

---

**Última actualización**: Abril 14, 2026  
**Versión**: 1.1.0  
**Angular**: 21.2.0
