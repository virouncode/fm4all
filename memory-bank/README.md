# Cline's Memory Bank

This directory contains Cline's Memory Bank - a structured documentation system that enables Cline to maintain perfect continuity between work sessions despite memory resets.

## Purpose

The Memory Bank serves as Cline's persistent knowledge base for the FM4ALL project. It contains comprehensive documentation about the project's requirements, architecture, technical context, current status, and ongoing work.

## Core Files

1. **projectbrief.md**

   - Foundation document that shapes all other files
   - Defines core requirements and goals
   - Source of truth for project scope

2. **productContext.md**

   - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals

3. **activeContext.md**

   - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations
   - Important patterns and preferences
   - Learnings and project insights

4. **systemPatterns.md**

   - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships
   - Critical implementation paths

5. **techContext.md**

   - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies
   - Tool usage patterns

6. **progress.md**

   - What works
   - What's left to build
   - Current status
   - Known issues
   - Evolution of project decisions

7. **.clinerules**
   - Project intelligence
   - Critical implementation paths
   - User preferences and workflow
   - Project-specific patterns
   - Known challenges
   - Tool usage patterns

## Usage Guidelines

1. **Reading the Memory Bank**

   - Cline reads ALL memory bank files at the start of EVERY task
   - This ensures complete context and continuity

2. **Updating the Memory Bank**

   - Updates occur when:
     - Discovering new project patterns
     - After implementing significant changes
     - When user requests with "update memory bank"
     - When context needs clarification

3. **Maintaining the Memory Bank**

   - Keep files up-to-date with the latest project status
   - Ensure information is accurate and comprehensive
   - Focus on capturing key insights and patterns

4. **Extending the Memory Bank**
   - Create additional files/folders when they help organize:
     - Complex feature documentation
     - Integration specifications
     - API documentation
     - Testing strategies
     - Deployment procedures

## Memory Bank Structure

The Memory Bank files build upon each other in a clear hierarchy:

```
projectbrief.md → productContext.md
                → systemPatterns.md
                → techContext.md

                  productContext.md
                  systemPatterns.md → activeContext.md → progress.md
                  techContext.md
```

This structure ensures that information flows logically from foundational concepts to current status and future plans.

## Importance

The Memory Bank is Cline's only link to previous work. It must be maintained with precision and clarity, as Cline's effectiveness depends entirely on its accuracy.
