# CifraTrack

CifraTrack es una aplicación moderna de seguimiento de finanzas personales y portafolio de inversiones, construida con las últimas tecnologías del ecosistema React y Next.js, enfocada en la robustez, tipado estricto y mantenibilidad.

## 🛠 Tecnologías

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (Strict Mode)
- **Base de Datos:** PostgreSQL
- **ORM:** Drizzle ORM
- **Autenticación:** NextAuth.js v5 (Auth.js)
- **Estado del Servidor:** TanStack Query
- **UI:** React 19, Tailwind CSS, Shadcn UI
- **Formularios:** React Hook Form + Zod

## 🏗 Arquitectura y Patrones

El proyecto sigue una **Clean Architecture** (Arquitectura Limpia) y principios DDD (Domain-Driven Design), adaptados a un entorno moderno de Next.js. El objetivo es desacoplar la lógica de negocio de la infraestructura y el framework.

### Estratificación Estricta (Strict Layering)

1.  **UI (React Components):**
    - Capa de presentación.
    - Interactúa con la aplicación solo a través de **Custom Hooks** que envuelven TanStack Query.
    - **Regla:** Nunca importa la base de datos ni realiza lógica compleja.
2.  **API Routes (Next.js App Router):**
    - Puntos de entrada de la aplicación (`app/api/**`).
    - **Responsabilidad:** Validar Request -> Ejecutar UseCase -> Mapear Resultado a DTO -> Retornar JSON.
3.  **UseCases (`src/features/**/usecases`):\*\*
    - Contienen la **lógica de negocio pura** de la aplicación.
    - Orquestan las operaciones, validan reglas de negocio y llaman a los repositorios.
    - **Regla:** Retornan _Entidades de Dominio_, nunca objetos directos de la base de datos.
4.  **Repositories (`src/features/**/repo.impl.ts`):\*\*
    - Implementaciones concretas de las interfaces de dominio.
    - Encapsulan el acceso a datos (Drizzle ORM).
    - **Responsabilidad:** Mapear de Rows (BD) a Entidades (Dominio) y viceversa.
5.  **Domain Entities (`src/entities/**/model/\*.entity.ts`):\*\*
    - Corazón de la aplicación.
    - Clases puras de TypeScript que encapsulan datos y comportamiento.
    - Validan su propia integridad en el constructor.

### Flujo de Datos

El flujo es unidireccional y predecible:

`Request UI -> API Route -> UseCase -> Repository -> DB -> Repository (Mapper a Dominio) -> UseCase -> API Route (Mapper a DTO) -> Response UI`

### Estructura del Proyecto

El código fuente está organizado por funcionalidades (**Feature-Based**) en lugar de por tipo de archivo:

- **`src/features/[feature]/`**: Contiene todo el código vertical de una funcionalidad (API handlers, Hooks, Componentes UI específicos, UseCases, Implementación de Repositorios).
- **`src/entities/[entity]/`**: Definiciones de alto nivel, Modelos de Dominio e Interfaces de Repositorios ("Contratos").
- **`src/shared/`**: Utilidades, componentes UI genéricos, configuración de DB y librerías compartidas.
- **`app/`**: Estructura de rutas de Next.js. Los archivos `route.ts` son controladores delgados.

## 📦 Módulos y Funcionalidades

El sistema está compuesto por los siguientes módulos principales:

- **🔐 Auth (`features/auth`)**:
  - Sistema completo de gestión de identidad.
  - Registro e inicio de sesión seguro.
  - Protección de rutas y gestión de sesiones.
- **📂 Categories (`features/categories`)**:
  - Organización jerárquica de ingresos y gastos.
  - Personalización de categorías para el usuario.
- **📊 Dashboard (`features/dashboard`)**:
  - Panel de control principal.
  - Visualización de métricas clave, resúmenes de saldo y gráficos de evolución patrimonial.
- **📈 Investments (`features/investments`)**:
  - Gestión avanzada de portafolio.
  - Registro de activos, cálculo de rendimientos y seguimiento de valor actual.
- **🪙 Market Data (`features/market-data`)**:
  - Módulo simplificado para obtener tasas de rendimiento en vivo desde APIs externas.
  - Provee datos actualizados de TNA para inversiones sin persistir historial.
  - Configuración centralizada de proveedores financieros (Mercado Pago, Ualá, etc.).
- **💳 Payment Methods (`features/payment-methods`)**:
  - Administración de fuentes de dinero.
  - Soporte para Tarjetas de Crédito, Efectivo, Cuentas Bancarias y Monederos Digitales.
- **👤 Profile (`features/profile`)**:
  - Configuración de usuario.
  - Gestión de preferencias y seguridad de la cuenta.
- **🔄 Recurring (`features/recurring`)**:
  - Motor de automatización financiera.
  - Gestión de reglas para transacciones que se repiten (suscripciones, alquileres, salarios).
- **💸 Transactions (`features/transactions`)**:
  - El núcleo contable del sistema.
  - Registro detallado de cada movimiento financiero con soporte para múltiples monedas y conversiones.

## 🚀 Cómo Iniciar

### Prerrequisitos

- Node.js 20+
- pnpm

### Instalación

```bash
pnpm install
```

### Comandos Principales

#### Desarrollo

Inicia el servidor de desarrollo en `http://localhost:3000`.

```bash
pnpm dev
```

#### Base de Datos

Generar archivos SQL basados en cambios del esquema (`src/shared/db/schema.ts`):

```bash
pnpm db:generate
```

Aplicar cambios a la base de datos:

```bash
pnpm db:migrate
```

Visualizar y gestionar la base de datos con Drizzle Studio:

```bash
pnpm db:studio
```

#### Calidad de Código

Ejecutar chequeo de tipos de TypeScript:

```bash
pnpm typecheck
```
