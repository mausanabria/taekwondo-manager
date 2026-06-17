# Authentication System Documentation

## Overview

The Taekwondo Manager application uses **NextAuth.js v4** for authentication with a credentials-based provider. The system is fully integrated with Prisma ORM and PostgreSQL database.

## Features

- ✅ Email/Password authentication
- ✅ Secure password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based sessions
- ✅ Protected routes with middleware
- ✅ User registration with automatic school creation
- ✅ Server-side session validation
- ✅ Responsive login/register UI

## Architecture

### Authentication Flow

1. **Registration**:
   - User submits registration form
   - Server validates input with Zod
   - Password is hashed with bcrypt
   - User and default school are created in a transaction
   - User is redirected to login page

2. **Login**:
   - User submits credentials
   - NextAuth validates against database
   - JWT token is generated with user ID and school ID
   - Session is created and stored in cookie
   - User is redirected to dashboard

3. **Protected Routes**:
   - Middleware checks for valid session token
   - Unauthenticated users are redirected to login
   - Session data is available in all server components

## File Structure

```
src/
├── lib/
│   └── auth.ts                          # NextAuth configuration & helpers
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts             # NextAuth API handler
│   │       └── register/
│   │           └── route.ts             # Registration API endpoint
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                 # Login page
│   │   └── register/
│   │       └── page.tsx                 # Registration page
│   └── (dashboard)/
│       └── layout.tsx                   # Protected dashboard layout
├── components/
│   └── auth/
│       ├── LoginForm.tsx                # Login form component
│       └── RegisterForm.tsx             # Registration form component
└── middleware.ts                        # Route protection middleware
```

## Configuration

### Environment Variables

Required variables in `.env`:

```env
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_db?schema=public"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Environment
NODE_ENV="development"
```

### NextAuth Options

Located in `src/lib/auth.ts`:

- **Provider**: CredentialsProvider (email/password)
- **Adapter**: PrismaAdapter
- **Session Strategy**: JWT
- **Session Max Age**: 30 days
- **Custom Pages**: `/login`, `/register`

## API Endpoints

### POST /api/auth/register

Register a new user.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- 400: Validation failed
- 409: Email already registered
- 500: Internal server error

### POST /api/auth/signin

Handled by NextAuth. Use `signIn()` from `next-auth/react`.

### POST /api/auth/signout

Handled by NextAuth. Use `signOut()` from `next-auth/react`.

## Usage Examples

### Client-Side Authentication

```tsx
"use client"

import { signIn, signOut } from "next-auth/react"

// Login
const handleLogin = async () => {
  const result = await signIn("credentials", {
    email: "user@example.com",
    password: "password",
    redirect: false,
  })
  
  if (result?.error) {
    console.error("Login failed")
  } else {
    router.push("/")
  }
}

// Logout
const handleLogout = () => {
  signOut({ callbackUrl: "/login" })
}
```

### Server-Side Authentication

```tsx
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect("/login")
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>User ID: {session.user.id}</p>
      <p>School ID: {session.user.schoolId}</p>
    </div>
  )
}
```

### Using requireAuth Helper

```tsx
import { requireAuth } from "@/lib/auth"

export default async function ProtectedPage() {
  const session = await requireAuth() // Throws error if not authenticated
  
  return <div>Protected content</div>
}
```

## Session Data Structure

The session object includes:

```typescript
{
  user: {
    id: string           // User ID from database
    email: string        // User email
    name?: string        // User name
    image?: string       // User avatar (optional)
    schoolId?: string    // ID of user's primary school
  }
}
```

## Protected Routes

The middleware protects all routes except:

- `/login` - Login page
- `/register` - Registration page
- `/api/auth/*` - Authentication API routes
- `/_next/*` - Next.js internal routes
- `/favicon.ico` - Favicon
- `/public/*` - Public assets

## Security Features

1. **Password Hashing**: Bcrypt with 10 salt rounds
2. **JWT Tokens**: Signed with NEXTAUTH_SECRET
3. **HTTP-Only Cookies**: Session tokens stored securely
4. **CSRF Protection**: Built into NextAuth
5. **Input Validation**: Zod schemas on both client and server
6. **SQL Injection Prevention**: Prisma ORM parameterized queries

## Validation Rules

### Registration

- **Name**: Minimum 2 characters
- **Email**: Valid email format
- **Password**: Minimum 6 characters
- **Confirm Password**: Must match password

### Login

- **Email**: Required, valid format
- **Password**: Required

## Error Handling

All authentication errors are handled gracefully:

- Invalid credentials → User-friendly error message
- Duplicate email → "Email already registered"
- Validation errors → Field-specific error messages
- Server errors → Generic error message (details logged)

## Database Schema

The authentication system uses these Prisma models:

- **User**: Stores user credentials and profile
- **Account**: OAuth accounts (for future providers)
- **Session**: Active sessions (when using database strategy)
- **VerificationToken**: Email verification tokens
- **School**: User's taekwondo school (created on registration)

## Testing

### Manual Testing Checklist

- [ ] Register new user with valid data
- [ ] Register with duplicate email (should fail)
- [ ] Register with invalid email (should fail)
- [ ] Register with short password (should fail)
- [ ] Register with mismatched passwords (should fail)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Access protected route without login (should redirect)
- [ ] Access protected route with login (should work)
- [ ] Logout and verify redirect to login
- [ ] Session persists after page refresh

## Troubleshooting

### Common Issues

1. **"Cannot find module 'next-auth'"**
   - Run: `npm install`
   - Ensure all dependencies are installed

2. **"Invalid credentials" on correct password**
   - Check database connection
   - Verify password was hashed during registration
   - Check NEXTAUTH_SECRET is set

3. **Redirect loop on login**
   - Verify NEXTAUTH_URL matches your domain
   - Check middleware configuration
   - Clear browser cookies

4. **Session not persisting**
   - Verify NEXTAUTH_SECRET is set and consistent
   - Check cookie settings in browser
   - Ensure JWT strategy is configured

## Future Enhancements

Potential improvements:

- [ ] OAuth providers (Google, GitHub)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Remember me functionality
- [ ] Session management (view/revoke active sessions)
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts

## Support

For issues or questions:
1. Check this documentation
2. Review NextAuth.js documentation: https://next-auth.js.org
3. Check application logs for detailed error messages

---

**Last Updated**: 2026-06-15  
**Version**: 1.0.0  
**Author**: Bob (AI Assistant)