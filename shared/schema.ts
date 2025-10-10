// CRM Schema for Artist Accompaniment System
// Reference: javascript_database blueprint integration
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const artisticDisciplineEnum = pgEnum('artistic_discipline', [
  'visual_arts',
  'music',
  'theater',
  'dance',
  'literature',
  'cinema',
  'digital_arts',
  'multidisciplinary',
  'other'
]);

export const interactionTypeEnum = pgEnum('interaction_type', [
  'meeting',
  'call',
  'email',
  'calendly_appointment',
  'other'
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'draft',
  'in_progress',
  'submitted',
  'accepted',
  'rejected'
]);

export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'in_progress',
  'completed',
  'cancelled'
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent'
]);

export const waitlistStatusEnum = pgEnum('waitlist_status', [
  'waiting',
  'contacted',
  'booked',
  'expired'
]);

export const resourceTypeEnum = pgEnum('resource_type', [
  'venue',       // Salles de spectacle
  'equipment',   // Équipement à louer
  'service',     // Services (son, lumière, etc.)
  'other'
]);

// Artists table
export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  discipline: artisticDisciplineEnum("discipline").notNull(),
  portfolio: text("portfolio"),
  artisticStatement: text("artistic_statement"),
  diversityType: text("diversity_type"),
  internalNotes: text("internal_notes"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Interactions table
export const interactions = pgTable("interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: 'cascade' }),
  type: interactionTypeEnum("type").notNull(),
  date: timestamp("date").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Accompaniment Plans table
export const accompanimentPlans = pgTable("accompaniment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: 'cascade' }),
  objective: text("objective").notNull(),
  steps: jsonb("steps").$type<{ id: string; description: string; completed: boolean; assignedTo?: string }[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Opportunities table
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // grant, residency, call_for_projects, etc.
  eligibilityCriteria: text("eligibility_criteria"),
  amount: text("amount"),
  deadline: timestamp("deadline").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: 'cascade' }),
  opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  status: applicationStatusEnum("status").notNull().default('draft'),
  fundingAmount: integer("funding_amount"), // Amount obtained if accepted
  submittedDate: timestamp("submitted_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  type: text("type").notNull(), // cv, grant_draft, budget, etc.
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  artistId: varchar("artist_id").references(() => artists.id, { onDelete: 'cascade' }), // null for internal tasks
  status: taskStatusEnum("status").notNull().default('todo'),
  priority: taskPriorityEnum("priority").notNull().default('medium'),
  assignedTo: text("assigned_to"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Waitlist table
export const waitlist = pgTable("waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: waitlistStatusEnum("status").notNull().default('waiting'),
  position: integer("position").notNull(), // Priority position in queue
  exclusiveLink: text("exclusive_link"),
  contactedAt: timestamp("contacted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email Campaigns table
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  segmentCriteria: jsonb("segment_criteria").$type<{
    disciplines?: string[];
    diversityTypes?: string[];
    hasAccompaniment?: boolean;
    minInteractions?: number;
  }>(),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Resources table (venues, equipment rental, services)
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: resourceTypeEnum("type").notNull(),
  description: text("description"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  website: text("website"),
  pricing: text("pricing"), // Info sur tarifs/prix
  capacity: integer("capacity"), // Pour les salles
  availability: text("availability"), // Notes sur disponibilité
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const artistsRelations = relations(artists, ({ many }) => ({
  interactions: many(interactions),
  accompanimentPlans: many(accompanimentPlans),
  applications: many(applications),
  documents: many(documents),
  tasks: many(tasks),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  artist: one(artists, {
    fields: [interactions.artistId],
    references: [artists.id],
  }),
}));

export const accompanimentPlansRelations = relations(accompanimentPlans, ({ one }) => ({
  artist: one(artists, {
    fields: [accompanimentPlans.artistId],
    references: [artists.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  artist: one(artists, {
    fields: [applications.artistId],
    references: [artists.id],
  }),
  opportunity: one(opportunities, {
    fields: [applications.opportunityId],
    references: [opportunities.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ many }) => ({
  applications: many(applications),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  artist: one(artists, {
    fields: [documents.artistId],
    references: [artists.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  artist: one(artists, {
    fields: [tasks.artistId],
    references: [artists.id],
  }),
}));

// Insert and Select Types
export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  createdAt: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.coerce.date(),
});

export const insertAccompanimentPlanSchema = createInsertSchema(accompanimentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
}).extend({
  deadline: z.coerce.date(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dueDate: z.coerce.date(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

export type AccompanimentPlan = typeof accompanimentPlans.$inferSelect;
export type InsertAccompanimentPlan = z.infer<typeof insertAccompanimentPlanSchema>;

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type WaitlistEntry = typeof waitlist.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistSchema>;

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

// Outlook Calendar Event schemas (not stored in DB, used for API validation)
export const outlookEventTimeSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string(),
});

export const outlookEventLocationSchema = z.object({
  displayName: z.string(),
}).optional();

export const outlookEventAttendeeSchema = z.object({
  emailAddress: z.object({
    address: z.string().email(),
    name: z.string().optional(),
  }),
  type: z.enum(["required", "optional", "resource"]),
});

export const outlookEventBodySchema = z.object({
  contentType: z.enum(["text", "html"]),
  content: z.string(),
}).optional();

export const createOutlookEventSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  start: outlookEventTimeSchema,
  end: outlookEventTimeSchema,
  location: outlookEventLocationSchema,
  attendees: z.array(outlookEventAttendeeSchema).optional(),
  body: outlookEventBodySchema,
});

export const syncOutlookEventSchema = z.object({
  artistId: z.string().min(1, "Artist ID is required"),
});

export type CreateOutlookEvent = z.infer<typeof createOutlookEventSchema>;
export type SyncOutlookEvent = z.infer<typeof syncOutlookEventSchema>;
