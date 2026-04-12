# Random User Generator

A RESTful API server built with TypeScript and Node.js that generates and manages random user profiles with database persistence.

## Features

- **Random User Generation** - Generate random user profiles with realistic data
- **User Management** - Create, read, and manage user profiles
- **Database Support** - SQLite database with migrations and seeding
- **API Documentation** - Swagger/OpenAPI documentation
- **Rate Limiting** - Built-in rate limiting middleware
- **Error Handling** - Comprehensive error handling and logging
- **Request Logging** - Track all incoming requests
- **Health Checks** - Monitor server health status

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite
- **Documentation**: Swagger/OpenAPI
- **Templating**: EJS

## Project Structure

```
├── controllers/          # Request handlers
├── services/           # Business logic
├── routes/             # API route definitions
├── middleware/         # Custom middleware
├── database/           # Database configuration and models
├── migrations/         # Database migration files
├── errors/             # Custom error classes
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── views/              # EJS templates
├── config.ts           # Configuration settings
├── server.ts           # Server entry point
└── app.ts              # Express application setup
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd random-user-generator/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## Getting Started

### Development

Start the development server:
```bash
npm run dev
```

The server will be available at `http://localhost:3000` (or configured port)

### Build

Build the TypeScript code:
```bash
npm run build
```

### Production

Run in production mode:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check server health status

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Home
- `GET /` - Home page

## Configuration

Configuration is managed through the `config.ts` file and environment variables (`.env`). Key settings include:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Database connection string
- `RATE_LIMIT_WINDOW` - Rate limiting window (in minutes)
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window

## Middleware

- **Error Handler** - Centralized error handling
- **Rate Limiter** - Prevent abuse with request rate limiting
- **Request Logger** - Log all incoming requests
- **Not Found Handler** - Handle 404 errors

## Database

### Migrations

Database schema is managed through migrations:
- `20260322115932-add-user-table.js` - Create users table
- `20260328172338-add-random-user-profile-table.js` - Create random user profiles table

### Seeding

Populate the database with sample data:
```bash
npm run seed
```

## API Documentation

Interactive API documentation is available via Swagger. Visit:
```
http://localhost:3000/api-docs
```

## Error Handling

All errors are caught and handled by the centralized error handler. Custom `ApiError` class is used for consistent error responses:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm run lint       # Run linter (if configured)
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=./database.json
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
