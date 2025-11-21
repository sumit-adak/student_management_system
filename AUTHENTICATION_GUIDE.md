# Authentication System Guide

## Overview

The Student Information Management System now includes a comprehensive authentication system with user management and role-based access control.

## Features

### 1. User Authentication
- **Username & Password Login**: Secure login using username (automatically converted to email format)
- **User Registration**: New users can sign up with username and password
- **Automatic Login**: Users are automatically logged in after successful registration
- **Session Management**: Persistent sessions across browser refreshes

### 2. Role-Based Access Control
- **User Roles**: Two roles available - `user` and `admin`
- **First User Privilege**: The first registered user automatically becomes an administrator
- **Admin Dashboard**: Exclusive access for administrators to manage users and roles

### 3. User Management (Admin Only)
- View all registered users
- Update user roles (promote to admin or demote to user)
- View user statistics (total users, admins, regular users)
- Protected from self-modification (admins cannot change their own role)

## Getting Started

### First Time Setup

1. **Register the First User** (Becomes Admin)
   - Navigate to the application
   - You'll be redirected to the login page
   - Click "Don't have an account? Sign up"
   - Enter a username (letters, numbers, and underscores only)
   - Enter a password (minimum 6 characters)
   - Confirm your password
   - Click "Sign Up"
   - You'll be automatically logged in as an administrator

2. **Subsequent User Registration**
   - New users follow the same registration process
   - They will be assigned the "user" role by default
   - Admins can later promote users to admin role if needed

### Login Process

1. Navigate to the application
2. If not logged in, you'll be redirected to `/login`
3. Enter your username and password
4. Click "Sign In"
5. Upon successful login, you'll be redirected to the Dashboard

### Logout

- Click the "Logout" button in the sidebar (desktop) or mobile menu
- You'll be logged out and redirected to the login page

## User Roles

### Regular User (`user`)
- Access to all main features:
  - Dashboard
  - Add Student
  - Students List
  - Attendance
  - Fees
- Cannot access Admin Dashboard
- Cannot modify other users' roles

### Administrator (`admin`)
- All regular user permissions
- Additional access to Admin Dashboard
- Can view all registered users
- Can promote users to admin
- Can demote admins to regular users
- Cannot modify their own role (security measure)

## Admin Dashboard

### Accessing Admin Dashboard
1. Log in as an administrator
2. Click "Admin Dashboard" in the sidebar or mobile menu
3. The Admin Dashboard link is only visible to administrators

### User Management Features

#### View Users
- See all registered users in a table format
- Columns: Username, Email, Phone, Role, Registration Date, Actions
- Your own account is marked with a "You" badge

#### Update User Roles
1. Locate the user in the table
2. Use the dropdown in the "Actions" column
3. Select "User" or "Admin"
4. The role is updated immediately
5. A success notification confirms the change

#### View Statistics
- **Total Users**: Count of all registered users
- **Administrators**: Count of users with admin role
- **Regular Users**: Count of users with user role

## Security Features

### Password Requirements
- Minimum 6 characters
- No maximum length
- Stored securely using Supabase Auth encryption

### Username Validation
- Only letters, numbers, and underscores allowed
- Automatically converted to email format (@miaoda.com suffix)
- Must be unique across all users

### Session Security
- Secure session tokens
- Automatic session refresh
- Protected routes (requires authentication)
- Logout clears all session data

### Database Security
- Row Level Security (RLS) enabled on profiles table
- Admins have full access to all profiles
- Users can only view and update their own profile
- Users cannot change their own role
- All role changes are logged

## Technical Details

### Database Schema

#### profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE,
  phone text UNIQUE,
  email text UNIQUE,
  role user_role DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### user_role Enum
```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
```

### Authentication Flow

1. **Registration**
   - User submits username and password
   - Frontend validates input
   - Username is converted to email (username@miaoda.com)
   - Supabase Auth creates user account
   - Trigger automatically creates profile entry
   - First user gets admin role, others get user role
   - User is automatically logged in

2. **Login**
   - User submits username and password
   - Username is converted to email format
   - Supabase Auth validates credentials
   - Session token is created and stored
   - User is redirected to Dashboard

3. **Session Management**
   - Session persists across page refreshes
   - RequireAuth component protects routes
   - Unauthenticated users are redirected to /login
   - Login page is whitelisted (accessible without auth)

4. **Logout**
   - User clicks logout button
   - Supabase Auth clears session
   - User is redirected to login page

### API Functions

#### profilesApi
- `getAll()`: Fetch all user profiles (admin only)
- `getById(id)`: Fetch specific user profile
- `getCurrentProfile()`: Get logged-in user's profile
- `updateRole(userId, role)`: Update user's role (admin only)
- `isAdmin()`: Check if current user is admin

## Troubleshooting

### Cannot Login
- Verify username and password are correct
- Ensure username contains only letters, numbers, and underscores
- Check that password is at least 6 characters
- Try resetting your password (contact admin)

### Cannot Access Admin Dashboard
- Verify you have admin role
- Check with another admin to confirm your role
- Try logging out and logging back in

### Role Changes Not Saving
- Ensure you're logged in as an admin
- Check your internet connection
- Refresh the page and try again
- Verify you're not trying to change your own role

### Session Expired
- Simply log in again
- Your data is safe and preserved

## Best Practices

### For Administrators
1. **Protect Admin Accounts**: Don't share admin credentials
2. **Regular Audits**: Periodically review user list and roles
3. **Principle of Least Privilege**: Only promote users to admin when necessary
4. **Monitor Activity**: Keep track of who has admin access

### For All Users
1. **Strong Passwords**: Use passwords longer than the minimum
2. **Unique Usernames**: Choose memorable but unique usernames
3. **Logout When Done**: Always logout on shared computers
4. **Report Issues**: Contact admin if you notice any problems

## Future Enhancements (Optional)

- Password reset functionality
- Email notifications for role changes
- User activity logs
- Two-factor authentication
- Account deactivation/suspension
- Bulk user management
- Custom role permissions
- User profile customization

## Support

For technical issues or questions about the authentication system:
1. Check this guide first
2. Contact your system administrator
3. Review the error messages for specific issues
4. Check the browser console for technical details

---

**Security Note**: Never share your login credentials with anyone. Administrators will never ask for your password.
