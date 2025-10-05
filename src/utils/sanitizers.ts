import DOMPurify from 'dompurify';
import * as yup from 'yup';

// Configure DOMPurify for safe HTML sanitization
const configureDOMPurify = () => {
  if (typeof window !== 'undefined') {
    return DOMPurify.create(window);
  }
  return null;
};

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (dirty: string): string => {
  const purify = configureDOMPurify();
  if (!purify) return dirty; // Server-side fallback
  
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
  });
};

// Sanitize text input (remove HTML and dangerous characters)
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (match) => {
      // Escape dangerous characters
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return escapeMap[match] || match;
    })
    .trim();
};

// Sanitize file names
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
};

// Validate and sanitize email
export const sanitizeEmail = (email: string): string => {
  const sanitized = sanitizeText(email).toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

// Validate and sanitize phone number
export const sanitizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Invalid phone number length');
  }
  
  return cleaned;
};

// Sanitize URL to prevent malicious redirects
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    // Prevent javascript: and data: URLs
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      throw new Error('Dangerous URL protocol detected');
    }
    
    return urlObj.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
};

// Validation schemas using Yup
export const validationSchemas = {
  // User registration schema
  register: yup.object({
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required')
      .max(255, 'Email too long'),
    
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number and special character'
      )
      .required('Password is required'),
    
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    
    name: yup
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long')
      .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .required('Name is required'),
    
    company: yup
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name too long')
      .required('Company name is required'),
    
    phone: yup
      .string()
      .matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
      .min(10, 'Phone number too short')
      .max(20, 'Phone number too long')
      .required('Phone number is required'),
  }),

  // Bid submission schema
  bidSubmission: yup.object({
    price: yup
      .number()
      .positive('Price must be positive')
      .max(999999999, 'Price too large')
      .required('Price is required'),
    
    currency: yup
      .string()
      .oneOf(['USD', 'EUR', 'GBP'], 'Invalid currency')
      .required('Currency is required'),
    
    notes: yup
      .string()
      .max(2000, 'Notes too long')
      .optional(),
    
    requirements: yup
      .object()
      .required('Requirements are required'),
  }),

  // File upload schema
  fileUpload: yup.object({
    file: yup
      .mixed()
      .test('fileSize', 'File too large', (value: any) => {
        if (!value) return true;
        return value.size <= 10485760; // 10MB
      })
      .test('fileType', 'Invalid file type', (value: any) => {
        if (!value) return true;
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif',
        ];
        return allowedTypes.includes(value.type);
      }),
  }),

  // Profile update schema
  profileUpdate: yup.object({
    name: yup
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long')
      .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .optional(),
    
    company: yup
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name too long')
      .optional(),
    
    phone: yup
      .string()
      .matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
      .min(10, 'Phone number too short')
      .max(20, 'Phone number too long')
      .optional(),
  }),
};

// Rate limiting for form submissions
const submissionAttempts = new Map<string, { count: number; resetTime: number }>();

export const checkSubmissionRate = (identifier: string, maxAttempts = 5, windowMs = 300000): boolean => {
  const now = Date.now();
  const attempts = submissionAttempts.get(identifier);

  if (!attempts || now > attempts.resetTime) {
    submissionAttempts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (attempts.count >= maxAttempts) {
    return false;
  }

  attempts.count++;
  return true;
};

// Crypto utility for client-side encryption
export const encryptSensitiveData = async (data: string, key: string): Promise<string> => {
  if (typeof window === 'undefined') return data;
  
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(key.padEnd(32, '0').slice(0, 32));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );
    
    const encrypted = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    encrypted.set(iv);
    encrypted.set(new Uint8Array(encryptedBuffer), iv.length);
    
    return btoa(String.fromCharCode(...encrypted));
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Fallback to unencrypted data
  }
};

// Content Security Policy nonce generator
export const generateNonce = (): string => {
  if (typeof window === 'undefined') {
    return require('crypto').randomBytes(16).toString('base64');
  }
  
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// Prevent prototype pollution
export const safeObjectAssign = (target: any, source: any): any => {
  const safeKeys = Object.keys(source).filter(key => 
    key !== '__proto__' && 
    key !== 'constructor' && 
    key !== 'prototype'
  );
  
  const result = { ...target };
  safeKeys.forEach(key => {
    if (source[key] !== null && typeof source[key] === 'object') {
      result[key] = safeObjectAssign(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  });
  
  return result;
};