# Active Context: FM4ALL Service Quotation Platform

## Current Work Focus

The current development focus is on enhancing the pricing and quotation system, with particular emphasis on:

1. **Cache Invalidation System**

   - Implementing real-time updates for pricing data using Pusher
   - Ensuring consistent data across user sessions with debouncing and event tracking
   - Creating service-specific context updaters (e.g., `use-nettoyage-context-updater.ts`)
   - Handling complex cache invalidation scenarios with proper error management

2. **Tarifs Update Forms**

   - Building supplier-facing forms for updating service pricing (`HygieneTarifsDistribUpdateForm.tsx`, `VitrerieTarifsUpdateForm.tsx`)
   - Implementing validation and error handling for pricing updates
   - Managing UI state for modified tarifs with visual indicators
   - Supporting internationalization in the forms

3. **Real-time Quote Recalculation**

   - Implementing service-specific pricing calculations based on updated tarifs
   - Ensuring quotes reflect the latest pricing data through cache invalidation
   - Providing user notifications when prices are updated
   - Handling edge cases like partial updates and validation failures

4. **Quote Reset Functionality**
   - Implementing mechanisms to reset or reinitialize quotes (`reinitialisationDevis.ts`, `fullReinitialisationDevis.tsx`)
   - Handling partial and full quote resets
   - Ensuring proper state management during resets
   - Maintaining data consistency across multiple service contexts

## Recent Changes

Based on the open files and code examination, recent work includes:

1. **Enhanced Cache Invalidation System**

   - Improved `CacheInvalidationListener.tsx` with debouncing and duplicate event prevention
   - Added service-specific data handling in cache invalidation events
   - Implemented `use-nettoyage-context-updater.ts` for targeted context updates
   - Added detailed logging for cache invalidation events

2. **Tarifs Update Forms Refinement**

   - Enhanced UI for tarifs update forms with visual indicators for modified fields
   - Added validation to prevent saving invalid pricing data
   - Implemented optimistic UI updates with confirmation toasts
   - Added sorting and categorization of tarifs in the forms

3. **Pricing Action Improvements**

   - Updated server actions (`nettoyageTarifsAction.ts`, `vitrerieTarifsAction.ts`, `hygieneTarifsAction.ts`) with better validation
   - Added data transformation for proper storage and retrieval
   - Implemented cache invalidation with detailed data payloads
   - Enhanced error handling and user feedback

4. **Context Management Optimization**
   - Refined state management in service providers (e.g., `NettoyageProvider.tsx`)
   - Improved localStorage persistence for quote data
   - Enhanced initialization logic for service contexts
   - Added conditional rendering for client-side components

## Next Steps

Based on the current work focus, potential next steps include:

1. **Complete Cache Invalidation System**

   - Extend the context updater pattern to other services beyond nettoyage
   - Implement more sophisticated event filtering and prioritization
   - Add offline support with queue management
   - Enhance performance monitoring for real-time updates

2. **Expand Tarifs Management**

   - Create additional tarifs update forms for remaining services
   - Implement bulk update functionality for pricing data
   - Add historical pricing data and trend visualization
   - Implement approval workflows for significant price changes

3. **Quote Calculation Enhancements**

   - Optimize performance of complex pricing calculations
   - Add more detailed breakdown of pricing components
   - Implement comparison features between different service options
   - Add what-if scenarios for quote customization

4. **Testing and Optimization**
   - Perform end-to-end testing of the quotation flow with real-time updates
   - Optimize performance of cache invalidation system
   - Conduct load testing for concurrent pricing updates
   - Implement automated tests for pricing calculations

## Active Decisions and Considerations

Current technical and product decisions being considered:

1. **Cache Strategy Refinement**

   - How to handle high-frequency cache invalidation events
   - When to use targeted context updates vs. full page refreshes
   - How to balance client-side caching with data freshness
   - Strategies for handling network failures during cache invalidation

2. **State Management Approach**

   - Evaluating the granularity of context providers
   - Considering performance implications of large state objects
   - Managing interdependencies between different service states
   - Exploring alternatives to context for specific use cases

3. **User Experience for Price Changes**

   - How to notify users of price changes during quote creation
   - When to automatically recalculate quotes vs. requiring user action
   - How to present pricing history and changes
   - Balancing transparency with simplicity in price presentation

4. **Performance Considerations**
   - Optimizing real-time updates without excessive re-renders
   - Managing large state objects efficiently
   - Ensuring responsive UI during complex calculations
   - Handling concurrent updates from multiple suppliers

## Important Patterns and Preferences

Based on the observed code structure and implementation:

1. **File Organization**

   - Feature-based organization within the app directory
   - Service-specific components in dedicated directories
   - Separation of desktop and mobile components
   - Clear separation of actions, components, and hooks

2. **Naming Conventions**

   - PascalCase for React components and TypeScript types
   - camelCase for functions, variables, and files
   - French terms for domain-specific concepts (e.g., "devis" for quote, "nettoyage" for cleaning)
   - Descriptive, domain-specific naming

3. **State Management**

   - React Context for global and domain-specific state
   - Custom hooks for consuming and updating state
   - Server Actions for data mutations
   - Local storage for persistence between sessions

4. **Component Structure**
   - Separation of form and display components
   - Feature-specific components organized by service type
   - Reusable UI components in dedicated directories
   - Clear separation of concerns between components

## Learnings and Project Insights

Key insights from the current development work:

1. **Real-time Data Challenges**

   - Managing cache invalidation across multiple services requires careful coordination
   - Debouncing and event deduplication are essential for stable real-time updates
   - Balancing immediate updates with system stability is an ongoing challenge
   - Providing clear user feedback for background updates improves user experience

2. **Complex State Management**

   - Service-specific context updaters improve maintainability
   - Targeted state updates perform better than full context replacements
   - Local storage persistence requires careful synchronization
   - Clear separation of concerns in state management simplifies debugging

3. **Form Management Complexity**

   - Visual indicators for modified fields improve user experience
   - Validation at both client and server sides ensures data integrity
   - Optimistic UI updates with proper error handling improve perceived performance
   - Sorting and categorization of form data improves usability

4. **Pricing Logic Complexity**
   - Service pricing involves multiple variables and conditions
   - Real-time pricing updates need to be efficient and accurate
   - Zod schemas help ensure data integrity for pricing calculations
   - Proper transformation between display and storage formats is essential

This document will be updated as the active context evolves with ongoing development work.
