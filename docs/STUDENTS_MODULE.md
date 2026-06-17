# Student Management Module Documentation

## Overview

The Student Management module provides complete CRUD (Create, Read, Update, Delete) functionality for managing students in the taekwondo school management application.

## Features

- ✅ List all students with filtering and search
- ✅ View detailed student information
- ✅ Create new students
- ✅ Update student information
- ✅ Delete students (hard delete)
- ✅ Filter by belt, active status
- ✅ Search by name, email, phone
- ✅ Responsive design (mobile and desktop)
- ✅ Student statistics (attendances, payments)
- ✅ Age calculation from birth date
- ✅ Emergency contact information
- ✅ Belt progression tracking

## File Structure

```
taekwondo-manager/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── students/
│   │   │       ├── route.ts                    # GET (list), POST (create)
│   │   │       └── [id]/
│   │   │           └── route.ts                # GET, PUT, DELETE (individual)
│   │   └── (dashboard)/
│   │       └── students/
│   │           ├── page.tsx                    # Students list page
│   │           ├── new/
│   │           │   └── page.tsx                # Create student page
│   │           └── [id]/
│   │               ├── page.tsx                # Student detail page
│   │               └── edit/
│   │                   └── page.tsx            # Edit student page
│   ├── components/
│   │   └── students/
│   │       ├── StudentList.tsx                 # Table/list component
│   │       ├── StudentForm.tsx                 # Create/edit form
│   │       └── StudentCard.tsx                 # Card view component
│   ├── services/
│   │   └── studentService.ts                   # Business logic
│   ├── lib/
│   │   └── validations/
│   │       └── student.ts                      # Zod validation schemas
│   └── types/
│       └── index.ts                            # TypeScript types
```

## API Endpoints

### GET /api/students
List all students for the authenticated user's school.

**Query Parameters:**
- `isActive` (optional): Filter by active status (true/false)
- `belt` (optional): Filter by belt color
- `search` (optional): Search by name, email, or phone

**Response:**
```json
[
  {
    "id": "clx...",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+54 11 1234-5678",
    "birthDate": "2010-05-15T00:00:00.000Z",
    "belt": "azul",
    "address": "Calle Falsa 123",
    "emergencyContact": "María Pérez",
    "emergencyPhone": "+54 11 8765-4321",
    "notes": "Alumno destacado",
    "isActive": true,
    "schoolId": "clx...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/students
Create a new student.

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "+54 11 1234-5678",
  "birthDate": "2010-05-15",
  "belt": "blanco",
  "address": "Calle Falsa 123",
  "emergencyContact": "María Pérez",
  "emergencyPhone": "+54 11 8765-4321",
  "notes": "Alumno nuevo",
  "isActive": true
}
```

**Response:** Created student object (201)

### GET /api/students/[id]
Get a specific student by ID.

**Response:** Student object or 404

### PUT /api/students/[id]
Update a student.

**Request Body:** Same as POST (all fields optional)

**Response:** Updated student object

### DELETE /api/students/[id]
Delete a student (hard delete).

**Response:** Success message (200)

## Components

### StudentList
Displays students in a responsive table (desktop) or cards (mobile).

**Props:**
- `students`: Array of Student objects
- `onDelete`: Optional callback for delete action

**Features:**
- Responsive design
- Action buttons (View, Edit, Delete)
- Belt color badges
- Active/Inactive status indicators
- Empty state message

### StudentForm
Form for creating or editing students.

**Props:**
- `student`: Optional Student object (for edit mode)
- `onSubmit`: Callback function for form submission
- `onCancel`: Optional callback for cancel action

**Features:**
- Client-side validation
- All student fields
- Belt selection dropdown
- Active/Inactive toggle
- Loading states
- Error handling

### StudentCard
Card view for displaying individual student information.

**Props:**
- `student`: Student object

**Features:**
- Compact design
- Quick actions (View, Edit)
- Status indicator
- Belt badge
- Contact information

## Validation

All student data is validated using Zod schemas defined in `src/lib/validations/student.ts`.

**Validation Rules:**
- `firstName`: Required, 1-100 characters
- `lastName`: Required, 1-100 characters
- `email`: Optional, valid email format
- `phone`: Required, 1-20 characters, valid phone format
- `birthDate`: Optional, valid date
- `belt`: Optional, one of: blanco, amarillo, verde, azul, rojo, negro
- `address`: Optional, max 500 characters
- `emergencyContact`: Optional, max 100 characters
- `emergencyPhone`: Optional, max 20 characters, valid phone format
- `notes`: Optional, any length
- `isActive`: Boolean, default true

## Service Layer

The `studentService` provides the following methods:

### getAllStudents(schoolId, filters?)
Get all students for a school with optional filters.

### getStudentById(id, schoolId)
Get a specific student with school validation.

### createStudent(data)
Create a new student.

### updateStudent(id, data, schoolId)
Update a student with school validation.

### deleteStudent(id, schoolId)
Delete a student with school validation.

### deactivateStudent(id, schoolId)
Soft delete - mark student as inactive.

### getStudentStats(studentId, schoolId)
Get student statistics (attendances, payments).

### getStudentAttendances(studentId, schoolId, limit?)
Get recent attendances for a student.

### getStudentPayments(studentId, schoolId, limit?)
Get recent payments for a student.

### calculateAge(birthDate)
Calculate age from birth date.

## Security

- All API routes require authentication
- School validation ensures users can only access their own students
- Input validation on both client and server
- SQL injection protection via Prisma ORM

## Usage Examples

### Creating a Student
```typescript
const response = await fetch("/api/students", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Juan",
    lastName: "Pérez",
    phone: "+54 11 1234-5678",
    belt: "blanco",
    isActive: true
  })
})
```

### Updating a Student
```typescript
const response = await fetch(`/api/students/${studentId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    belt: "amarillo",
    notes: "Promovido a cinturón amarillo"
  })
})
```

### Deleting a Student
```typescript
const response = await fetch(`/api/students/${studentId}`, {
  method: "DELETE"
})
```

## Future Enhancements

- [ ] Soft delete option (keep in database but mark as deleted)
- [ ] Student photo upload
- [ ] Belt promotion history
- [ ] Student performance reports
- [ ] Export students to CSV/Excel
- [ ] Bulk operations (import, delete, update)
- [ ] Student groups/categories
- [ ] Parent/guardian management
- [ ] Medical information tracking
- [ ] Document attachments

## Testing

To test the student management module:

1. Navigate to `/students` in the application
2. Create a new student using the "Nuevo Alumno" button
3. Verify the student appears in the list
4. Click on a student to view details
5. Edit the student information
6. Test filtering and search functionality
7. Delete a student and verify it's removed

## Troubleshooting

**Students not loading:**
- Check authentication status
- Verify user has an associated school
- Check browser console for errors

**Validation errors:**
- Ensure all required fields are filled
- Check email format
- Verify phone number format

**Delete not working:**
- Confirm user has permission
- Check if student has related records (attendances, payments)

## Made with Bob