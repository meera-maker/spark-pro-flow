import { z } from 'zod';

// Client validation schema
export const clientSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.,'&]+$/, 'Name contains invalid characters'),
  email: z.string()
    .trim()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .trim()
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[0-9\s\+\-\(\)]+$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  company: z.string()
    .trim()
    .max(200, 'Company name must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .trim()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  billing_address: z.string()
    .trim()
    .max(500, 'Billing address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  tax_id: z.string()
    .trim()
    .max(50, 'Tax ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  payment_terms: z.string()
    .trim()
    .max(100, 'Payment terms must be less than 100 characters')
    .optional()
    .or(z.literal('')),
});

// User/Team member validation schema
export const userSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-\.,']+$/, 'Name contains invalid characters'),
  email: z.string()
    .trim()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  role: z.string()
    .min(1, 'Role is required'),
  workflow_role: z.string()
    .optional()
    .nullable(),
  timezone: z.string()
    .optional()
    .nullable(),
});

// Project intake validation schema
export const projectIntakeSchema = z.object({
  client_name: z.string()
    .trim()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be less than 100 characters'),
  client_email: z.string()
    .trim()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  project_code: z.string()
    .trim()
    .min(1, 'Project code is required')
    .max(50, 'Project code must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Project code can only contain letters, numbers, hyphens, and underscores'),
  creative_type: z.string()
    .trim()
    .min(1, 'Creative type is required')
    .max(100, 'Creative type must be less than 100 characters'),
  brief: z.string()
    .trim()
    .min(1, 'Brief is required')
    .max(5000, 'Brief must be less than 5000 characters'),
  deadline: z.string()
    .min(1, 'Deadline is required'),
  drive_folder_url: z.string()
    .trim()
    .max(500, 'Drive folder URL must be less than 500 characters')
    .regex(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Invalid URL format')
    .optional()
    .or(z.literal('')),
  format: z.string()
    .trim()
    .max(200, 'Format must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  quantity: z.number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity must be less than 1000')
    .optional()
    .nullable(),
  scope_of_work: z.string()
    .trim()
    .max(2000, 'Scope of work must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  project_details: z.string()
    .trim()
    .max(2000, 'Project details must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type ProjectIntakeFormData = z.infer<typeof projectIntakeSchema>;
