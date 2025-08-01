# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Commands
- `npm run setup` - Install all dependencies and copy environment files
- `npm run dev` - Start both frontend and backend development servers concurrently
- `npm run build` - Build the frontend for production
- `npm run start` - Start both production servers

### Backend Development  
- `cd backend && npm run dev` - Start backend dev server with nodemon
- `cd backend && npm start` - Start backend production server
- `cd backend && npm test` - Run backend tests (not implemented yet)

### Frontend Development
- `cd frontend && npm run dev` - Start React development server
- `cd frontend && npm run build` - Build React app for production
- `cd frontend && npm test` - Run React tests
- `cd frontend && npm start` - Serve built app locally

## Architecture Overview

### Technology Stack
- **Frontend**: React.js 18 with functional components and hooks
- **Backend**: Express.js REST API with middleware stack
- **Database**: PostgreSQL with connection pooling
- **UI**: Tailwind CSS with Radix UI components
- **Authentication**: JWT tokens with localStorage persistence
- **Deployment**: Netlify (frontend) + backend services

### Project Structure
This is a monorepo with separate frontend and backend directories:
```
├── frontend/          # React.js application
├── backend/           # Express.js API server
├── package.json       # Root orchestration scripts
└── README.md          # Deployment and setup instructions
```

### Database Architecture
The application uses PostgreSQL with these core tables:
- `cases` - Main motorcycle rental case records with client/at-fault party details
- `contacts` - Lawyers and rental companies with relationship management
- `workspaces` - Client workspace organization
- `bikes` - Fleet management with status tracking
- `signature_tokens` - Digital signature workflow management
- `case_interactions` - Communication and action logging
- `user_accounts` - System user authentication and roles

Database initialization is handled automatically by `backend/lib/database.js` with schema creation and data seeding.

### Authentication System  
- JWT-based authentication with localStorage persistence
- Context-based auth state management in `frontend/src/context/AuthContext.js`
- Protected routes with automatic redirects
- User roles and permissions (admin, user, etc.)

### Key Architectural Patterns
- **Frontend**: Context + hooks for state management, protected routing, component composition
- **Backend**: Express middleware stack, service-oriented architecture in routes, database connection pooling
- **API**: RESTful design with consistent error handling and response formats
- **Security**: CORS, helmet, input validation, JWT tokens, SQL injection prevention

### Database Service Layer
`backend/lib/database.js` provides:
- Connection pooling and health monitoring
- Auto-initialization with schema creation
- Comprehensive service methods for all entities
- Transaction support and error handling
- Data seeding for development environments

### Component Architecture
- Radix UI + Tailwind for consistent design system
- Form handling with react-hook-form and zod validation  
- Digital signature collection with react-signature-canvas
- Image upload and document management
- Responsive design with mobile support

### API Endpoints Structure
Routes are organized by entity in `backend/routes/`:
- `/api/auth/*` - Authentication and user management
- `/api/cases/*` - Case CRUD and search operations
- `/api/contacts/*` - Contact management
- `/api/bikes/*` - Fleet management  
- `/api/workspaces/*` - Workspace organization
- `/api/signature/*` - Digital signature workflows
- `/api/documents/*` - Document management
- `/api/interactions/*` - Communication logging

### Environment Configuration
Backend requires: `DATABASE_URL`, `PORT`, `JWT_SECRET`, `FRONTEND_URL`
Frontend requires: `REACT_APP_API_URL`

Copy `.env.example` files and configure database connections and JWT secrets before development.