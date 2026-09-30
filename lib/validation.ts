/**
 * IdeaPulse Zod Validation Schemas
 * Authoritative client validation per RULES.md BR-021, ARCHITECTURE.md, and TASKS.md [T-0.17].
 * Built strictly from lib/constants.ts to prevent drift from PostgreSQL CHECK constraints.
 */

import { z } from 'zod';
import { CATEGORIES, IDEA_LIMITS, PROFILE_LIMITS } from './constants';

export const ideaSubmissionSchema = z.object({
  title: z
    .string()
    .min(IDEA_LIMITS.TITLE_MIN, `Title must be at least ${IDEA_LIMITS.TITLE_MIN} characters.`)
    .max(IDEA_LIMITS.TITLE_MAX, `Title cannot exceed ${IDEA_LIMITS.TITLE_MAX} characters.`)
    .trim(),
  summary: z
    .string()
    .min(IDEA_LIMITS.SUMMARY_MIN, `Summary must be at least ${IDEA_LIMITS.SUMMARY_MIN} characters.`)
    .max(IDEA_LIMITS.SUMMARY_MAX, `Summary cannot exceed ${IDEA_LIMITS.SUMMARY_MAX} characters.`)
    .trim(),
  body: z
    .string()
    .min(IDEA_LIMITS.BODY_MIN, `Body must be at least ${IDEA_LIMITS.BODY_MIN} characters.`)
    .max(IDEA_LIMITS.BODY_MAX, `Body cannot exceed ${IDEA_LIMITS.BODY_MAX} characters.`)
    .trim(),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category from the list.' }),
  }),
  tags: z
    .array(
      z
        .string()
        .max(
          IDEA_LIMITS.TAG_LENGTH_MAX,
          `Tag cannot exceed ${IDEA_LIMITS.TAG_LENGTH_MAX} characters.`,
        )
        .regex(/^[a-z0-9-]+$/, 'Tags may only contain lowercase letters, numbers, and hyphens.')
        .trim(),
    )
    .max(IDEA_LIMITS.TAGS_MAX, `You may add at most ${IDEA_LIMITS.TAGS_MAX} tags.`)
    .default([]),
});

export type IdeaSubmissionInput = z.infer<typeof ideaSubmissionSchema>;

export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .min(
      PROFILE_LIMITS.DISPLAY_NAME_MIN,
      `Display name must be at least ${PROFILE_LIMITS.DISPLAY_NAME_MIN} character.`,
    )
    .max(
      PROFILE_LIMITS.DISPLAY_NAME_MAX,
      `Display name cannot exceed ${PROFILE_LIMITS.DISPLAY_NAME_MAX} characters.`,
    )
    .trim(),
  username: z
    .string()
    .min(
      PROFILE_LIMITS.USERNAME_MIN,
      `Username must be at least ${PROFILE_LIMITS.USERNAME_MIN} characters.`,
    )
    .max(
      PROFILE_LIMITS.USERNAME_MAX,
      `Username cannot exceed ${PROFILE_LIMITS.USERNAME_MAX} characters.`,
    )
    .regex(
      /^[a-z0-9_]+$/,
      'Username may only contain lowercase alphanumeric characters and underscores.',
    )
    .trim(),
  bio: z
    .string()
    .max(PROFILE_LIMITS.BIO_MAX, `Bio cannot exceed ${PROFILE_LIMITS.BIO_MAX} characters.`)
    .optional()
    .nullable(),
  avatar_url: z.string().url('Please enter a valid URL.').optional().nullable().or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const voteActionSchema = z.object({
  ideaId: z.string().uuid('Invalid idea identifier.'),
});

export const retractVoteSchema = z.object({
  voteId: z.string().uuid('Invalid vote identifier.'),
});

export const COUNTRY_CODES = [
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
] as const;

/**
 * Registration validation:
 * - Full name (separate from username, max 48 chars)
 * - Username (separate from name, 3-24 alphanumeric + underscore)
 * - Country code + Phone number (must be exactly 11 digits)
 * - Valid email
 * - Password at least 10 characters with alphabet, number, and sign/symbol
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Please enter your full name.')
      .max(48, 'Full name cannot exceed 48 characters.')
      .trim()
      .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), {
        message: 'Full name may only contain alphabet letters and spaces (no numbers or signs).',
      })
      .optional()
      .or(z.literal('')),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .max(24, 'Username cannot exceed 24 characters.')
      .regex(
        /^[a-z0-9_]{3,24}$/i,
        'Username may only contain letters, numbers, and underscores (3-24 chars).',
      )
      .trim()
      .optional()
      .or(z.literal('')),
    countryCode: z.string().optional().or(z.literal('')),
    phone: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^\d{11}$/.test(val), {
        message: 'Phone number must be exactly 11 digits.',
      }),
    email: z
      .string()
      .min(1, 'Please enter your email address.')
      .email('Please enter a valid email address.')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(10, 'Password must be at least 10 characters long.')
      .regex(/[a-zA-Z]/, 'Password must contain at least one alphabet letter (a-z, A-Z).')
      .regex(/\d/, 'Password must contain at least one digit (0-9).')
      .regex(
        /[!@#$%^&*(),.?":{}|<>\-_=+]/,
        'Password must contain at least one sign or symbol (!@#$%^&* etc).',
      ),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    },
  );

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login validation per AC-02.1:
 * - Valid email
 * - Non-empty password
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'Please enter your password.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Password reset request schema (T-2.9)
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.')
    .trim()
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Password update schema (T-2.9)
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, 'Password must be at least 10 characters long.')
      .regex(/\d/, 'Password must contain at least one digit (0-9).'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
