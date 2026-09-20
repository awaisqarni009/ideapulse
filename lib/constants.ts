/**
 * IdeaPulse System Constants
 * Authoritative single source of truth per RULES.md, ARCHITECTURE.md, and TASKS.md [T-0.15].
 * Client validation and database constraints must never drift from these values.
 */

// Voting rules (RULES.md BR-010, BR-014, BR-003)
export const VOTE_LIMIT_PER_DAY = 5;
export const RETRACTION_WINDOW_MIN = 10;
export const RETRACTION_WINDOW_MS = RETRACTION_WINDOW_MIN * 60 * 1000;
export const ACCOUNT_VERIFICATION_HOURS = 24;

// Cycle & Rewards (RULES.md BR-040, BR-045, BR-046)
export const QUALIFY_THRESHOLD = 50;
export const REWARD_SLOTS = 3;
export const CYCLE_DURATION_DAYS = 7;

// Submission Quotas (RULES.md BR-020)
export const SUBMISSION_COOLDOWN_DAYS = 7;
export const SUBMISSION_COOLDOWN_HOURS = 168;
export const SUBMISSION_COOLDOWN_MS = SUBMISSION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

// Idea Content Bounds (RULES.md BR-021, ARCHITECTURE.md 030_ideas.sql)
export const IDEA_LIMITS = {
  TITLE_MIN: 10,
  TITLE_MAX: 120,
  SUMMARY_MIN: 40,
  SUMMARY_MAX: 280,
  BODY_MIN: 100,
  BODY_MAX: 5000,
  TAGS_MIN: 0,
  TAGS_MAX: 5,
  TAG_LENGTH_MAX: 24,
} as const;

// Allowed Categories (ARCHITECTURE.md 030_ideas.sql constraint ideas_category_allowed)
export const CATEGORIES = [
  'product',
  'developer-tools',
  'ai',
  'sustainability',
  'health',
  'education',
  'fintech',
  'social',
  'hardware',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  product: 'Product',
  'developer-tools': 'Developer Tools',
  ai: 'AI & Machine Learning',
  sustainability: 'Sustainability',
  health: 'Health & Biotech',
  education: 'Education',
  fintech: 'Fintech',
  social: 'Social & Community',
  hardware: 'Hardware & IoT',
  other: 'Other',
};

// Profile Content Bounds (ARCHITECTURE.md 010_profiles.sql)
export const PROFILE_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  DISPLAY_NAME_MIN: 1,
  DISPLAY_NAME_MAX: 50,
  BIO_MAX: 160,
  USERNAME_CHANGE_COOLDOWN_DAYS: 30,
} as const;

// Slug Regex (ARCHITECTURE.md constraint ideas_slug_format)
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
