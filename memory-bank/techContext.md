# Technical Context: FM4ALL Service Quotation Platform

## Technologies Used

### Frontend

- **Next.js**: React framework for server-rendered applications
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library based on Radix UI

### Backend

- **Next.js API Routes**: Serverless functions for API endpoints
- **Server Actions**: Next.js feature for server-side mutations
- **Drizzle ORM**: TypeScript ORM for SQL databases
- **Sanity CMS**: Headless content management system
- **Pusher**: Real-time websocket communication

### Data Validation & Type Safety

- **Zod**: Schema validation library
- **TypeScript**: Static type checking

### Internationalization

- **next-intl**: Internationalization library for Next.js
- **Message files**: JSON-based translation files

### Authentication

- **NextAuth.js**: Authentication solution for Next.js
- **JWT**: JSON Web Tokens for session management

### Build & Development

- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: JavaScript linting utility
- **Prettier**: Code formatter
- **PostCSS**: Tool for transforming CSS with JavaScript

## Development Setup

### Environment

- **Node.js**: JavaScript runtime
- **TypeScript**: Programming language
- **pnpm**: Package manager
- **Next.js development server**: Local development environment

### Configuration Files

- **next.config.ts**: Next.js configuration
- **tailwind.config.ts**: Tailwind CSS configuration
- **tsconfig.json**: TypeScript configuration
- **drizzle.config.ts**: Drizzle ORM configuration
- **eslint.config.mjs**: ESLint configuration
- **postcss.config.mjs**: PostCSS configuration

### Environment Variables

- **.env.local**: Local environment variables
- **.env.development.local**: Development-specific environment variables

## Technical Constraints

### Performance

- **Server-side Rendering**: Critical for SEO and initial load performance
- **Client-side Hydration**: For interactive components
- **Optimized Assets**: For fast page loads
- **Efficient State Management**: To prevent unnecessary re-renders

### Scalability

- **Component-based Architecture**: For maintainability and reusability
- **Modular Design**: Service modules can be added/removed independently
- **Stateless Components**: Where possible for better performance

### Security

- **Input Validation**: Using Zod schemas
- **Authentication**: Secure user authentication
- **Authorization**: Role-based access control
- **Data Protection**: Secure handling of user data

### Accessibility

- **WCAG Compliance**: Web Content Accessibility Guidelines
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML and ARIA attributes

### Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Progressive Enhancement**: Core functionality works in all browsers
- **Responsive Design**: Works on all device sizes

## Dependencies

### Core Dependencies

- **next**: React framework
- **react**: UI library
- **react-dom**: DOM-specific methods for React
- **typescript**: TypeScript language
- **tailwindcss**: CSS framework
- **drizzle-orm**: Database ORM
- **zod**: Schema validation
- **pusher**: Real-time updates
- **pusher-js**: Pusher client
- **next-intl**: Internationalization
- **sanity**: Content management

### Development Dependencies

- **eslint**: Code linting
- **prettier**: Code formatting
- **postcss**: CSS processing
- **autoprefixer**: CSS vendor prefixing
- **@types/react**: TypeScript types for React
- **@types/node**: TypeScript types for Node.js

## Tool Usage Patterns

### Data Fetching

- Server Actions for data mutations
- Server Components for initial data loading
- Client Components for interactive UI elements
- Cache-first strategy with invalidation

### State Management

- React Context for global state
- Provider pattern for service-specific state
- Custom hooks for consuming state
- Pusher for real-time updates

### Form Handling

- Controlled components
- Zod schema validation
- Error handling and display
- Real-time validation feedback

### Styling

- Tailwind CSS utility classes
- Component-based styling
- Responsive design patterns
- Theme customization

### Testing

- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for critical flows
- End-to-end tests for user journeys

This document will be updated as the technical context evolves or new technologies are introduced to the project.
