# Contexto y Configuración Base - ERP Luu

## Entorno de Desarrollo
* **Gestor de paquetes:** `pnpm`
* **Framework:** Angular 20+ (Standalone & Zoneless)
* **Librería UI:** PrimeNG 21+ (con PrimeUIX)

## Aprendizajes Clave de Configuración

### 1. Angular 20 es "Zoneless" por defecto
Al crear un proyecto nuevo con Angular 20, este ya no incluye ni instala la librería `zone.js`. 
* **El problema:** Si se intenta configurar la aplicación con `provideZoneChangeDetection()`, la app colapsará en el navegador mostrando una pantalla completamente en blanco y un error `NG0908` en la consola.
* **La solución:** Se debe utilizar obligatoriamente `provideZonelessChangeDetection()` en el archivo `app.config.ts`.

### 2. El nuevo motor de Temas de PrimeNG
A partir de las versiones recientes (18+), PrimeNG eliminó los archivos CSS estáticos para los temas.
* **El problema:** Importar rutas como `@import "primeng/resources/themes/lara-light-blue/theme.css";` en el archivo `styles.css` lanzará errores de compilación indicando que el módulo no existe.
* **La solución:** 1. Instalar el paquete independiente de temas: `pnpm add @primeuix/themes`.
    2. Configurar el tema a nivel de inyección de dependencias en `app.config.ts` usando `providePrimeNG({ theme: { preset: Lara } })`.

### 3. Animaciones en PrimeNG
Aunque el IDE pueda marcar `provideAnimationsAsync()` como obsoleto (deprecated) debido a la transición de Angular hacia animaciones CSS nativas, **PrimeNG lo sigue necesitando** para que funcionen sus efectos visuales internos (como el efecto *ripple* al hacer clic en un botón). Debe mantenerse en los `providers` de `app.config.ts`.

### 4. Componentes Standalone (Independientes)
Dado que Angular ahora utiliza componentes *standalone*, el HTML no reconocerá ninguna etiqueta de PrimeNG (como `<p-button>`) mágicamente.
* **La regla de oro:** Por cada componente de PrimeNG que se use en la vista (`app.html`), se debe importar explícitamente su módulo correspondiente (ej. `ButtonModule`) en el arreglo `imports: []` del archivo TypeScript del componente (`app.ts`). De lo contrario, el compilador lanzará el error `NG8001: is not a known element`.

## Archivo Base de Configuración (`src/app/app.config.ts`)
Para referencia rápida, así debe lucir un arranque limpio:

\`\`\`typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: { preset: Lara }
    })
  ]
};
\`\`\`