# Bookish - Backend
Bookish is a full-stack web application designed for avid readers to organize their personal libraries, track reading goals, and discover new books. This repository serves as the RESTful API and database layer for the application.

## Features
 - User Authentication & Authorization: Secure user registration and login utilizing JSON Web Tokens (JWT) and bcrypt for password hashing.
 - Book Management: CRUD operations allowing users to add, update, delete, and view books in their personal collections.
 - Database Architecture: Relational database schema designed with PostgreSQL to manage users, books, reviews, and reading statuses efficiently.
 - Comprehensive Testing: Automated test suites written using Jest and Supertest to ensure high test coverage and API reliability.
 - Error Handling: Custom error-handling middleware for graceful error responses and robust input validation.

## Tech Stack
- Runtime Environment: Node.js
- Framework: Express.js
- Database: PostgreSQL
- Authentication: JSON Web Tokens and bcrypt
- Validation: jsonschema
- Testing: Jest and Supertest

## Project Structure
```bookish-backend/
|--helpers/             # Generate dynamic SQL update queries, JWT generation and verification
|--middleware/          # Middleware for authenticating users and verifying permissions
|--models/              # Models for SQL queries and tests for models
|--routes/              # Express route definitions for endpoints and tests for routes
|--schema/              # JSON schema validators
|--app.js               # Express application configuration
|--app.test.js          # Integration and app-level tests
|--db.js                # PostgreSQL connection setup
|--server.js            # Server setup
|__config.js            # Centralized configuration and enviornment variables
```
## Getting Started
1. Clone the repository:
    git clone https://github.com/tdrudi/bookish-backend.git
    cd bookish-backend
   
2. Install dependencies
    npm install
   
3. Set up database:
    psql < bookish.sql
    psql < bookish-schema.sql

4. Create .env file:
    PORT=3001
    SECRET_KEY = your_secret_key_here
    DATABASE_URL = postgresql://bookish

   Note: For running tests, ensure a bookish_test database is also available.

5. Run the server:
    npm start

6. Running tests:
    npm test


## Core Models
- User: Handles user registration, authentication, profile, and updates.
- Book: Manages book cataloging, lookup, and metadata.
- List: Handles user-created book lists and collections.
- Review: Managers user rating and reviews for books.
