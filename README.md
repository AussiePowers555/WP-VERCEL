# WhitePointer Motorcycle Rental Management System

A full-stack web application for managing motorcycle rental cases, fleet, contacts, and interactions.

## Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Express.js REST API
- **Database**: PostgreSQL
- **Deployment**: Replit (FULLSTACK_JS)

## Features

- Case management for motorcycle rental claims
- Fleet management for rental motorcycles
- Contact management for lawyers and rental companies
- User authentication and authorization
- Digital signature collection
- Interaction tracking
- Dashboard with analytics

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Replit account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run setup
   ```

3. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
   - Update the database connection string and other settings

4. Start the development servers:
   ```bash
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
NODE_ENV=development
```

## Deployment on Replit

1. Create a new Replit project with the FULLSTACK_JS template
2. Upload your code to the Replit project
3. Set up environment variables in Replit Secrets:
   - `DATABASE_URL`: Your Replit PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: `production`
4. Click "Run" to start the application

The application will be available at your Replit URL.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/set-password` - Set initial password

### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get case by ID
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Fleet
- `GET /api/bikes` - Get all bikes
- `POST /api/bikes` - Add new bike
- `PUT /api/bikes/:id` - Update bike
- `DELETE /api/bikes/:id` - Delete bike

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact

### Other endpoints available for workspaces, users, interactions, signatures, and documents.

## Database Schema

The application uses PostgreSQL with the following main tables:
- `cases` - Motorcycle rental cases
- `contacts` - Lawyers, rental companies, etc.
- `workspaces` - Client workspaces
- `user_accounts` - System users
- `bikes` - Rental motorcycle fleet
- `signature_tokens` - Digital signature tracking
- `case_interactions` - Communication logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.