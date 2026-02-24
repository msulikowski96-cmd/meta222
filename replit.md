# Metabolic Health App

A React + TypeScript + Vite frontend application for tracking metabolic health, macros, measurements, and health goals.

## Architecture

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + Radix UI components
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **State**: Custom hooks (no external state manager)

## Project Structure

```
src/
  components/       # UI components (MacroPlanner, MeasurementHistory, etc.)
  components/ui/    # Radix-based shadcn/ui primitives
  hooks/            # Custom React hooks for business logic
  types/            # TypeScript type definitions
  lib/              # Utility functions
```

## Key Features

- User data form for profile setup
- Metabolic calculations (BMR, TDEE, etc.)
- Macro planning
- Measurement history tracking
- Results dashboard with charts
- Health goal recommendations

## Development

```bash
npm run dev    # Start dev server at http://0.0.0.0:5000
npm run build  # Build to dist/
```

## Replit Configuration

- Frontend runs on port 5000 with `host: 0.0.0.0` and `allowedHosts: true`
- Deployed as a static site (build output: `dist/`)
