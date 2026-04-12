# ERP-Luu

Un sistema Enterprise Resource Planning (ERP) moderno, modular y reactivo construido con Angular 18+ y PrimeNG.

## Visión del Proyecto

El objetivo de **ERP-Luu** es proveer una plataforma robusta, segura y fácil de usar para la gestión integral de recursos empresariales. Actualmente se encuentra en su fase inicial de frontend, implementando principios de diseño moderno y estado reactivo basado en Angular Signals.

Este proyecto ha sido diseñado con una clara **separación de responsabilidades** (capas de abstracción y repositorios), permitiendo que la persistencia en memoria actual (mock data) sea fácilmente reemplazable por un backend real escrito en Go en futuras versiones, sin necesidad de reescribir la lógica de la UI ni los servicios de estado.

## Características Actuales

- **Autenticación:** Flujo de login y registro de usuarios, completamente desacoplado del almacén seguro (las contraseñas nunca viajan ni se almacenan en los modelos del frontend).
- **Control de Acceso:** Rutas protegidas mediante `AuthGuard` para evitar accesos no autorizados.
- **Gestión de Roles y Permisos:** Administración centralizada de usuarios, grupos y sus respectivos niveles de permisos.
- **Módulo de Tickets:** Sistema tipo Kanban para la gestión, priorización y control del estado de los tickets, con asignación automatizada entre grupos.

## Estructura de Abstracción

El repositorio está preparado para conexión B2B o API RESTFUL con los siguientes repositorios listos para conectar vía inyección de dependencias (`src/app/infrastructure/repositories`):
- `UserRepository`
- `AuthRepository`
- `TicketRepository`
- `GroupRepository`

## Requisitos Previos

- [Node.js](https://nodejs.org/) (Versión 18 o superior)
- Angular CLI (`npm install -g @angular/cli`)

## Instalación y Uso

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Levantar el servidor de desarrollo:
   ```bash
   ng serve
   ```
4. Abrir en el navegador: [http://localhost:4200/](http://localhost:4200/)

## Información de Testing (Mock Data)
Para ingresar al sistema puede utilizar localmente el usuario administrador temporal:
* **Email:** `admin@erp.com`
* **Contraseña:** `admin123`
