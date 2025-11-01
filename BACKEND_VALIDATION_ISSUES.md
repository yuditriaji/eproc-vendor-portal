# Backend Validation Issues

## Issue Summary

The configuration endpoints are returning generic "Bad Request" (400) errors without specific validation details, making it impossible for the frontend to properly handle and display errors to users.

## Current Behavior

**Endpoint:** `POST /api/v1/{tenant}/org/company-codes`

**Request sent from frontend:**
```json
{
  "code": "C100",
  "name": "Sinar Aji Mandiri",
  "description": "Primary Company Code",
  "address": {
    "street": "Jalan Halim, No. 15",
    "city": "Jakarta Timur",
    "state": "Halim",
    "zipCode": "13610",
    "country": "Indonesia"
  }
}
```

**Current error response:**
```json
{
  "message": "Bad Request",
  "statusCode": 400
}
```

**Expected error response** (according to CONFIGURATION_PROCESS_FLOW.md):
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Company code creation failed",
  "errors": [
    "Specific validation error message",
    "Another validation error if applicable"
  ]
}
```

## Required Fixes

### 1. Enable Detailed Validation Errors

The backend should return specific validation messages for each field that fails validation:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "code: Company code must be alphanumeric",
    "zipCode: Must be a valid postal code",
    "name: Company name already exists"
  ]
}
```

### 2. NestJS Configuration (if using NestJS)

In your `main.ts`, ensure ValidationPipe is configured to return detailed errors:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));
      return new BadRequestException({
        success: false,
        statusCode: 400,
        message: 'Validation failed',
        errors: messages.flatMap(m => m.errors),
      });
    },
  }),
);
```

### 3. DTO Validation

Ensure your DTOs have proper validation decorators:

```typescript
import { IsString, IsNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateCompanyCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;
}
```

### 4. Exception Filter (Optional but Recommended)

Create a global exception filter to ensure consistent error responses:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || message;
        errors = exceptionResponse['errors'] || [];
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## Testing

Once fixed, test with the same payload:

```bash
curl -X POST https://eproc-sourcing-backend.onrender.com/api/v1/quiv/org/company-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "C100",
    "name": "Sinar Aji Mandiri",
    "description": "Primary Company Code",
    "address": {
      "street": "Jalan Halim, No. 15",
      "city": "Jakarta Timur",
      "state": "Halim",
      "zipCode": "13610",
      "country": "Indonesia"
    }
  }'
```

Expected responses:

**Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Company code created successfully",
  "data": {
    "id": "...",
    "tenantId": "quiv",
    "code": "C100",
    "name": "Sinar Aji Mandiri",
    ...
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "code: Code C100 already exists",
    "zipCode: Invalid postal code format"
  ]
}
```

## Affected Endpoints

All configuration endpoints need this fix:
- POST /org/company-codes
- POST /org/plants
- POST /org/storage-locations
- POST /org/purchasing-orgs
- POST /org/purchasing-groups
- POST /currencies
- POST /vendors
- POST /config/basis

## Frontend Workaround (Temporary)

Until the backend is fixed, the frontend will display:
- "Failed to create company code. Please check your input and try again."
- Generic error messages
- Console logs for debugging

Once the backend returns proper validation errors, the frontend will automatically:
- Display specific field-level errors
- Highlight invalid fields
- Show helpful error messages to users

## Priority

**HIGH** - This blocks all configuration functionality and makes the system unusable for administrators.

## Contact

If you need clarification on the expected request/response formats, refer to `CONFIGURATION_PROCESS_FLOW.md` in the frontend repository.
