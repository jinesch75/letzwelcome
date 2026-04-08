import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  type: z.enum(["EVENT", "WALK"]),
  region: z.string().min(1, "Region is required"),
  date: z.string().min(1, "Date is required"),
  meetingPoint: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  category: z.string().min(1, "Category is required"),
  maxParticipants: z.number().min(2).max(500).optional(),
  autopedestreRouteId: z.string().optional(),
  clubId: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const reportSchema = z.object({
  reportedUserId: z.string().optional(),
  matchId: z.string().optional(),
  contentType: z.enum(["PHOTO", "TEXT", "EVENT", "CLUB"]).optional(),
  contentId: z.string().optional(),
  category: z.enum(["HARASSMENT", "INAPPROPRIATE", "SCAM", "THREATS", "IDENTITY", "OTHER"]),
  description: z.string().min(10, "Please describe the issue in at least 10 characters").max(2000),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export type EventInput = z.infer<typeof eventSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
