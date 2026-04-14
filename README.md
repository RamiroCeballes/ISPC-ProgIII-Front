# ISPC Programa III - Frontend

Repositorio oficial de desarrollo frontend para la cátedra Programación III del ISPC.

## Descripción del Proyecto

Sistema de autenticación y dashboard académico desarrollado en **Angular 21** con autenticación basada en tokens JWT. Proporciona una interfaz moderna y segura para estudiantes de ISPC.

### Características Destacadas

- Autenticación segura con JWT tokens
- Interfaz moderna con estética Google
- Dashboard académico con acceso rápido a funcionalidades
- Gestión robusta de sesiones
- Protección de rutas
- Diseño totalmente responsive
- Código limpio y bien documentado

## Estructura del Repositorio

```
ISPC-ProgIII-Front/
├── README.md                        # Este archivo
├── login-frontend/                  # Aplicación Angular
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── DOCUMENTACION.md             # Documentación completa del frontend
│   ├── FRONTEND_README.md           # Guía rápida de inicio
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/            # AuthService e interceptores
│   │   │   ├── login/               # Componente de autenticación
│   │   │   ├── home/                # Componente dashboard
│   │   │   ├── app.routes.ts        # Rutas de la aplicación
│   │   │   └── app.config.ts        # Configuración de Angular
│   │   ├── styles.css               # Estilos globales
│   │   ├── main.ts
│   │   └── index.html
│   └── public/
```

## Inicio Rápido

### Requisitos Previos

- Node.js v18+
- npm 10.x+
- Backend ISPC-PROGIII ejecutándose en `http://localhost:8000`

### Instalación y Ejecución

1. Clonar el repositorio:
```bash
git clone https://github.com/ISPC/ISPC-ProgIII-Front.git
cd ISPC-ProgIII-Front
```

2. Entrar a la carpeta del frontend:
```bash
cd login-frontend
```

3. Instalar dependencias:
```bash
npm install
```

4. Iniciar servidor de desarrollo:
```bash
npm start
```

5. Abrir navegador en [http://localhost:4200/](http://localhost:4200/)

## Scripts Disponibles

```bash
npm start       # Inicia servidor de desarrollo
npm run build   # Compila para producción
npm run watch   # Compila en modo watch
npm test        # Ejecuta pruebas
```

## Autenticación

### Flujo de Login

1. Usuario ingresa credentials (username/password)
2. Frontend envía POST a `/api/login/`
3. Backend retorna JWT token
4. Frontend almacena token en localStorage
5. Token se envía automáticamente en headers de peticiones posteriores

### Seguridad

- Tokens almacenados en localStorage
- Interceptor HTTP para automatizar envío de tokens
- Protección de rutas para usuarios autenticados
- Logout limpia sesión completamente

## Documentación

Para documentación completa del proyecto, revisar [DOCUMENTACION.md](login-frontend/DOCUMENTACION.md)

Este archivo incluye:
- Estructura detallada del proyecto
- API de servicios y componentes
- Guía de desarrollo
- Endpoints del backend
- Solución de problemas
- Mejoras futuras

## Stack Tecnológico

- **Framework**: Angular 21
- **Lenguaje**: TypeScript 5.9
- **State Management**: RxJS
- **Formularios**: Reactive Forms
- **HTTP**: HttpClient con Interceptadores
- **Estilos**: CSS3 (Gradientes, Flexbox, Grid)

## Conexión con Backend

El frontend se conecta con el backend ISPC-PROGIII. URL configurada:

```
http://localhost:8000/api
```

### Endpoints Utilizados

- `POST /api/login/` - Autenticación de usuario

Para más detalles, ver [Endpoints del Backend](login-frontend/DOCUMENTACION.md#endpoints-del-backend)

## Desarrollo

### Agregar Nuevo Componente

```bash
ng generate component components/mi-componente
```

### Usar el AuthService

```typescript
import { AuthService } from '../services/auth.service';

export class MiComponente {
  private authService = inject(AuthService);
  usuario$ = this.authService.currentUser$;
}
```

### Estilos

- Paleta de colores: Indigo (primario) y Grays
- Responsive breakpoints: Mobile, Tablet, Desktop
- Ver [Estilos y Diseño](login-frontend/DOCUMENTACION.md#estilos-y-diseño) para detalles

## Despliegue

Para deployment en producción:

```bash
npm run build
```

Los archivos compilados estarán en `dist/login-frontend/`

Configurar tu servidor web para que rediriga todas las rutas a `index.html`

## Troubleshooting

### Problema: Página en blanco después de login
- Verificar que el token se guardó en localStorage
- Revisar que backend responda correctamente
- Abrir DevTools (F12) y revisar console

### Problema: CORS error
- El backend debe tener CORS habilitado para `http://localhost:4200`

### Problema: Conexión rechazada al backend
- Verificar que backend esté ejecutándose en puerto 8000
- Revisar la URL del API en `auth.service.ts`

Para más soluciones, ver [Solución de Problemas](login-frontend/DOCUMENTACION.md#solución-de-problemas)

## Recursos Útiles

- [Documentación Angular Oficial](https://angular.dev/)
- [Angular CLI](https://angular.dev/tools/cli)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama: `git checkout -b feature/tu-feature`
3. Hacer cambios y commits
4. Push: `git push origin feature/tu-feature`
5. Crear Pull Request

## Licencia

Proyecto educativo ISPC Programa III

## Información de Contacto

- Institución: Instituto Superior Politécnico Córdoba (ISPC)
- Cátedra: Programación III
- Año: 2026

---

**Última actualización**: Abril 14, 2026  
**Versión**: 1.0.0  
**Angular**: 21.2.0
