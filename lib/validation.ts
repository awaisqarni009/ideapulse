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

/**
 * Registration validation per AC-01.1 and AC-01.4:
 * - Valid email
 * - Password at least 10 characters
 * - Password must contain at least one digit
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters long.')
    .regex(/\d/, 'Password must contain at least one digit (0-9).'),
});

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
