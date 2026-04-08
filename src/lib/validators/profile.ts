import { z } from "zod";

export const profileSchema = z.object({
  arrivalDate: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  currentRegion: z.string().optional(),
  languagesSpoken: z.array(z.string()).default([]),
  bio: z.string().max(1000).optional(),
  familySituation: z.string().optional(),
  professionalBackground: z.string().optional(),
  interests: z.array(z.string()).default([]),
  preferredMeetingStyle: z.string().optional(),
  availability: z.string().optional(),
  ageRangePreference: z.string().optional(),
  genderPreference: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  needsHelp: z.array(z.string()).default([]),
});

export const buddyProfileSchema = z.object({
  expertiseAreas: z.array(z.string()).default([]),
  regionsServed: z.array(z.string()).default([]),
  maxActiveConnections: z.number().min(1).max(10).default(3),
  isAcceptingMatches: z.boolean().default(true),
});

export const onboardingSchema = z.object({
  role: z.enum(["NEWCOMER", "BUDDY", "BOTH"]),
  profile: profileSchema,
  buddyProfile: buddyProfileSchema.optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type BuddyProfileInput = z.infer<typeof buddyProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
