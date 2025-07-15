# Queue Management System

## Overview

This is a full-stack queue management system built for managing ticket queues across multiple rooms (1-10). The application consists of three main interfaces:
- **Password Generator**: For customers to generate queue tickets
- **Professional Dashboard**: For staff to manage and call tickets
- **TV Display**: For public display of current calls and queue status

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- Added green header with SEPEM branding (2025-01-15)
- Added footer with developer credits (2025-01-15)
- Integrated SEPEM logo across all layouts (2025-01-15)
- System ready for deployment with fixed access link (2025-01-15)

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Real-time Updates**: WebSocket integration for live queue updates

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful APIs with WebSocket support
- **Development**: Vite for development server and hot reload

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured via Neon serverless)
- **In-Memory Fallback**: MemStorage class for development/testing
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Database Schema
- **queue_tickets**: Stores individual tickets with room assignment, status, and timestamps
- **rooms**: Manages room configuration and current ticket assignments

### Core Features
1. **Ticket Generation**: Customers can select a room and generate sequential tickets
2. **Queue Management**: Staff can call next tickets and mark them as completed
3. **Real-time Updates**: All interfaces update live via WebSocket connections
4. **Audio Notifications**: Text-to-speech announcements and sound alerts
5. **Multi-room Support**: Handles up to 10 concurrent rooms

### UI Components
- Responsive design with mobile support
- Room selection grid with visual feedback
- Queue display with position indicators
- Professional dashboard with room switching
- Large-screen TV display for public viewing

## Data Flow

1. **Ticket Generation**:
   - Customer selects room → API generates ticket → WebSocket broadcasts update
   
2. **Ticket Calling**:
   - Staff calls next ticket → API updates status → WebSocket notifies all clients → Audio announcement plays
   
3. **Real-time Synchronization**:
   - WebSocket connection maintains live queue state across all connected clients
   - Automatic reconnection on connection loss

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **date-fns**: Date/time formatting utilities

### Development Tools
- **Vite**: Build tool and development server
- **esbuild**: Production bundling
- **tsx**: TypeScript execution for development

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **lucide-react**: Icon library

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations applied via `db:push`

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)

### Production Setup
- Express serves static files from build output
- WebSocket server runs alongside HTTP server
- Database migrations must be applied before startup

### Development Workflow
- Hot reload via Vite development server
- TypeScript compilation checking
- In-memory storage fallback for quick prototyping