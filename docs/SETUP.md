# CRM Authentication Setup Guide

This guide will help you set up the role-based authentication system for the CRM application.

## Features

- **Role-based Authentication**: Support for Admin, Executive, and Telecaller roles
- **Secure Forms**: Using react-hook-form with Zod validation
- **Server Actions**: Implemented with next-safe-action for type safety
- **Better Auth Integration**: Modern authentication with session management
- **MongoDB Database**: Using Prisma ORM with MongoDB

## Prerequisites

1. Node.js 18+ installed
2. MongoDB database (local or cloud)
3. Environment variables configured

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/crm"
# or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/crm"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

### 2. Database Setup

1. **Generate Prisma Client**:

   ```bash
   pnpm prisma generate
   ```

2. **Push Database Schema**:

   ```bash
   pnpm prisma db push
   ```

3. **Seed the Database** (to create roles):
   ```bash
   pnpm db:seed
   ```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the Application

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## User Roles

### Admin

- Full access to all CRM features
- User management capabilities
- System settings and configuration
- Advanced reporting and analytics

### Executive

- Management features and team oversight
- Advanced reports and lead management
- Limited administrative functions

### Telecaller

- Basic CRM features for daily operations
- Lead management and calling features
- Basic reporting capabilities

## Authentication Flow

1. **Registration**: New users are automatically assigned the "TELECALLER" role
2. **Login**: Users authenticate with email and password
3. **Session Management**: Better Auth handles secure session management
4. **Role-based Access**: Features are displayed based on user roles

## API Routes

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

## Form Validation

All forms use Zod schemas for validation:

- **Signup Form**: Name, email, password, and password confirmation
- **Login Form**: Email and password
- **Server-side Validation**: Additional checks for existing users

## Security Features

- Password hashing with Better Auth
- CSRF protection
- Session-based authentication
- Role-based access control
- Input validation and sanitization

## Database Schema

### User Model

```prisma
model User {
  id            String    @id @map("_id")
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  roleId        String?
  role          Role?     @relation(fields: [roleId], references: [id])
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]
}
```

### Role Model

```prisma
model Role {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique // ADMIN, EXECUTIVE, TELECALLER
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:

   - Verify your `DATABASE_URL` in `.env`
   - Ensure MongoDB is running
   - Check network connectivity for cloud databases

2. **Prisma Client Not Found**:

   - Run `pnpm prisma generate`
   - Restart your development server

3. **Roles Not Available**:

   - Run the seed script: `pnpm db:seed`
   - Check if roles exist in your database

4. **Authentication Not Working**:
   - Verify `BETTER_AUTH_SECRET` is set
   - Check if the API route is accessible at `/api/auth/[...all]`

### Development Tips

1. **Reset Database**:

   ```bash
   pnpm prisma db push --force-reset
   pnpm db:seed
   ```

2. **View Database**:

   ```bash
   pnpm prisma studio
   ```

3. **Check Logs**:
   - Server actions log errors to the console
   - Check browser network tab for API calls

## Next Steps

1. Implement password reset functionality
2. Add email verification
3. Create admin panel for user management
4. Add OAuth providers (Google, GitHub, etc.)
5. Implement audit logging
6. Add two-factor authentication

## Support

For issues or questions, please check:

1. The application logs in the console
2. Network requests in browser dev tools
3. Database connectivity
4. Environment variable configuration
