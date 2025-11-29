# Elite Hub - Premium Restaurant Reservation Platform

## Overview

Elite Hub is a full-stack restaurant reservation and management platform that connects diners with premium dining establishments. The application serves three distinct user roles: customers who can browse and book reservations, restaurant owners who can manage their establishments and menus, and administrators who oversee the platform.

Built with a modern TypeScript stack, the application features a React frontend with Vite, an Express backend, and uses Drizzle ORM with PostgreSQL (via Neon serverless) for data persistence. The UI is built with shadcn/ui components styled with Tailwind CSS, featuring a luxury aesthetic with custom fonts (Playfair Display for headings, DM Sans for body text).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for hot module replacement
- Wouter for lightweight client-side routing instead of React Router
- Port 5000 for development server

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- React Context API for authentication state via custom `AuthProvider`
- Session-based authentication with cookies (no JWT tokens in localStorage)

**UI Framework**
- shadcn/ui component library based on Radix UI primitives
- Tailwind CSS v4 (using `@import` syntax) with custom design tokens
- Custom color system using CSS variables for theme consistency
- Framer Motion for animations and transitions
- Responsive design with mobile-first approach

**Component Architecture**
- Layout components: `CustomerLayout` (public-facing), `DashboardLayout` (admin/owner interfaces)
- Page-level components in `client/src/pages/` for each route
- Reusable UI components in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/` for shared logic

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the REST API
- HTTP server created via Node's `http.createServer()` to support potential WebSocket upgrades
- Middleware: express-session with MemoryStore for session management, express.json for parsing
- Session configuration supports both development (insecure cookies) and production (secure, httpOnly cookies)

**API Design**
- RESTful endpoints organized in `server/routes.ts`
- Route groups: `/api/auth/*` (authentication), `/api/restaurants/*`, `/api/reservations/*`, `/api/orders/*`
- Role-based access control through session middleware checking `req.session.userRole`
- Zod schemas for request validation from `@shared/schema`

**Authentication & Authorization**
- bcrypt for password hashing (10 rounds)
- Session-based authentication with express-session
- Three user roles: `customer`, `restaurant_owner`, `admin`
- Role verification happens at route level, with different dashboard views per role

**Data Access Layer**
- Storage abstraction via `IStorage` interface in `server/storage.ts`
- Repository pattern separating business logic from data access
- All database operations centralized in storage layer
- Support for complex queries with filters (userId, restaurantId, etc.)

### Database Schema

**ORM & Database**
- Drizzle ORM for type-safe database queries and schema management
- PostgreSQL via Neon serverless (WebSocket connections using `ws` library)
- Connection pooling with `@neondatabase/serverless`
- Schema defined in `shared/schema.ts` (shared between client and server)

**Core Tables**
- `users`: Authentication, profile data, role-based access
- `restaurants`: Restaurant details, owner relationship, approval status
- `menu_items`: Restaurant menu with pricing, categories, availability
- `reservations`: Booking system with status tracking (pending, confirmed, cancelled, completed)
- `orders`: Order management with status workflow (pending, preparing, ready, served, cancelled)
- `order_items`: Line items linking orders to menu items
- `favorites`: User-restaurant favorites (many-to-many relationship)

**Enums**
- `user_role`: customer, restaurant_owner, admin
- `reservation_status`: pending, confirmed, cancelled, completed
- `order_status`: pending, preparing, ready, served, cancelled
- `restaurant_status`: pending, active, suspended

**Schema Features**
- UUID primary keys using `gen_random_uuid()`
- Timestamps with `defaultNow()` for audit trails
- Decimal types for monetary values (10,2 precision)
- Foreign key relationships with proper cascading
- Zod validation schemas generated via `drizzle-zod`

### Build & Deployment

**Development**
- Separate dev scripts: `dev:client` (Vite), `dev` (Express with tsx)
- Vite dev server proxies API requests to Express backend
- Custom Vite plugins: runtime error overlay, meta image updates, Replit integrations
- Source maps enabled via `@jridgewell/trace-mapping`

**Production Build**
- Custom build script (`script/build.ts`) using esbuild and Vite
- Client built to `dist/public` via Vite
- Server bundled to single `dist/index.cjs` file via esbuild
- Selective bundling: common dependencies bundled, native modules external
- Static file serving from built client in production

**Asset Management**
- Assets stored in `attached_assets/` directory
- Vite alias `@assets` for importing generated images
- Custom Vite plugin for updating OpenGraph meta tags with deployment URLs
- Public assets served from `client/public/`

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Primary database with WebSocket support
- Connection string via `DATABASE_URL` environment variable
- Drizzle migrations stored in `migrations/` directory
- Database provisioning required before first run

### Authentication & Security
- **express-session**: Session management with MemoryStore (development) or connect-pg-simple (production option)
- **bcrypt**: Password hashing with configurable rounds
- Session secret via `SESSION_SECRET` environment variable (required for production)

### UI Component Libraries
- **Radix UI**: Headless accessible component primitives (@radix-ui/react-*)
- **Lucide React**: Icon library for consistent iconography
- **cmdk**: Command palette component
- **vaul**: Drawer component primitive
- **input-otp**: OTP input component
- **embla-carousel-react**: Carousel functionality

### Styling & Animation
- **Tailwind CSS v4**: Utility-first CSS framework
- **tailwindcss-animate**: Animation utilities
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional className utilities
- **Framer Motion**: Animation and gesture library

### Form Management
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Zod resolver for schema validation
- **zod**: Schema validation for forms and API requests
- **date-fns**: Date formatting and manipulation

### Development Tools
- **Vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **TypeScript**: Type safety across the stack
- **Replit Vite Plugins**: Cartographer, dev banner, runtime error modal (development only)

### Potential Future Integrations
The codebase includes import structures suggesting planned integrations with:
- Payment processing (Stripe)
- Email services (Nodemailer)
- File uploads (Multer)
- AI features (OpenAI, Google Generative AI)
- WebSocket real-time features (ws)
- Spreadsheet exports (xlsx)