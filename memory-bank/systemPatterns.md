# System Patterns: FM4ALL Service Quotation Platform

## System Architecture

The FM4ALL platform appears to be built using a modern web application architecture with the following key components:

1. **Frontend Framework**

   - Next.js as the React framework
   - Server-side rendering and client-side hydration
   - App Router pattern with file-based routing

2. **Backend Services**

   - Server Actions for data mutations
   - API routes for external integrations
   - Sanity CMS for content management

3. **Data Management**

   - Drizzle ORM for database operations
   - Zod for schema validation and type safety
   - Context API for state management

4. **Real-time Features**
   - Pusher for real-time updates
   - Cache invalidation system for data freshness

## Key Technical Decisions

1. **Next.js App Router**

   - File-based routing system
   - Server components for improved performance
   - Internationalization through route parameters ([locale])

2. **State Management**

   - React Context API for global state
   - Provider pattern for service-specific state
   - Hooks for consuming and updating state

3. **Data Validation**

   - Zod schemas for runtime validation
   - TypeScript for static type checking
   - Schema-based form handling

4. **Styling Approach**

   - Tailwind CSS for utility-first styling
   - Component-based UI library
   - Responsive design patterns

5. **Data Fetching**
   - Server Actions for data mutations
   - Cache-first strategy with invalidation
   - Real-time updates for collaborative features

## Design Patterns in Use

1. **Provider Pattern**

   - Context providers for different service domains
   - Hierarchical state management
   - Example: `NettoyageProvider.tsx`, `HygieneProvider.tsx`

2. **Observer Pattern**

   - Cache invalidation listeners
   - Real-time data updates via Pusher
   - Example: `CacheInvalidationListener.tsx`

3. **Factory Pattern**

   - Service configuration factories
   - Dynamic form generation
   - Standardized data structures

4. **Repository Pattern**

   - Abstracted data access
   - Centralized data operations
   - Example: Actions files like `nettoyageTarifsAction.ts`

5. **Strategy Pattern**

   - Different pricing strategies
   - Service-specific calculation logic
   - Pluggable service modules

6. **Composite Pattern**
   - Building complex UIs from simpler components
   - Nested component hierarchies
   - Reusable UI building blocks

## Component Relationships

1. **Page Components**

   - Top-level components that represent routes
   - Compose multiple feature components
   - Handle page-level state and effects

2. **Feature Components**

   - Implement specific business features
   - Consume context from providers
   - Example: `NettoyagePropositions.tsx`

3. **UI Components**

   - Reusable, presentational components
   - Styled with Tailwind CSS
   - Located in `src/components/ui/`

4. **Provider Components**

   - Manage state for specific domains
   - Provide context to child components
   - Example: `NettoyageProvider.tsx`

5. **Hook Relationships**

   - Custom hooks consume context
   - Hooks provide reusable logic
   - Example: `use-nettoyage-tarifs-watcher.ts`

6. **Action Relationships**
   - Server actions called from components
   - Actions perform data mutations
   - Example: `nettoyageTarifsAction.ts`

## Critical Implementation Paths

1. **Quote Generation Flow**

   1. User inputs premises information
   2. Selects desired services
   3. Configures service details
   4. System calculates pricing
   5. Quote is generated and presented

2. **Cache Invalidation Flow**

   1. Data is updated via server action
   2. Cache invalidation event is triggered
   3. Pusher broadcasts the event
   4. Listeners receive the event
   5. Affected components re-render with fresh data

3. **Service Configuration Flow**

   1. User selects a service category
   2. Service-specific form is presented
   3. User configures service parameters
   4. Real-time pricing updates are shown
   5. Configuration is saved to quote

4. **Internationalization Flow**
   1. User's locale is detected or selected
   2. Appropriate translations are loaded
   3. UI renders in the selected language
   4. Routes include locale parameter
   5. Content is displayed in the correct language

This document will be updated as more patterns are discovered or implemented in the system.
