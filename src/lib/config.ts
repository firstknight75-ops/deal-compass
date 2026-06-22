/**
 * Production Configuration Service + Environment Validation + Feature Flags
 * 
 * All configuration is validated at startup.
 * No hardcoded values. No secrets in code.
 * Feature flags can be overridden via env or (future) DB.
 */

import { z } from 'zod';

const EnvSchema = z.object({
  // Supabase (optional for frontend-only landing builds)
  VITE_SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),

  // Stripe (optional for now)
  STRIPE_SECRET_KEY: z.string().min(10).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(10).optional(),

  // AI
  ANTHROPIC_API_KEY: z.string().min(10).optional(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5173),

  // Feature flags (booleans via strings)
  ENABLE_REAL_CRAWLER: z.enum(['true', 'false']).default('false'),
  ENABLE_AI_AGENT: z.enum(['true', 'false']).default('true'),
  ENABLE_RATE_LIMITING: z.enum(['true', 'false']).default('false'),
  ENABLE_CACHING: z.enum(['true', 'false']).default('false'),
});

export type AppConfig = z.infer<typeof EnvSchema> & {
  isProduction: boolean;
  isDevelopment: boolean;
  features: {
    realCrawler: boolean;
    aiAgent: boolean;
    rateLimiting: boolean;
    caching: boolean;
  };
};

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const raw = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT,
    ENABLE_REAL_CRAWLER: process.env.ENABLE_REAL_CRAWLER || 'false',
    ENABLE_AI_AGENT: process.env.ENABLE_AI_AGENT || 'true',
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING || 'false',
    ENABLE_CACHING: process.env.ENABLE_CACHING || 'false',
  };

  const parsed = EnvSchema.safeParse(raw);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(parsed.error.flatten());
    throw new Error('Environment validation failed. Check your .env variables.');
  }

  const env = parsed.data;

  const config: AppConfig = {
    ...env,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    features: {
      realCrawler: env.ENABLE_REAL_CRAWLER === 'true',
      aiAgent: env.ENABLE_AI_AGENT === 'true',
      rateLimiting: env.ENABLE_RATE_LIMITING === 'true',
      caching: env.ENABLE_CACHING === 'true',
    },
  };

  cachedConfig = config;

  // Startup log (safe)
  console.log('[Config] Environment validated successfully');
  console.log(`[Config] Mode: ${env.NODE_ENV} | Real Crawler: ${config.features.realCrawler} | AI Agent: ${config.features.aiAgent}`);

  return config;
}

// Convenience for feature flags
export function isFeatureEnabled(flag: keyof AppConfig['features']): boolean {
  return getConfig().features[flag];
}

// Force re-validation (useful in tests)
export function resetConfigCache() {
  cachedConfig = null;
}
