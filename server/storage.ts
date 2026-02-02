// Reference: javascript_database blueprint integration
import {
  artists,
  interactions,
  accompanimentPlans,
  opportunities,
  applications,
  documents,
  tasks,
  waitlist,
  emailCampaigns,
  resources,
  artistNotes,
  teamMembers,
  type Artist,
  type InsertArtist,
  type Interaction,
  type InsertInteraction,
  type AccompanimentPlan,
  type InsertAccompanimentPlan,
  type Opportunity,
  type InsertOpportunity,
  type Application,
  type InsertApplication,
  type Document,
  type InsertDocument,
  type Task,
  type InsertTask,
  type WaitlistEntry,
  type InsertWaitlistEntry,
  type EmailCampaign,
  type InsertEmailCampaign,
  type Resource,
  type InsertResource,
  type ArtistNote,
  type InsertArtistNote,
  type TeamMember,
  type InsertTeamMember,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, inArray, desc } from "drizzle-orm";

export interface IStorage {
  // Artists
  getArtist(id: string): Promise<Artist | undefined>;
  getAllArtists(): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: string, artist: Partial<InsertArtist>): Promise<Artist | undefined>;
  deleteArtist(id: string): Promise<void>;

  // Interactions
  getInteraction(id: string): Promise<Interaction | undefined>;
  getArtistInteractions(artistId: string): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  deleteInteraction(id: string): Promise<void>;

  // Accompaniment Plans
  getArtistAccompanimentPlans(artistId: string): Promise<AccompanimentPlan[]>;
  createAccompanimentPlan(plan: InsertAccompanimentPlan): Promise<AccompanimentPlan>;
  updateAccompanimentPlan(id: string, plan: Partial<InsertAccompanimentPlan>): Promise<AccompanimentPlan | undefined>;

  // Opportunities
  getOpportunity(id: string): Promise<Opportunity | undefined>;
  getAllOpportunities(): Promise<Opportunity[]>;
  getUpcomingOpportunities(): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: string, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: string): Promise<void>;

  // Applications
  getApplication(id: string): Promise<Application | undefined>;
  getArtistApplications(artistId: string): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<void>;

  // Documents
  getArtistDocuments(artistId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTodayTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  // Waitlist
  getAllWaitlistEntries(): Promise<WaitlistEntry[]>;
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  updateWaitlistEntry(id: string, entry: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry | undefined>;
  deleteWaitlistEntry(id: string): Promise<void>;

  // Email Campaigns
  getAllCampaigns(): Promise<EmailCampaign[]>;
  createCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateCampaign(id: string, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined>;

  // Resources
  getResource(id: string): Promise<Resource | undefined>;
  getAllResources(): Promise<Resource[]>;
  getResourcesByType(type: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: string): Promise<void>;

  // Artist Notes
  getArtistNotes(artistId: string): Promise<ArtistNote[]>;
  createArtistNote(note: InsertArtistNote): Promise<ArtistNote>;
  deleteArtistNote(id: string): Promise<void>;

  // Team Members
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMemberByName(name: string): Promise<TeamMember | undefined>;
  getTeamMemberByEmail(email: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<void>;

  // Campaign
  getCampaign(id: string): Promise<EmailCampaign | undefined>;

  // Stats & Reports
  getStats(): Promise<{
    totalArtists: number;
    pendingApplications: number;
    totalFunding: number;
    activeTasks: number;
  }>;
  getReportData(filters: { timeRange?: string; discipline?: string }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Artists
  async getArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist || undefined;
  }

  async getAllArtists(): Promise<Artist[]> {
    return await db.select().from(artists).orderBy(desc(artists.createdAt));
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(insertArtist).returning();
    return artist;
  }

  async updateArtist(id: string, insertArtist: Partial<InsertArtist>): Promise<Artist | undefined> {
    const [artist] = await db.update(artists).set(insertArtist).where(eq(artists.id, id)).returning();
    return artist || undefined;
  }

  async deleteArtist(id: string): Promise<void> {
    await db.delete(artists).where(eq(artists.id, id));
  }

  // Interactions
  async getInteraction(id: string): Promise<Interaction | undefined> {
    const [interaction] = await db.select().from(interactions).where(eq(interactions.id, id));
    return interaction || undefined;
  }

  async getArtistInteractions(artistId: string): Promise<Interaction[]> {
    return await db.select().from(interactions).where(eq(interactions.artistId, artistId)).orderBy(desc(interactions.date));
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const [interaction] = await db.insert(interactions).values(insertInteraction).returning();
    return interaction;
  }

  async deleteInteraction(id: string): Promise<void> {
    await db.delete(interactions).where(eq(interactions.id, id));
  }

  // Accompaniment Plans
  async getArtistAccompanimentPlans(artistId: string): Promise<AccompanimentPlan[]> {
    return await db.select().from(accompanimentPlans).where(eq(accompanimentPlans.artistId, artistId));
  }

  async createAccompanimentPlan(plan: InsertAccompanimentPlan): Promise<AccompanimentPlan> {
    const [accompanimentPlan] = await db.insert(accompanimentPlans).values(plan).returning();
    return accompanimentPlan;
  }

  async updateAccompanimentPlan(id: string, plan: Partial<InsertAccompanimentPlan>): Promise<AccompanimentPlan | undefined> {
    const [accompanimentPlan] = await db.update(accompanimentPlans).set(plan).where(eq(accompanimentPlans.id, id)).returning();
    return accompanimentPlan || undefined;
  }

  // Opportunities
  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity || undefined;
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).orderBy(opportunities.deadline);
  }

  async getUpcomingOpportunities(): Promise<Opportunity[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    return await db.select()
      .from(opportunities)
      .where(and(
        gte(opportunities.deadline, today),
        lte(opportunities.deadline, futureDate)
      ))
      .orderBy(opportunities.deadline)
      .limit(5);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db.insert(opportunities).values(insertOpportunity).returning();
    return opportunity;
  }

  async updateOpportunity(id: string, insertOpportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const [opportunity] = await db.update(opportunities).set(insertOpportunity).where(eq(opportunities.id, id)).returning();
    return opportunity || undefined;
  }

  async deleteOpportunity(id: string): Promise<void> {
    await db.delete(opportunities).where(eq(opportunities.id, id));
  }

  // Applications
  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getArtistApplications(artistId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.artistId, artistId)).orderBy(desc(applications.createdAt));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async updateApplication(id: string, insertApplication: Partial<InsertApplication>): Promise<Application | undefined> {
    const [application] = await db.update(applications).set(insertApplication).where(eq(applications.id, id)).returning();
    return application || undefined;
  }

  async deleteApplication(id: string): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  // Documents
  async getArtistDocuments(artistId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.artistId, artistId)).orderBy(desc(documents.uploadedAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTodayTasks(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.select()
      .from(tasks)
      .where(
        and(
          inArray(tasks.status, ['todo', 'in_progress']),
          gte(tasks.dueDate, today),
          lte(tasks.dueDate, tomorrow)
        )
      )
      .orderBy(tasks.priority);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, insertTask: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.update(tasks).set(insertTask).where(eq(tasks.id, id)).returning();
    return task || undefined;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Waitlist
  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlist).orderBy(waitlist.position);
  }

  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [waitlistEntry] = await db.insert(waitlist).values(entry).returning();
    return waitlistEntry;
  }

  async updateWaitlistEntry(id: string, entry: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry | undefined> {
    const [waitlistEntry] = await db.update(waitlist).set(entry).where(eq(waitlist.id, id)).returning();
    return waitlistEntry || undefined;
  }

  async deleteWaitlistEntry(id: string): Promise<void> {
    await db.delete(waitlist).where(eq(waitlist.id, id));
  }

  // Email Campaigns
  async getAllCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async createCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [emailCampaign] = await db.insert(emailCampaigns).values(campaign).returning();
    return emailCampaign;
  }

  async updateCampaign(id: string, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined> {
    const [emailCampaign] = await db.update(emailCampaigns).set(campaign).where(eq(emailCampaigns.id, id)).returning();
    return emailCampaign || undefined;
  }

  // Stats & Reports
  async getStats(): Promise<{
    totalArtists: number;
    pendingApplications: number;
    totalFunding: number;
    activeTasks: number;
  }> {
    const [artistsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(artists);
    const [pendingAppsCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(inArray(applications.status, ['in_progress', 'submitted']));
    
    const [fundingSum] = await db.select({ 
      total: sql<number>`coalesce(sum(${applications.fundingAmount}), 0)::int` 
    })
      .from(applications)
      .where(eq(applications.status, 'accepted'));
    
    const [activeTasksCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(inArray(tasks.status, ['todo', 'in_progress']));

    return {
      totalArtists: artistsCount.count,
      pendingApplications: pendingAppsCount.count,
      totalFunding: fundingSum.total,
      activeTasks: activeTasksCount.count,
    };
  }

  async getReportData(filters: { timeRange?: string; discipline?: string }): Promise<any> {
    // Calculate date range based on timeRange filter
    let dateFilter: any = undefined;
    const now = new Date();
    
    if (filters.timeRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      dateFilter = gte(applications.submittedDate, monthAgo);
    } else if (filters.timeRange === 'quarter') {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(now.getMonth() - 3);
      dateFilter = gte(applications.submittedDate, quarterAgo);
    } else if (filters.timeRange === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      dateFilter = gte(applications.submittedDate, yearAgo);
    }

    // Get all artists (filter by discipline if specified)
    const filteredArtists = filters.discipline && filters.discipline !== 'all'
      ? await db.select().from(artists).where(eq(artists.discipline, filters.discipline as any))
      : await db.select().from(artists);

    // Get applications with optional filters
    let filteredApplications: Application[];
    
    if (filters.discipline && filters.discipline !== 'all') {
      // If discipline filter is set, join with artists to filter applications
      const artistIds = filteredArtists.map(a => a.id);
      
      if (artistIds.length === 0) {
        // No artists match the discipline, so no applications either
        filteredApplications = [];
      } else if (dateFilter) {
        filteredApplications = await db.select().from(applications)
          .where(and(
            inArray(applications.artistId, artistIds),
            dateFilter
          ));
      } else {
        filteredApplications = await db.select().from(applications)
          .where(inArray(applications.artistId, artistIds));
      }
    } else {
      // No discipline filter, just apply date filter if present
      filteredApplications = dateFilter
        ? await db.select().from(applications).where(dateFilter)
        : await db.select().from(applications);
    }

    // Calculate byDiscipline - count artists by discipline
    const disciplineCounts: Record<string, number> = {};
    filteredArtists.forEach(artist => {
      const discipline = artist.discipline || 'other';
      disciplineCounts[discipline] = (disciplineCounts[discipline] || 0) + 1;
    });

    const byDiscipline = Object.entries(disciplineCounts).map(([discipline, count]) => ({
      discipline: this.translateDiscipline(discipline),
      count
    }));

    // Calculate byStatus - count applications by status
    const statusCounts: Record<string, number> = {
      draft: 0,
      in_progress: 0,
      submitted: 0,
      accepted: 0,
      rejected: 0
    };
    
    filteredApplications.forEach(app => {
      const status = app.status || 'draft';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: this.translateStatus(status),
      count
    }));

    // Calculate fundingByMonth - aggregate funding by month
    const fundingByMonth: Record<string, number> = {};
    
    filteredApplications
      .filter(app => app.status === 'accepted' && app.submittedDate)
      .forEach(app => {
        const date = new Date(app.submittedDate!);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        fundingByMonth[monthKey] = (fundingByMonth[monthKey] || 0) + (app.fundingAmount || 0);
      });

    // Convert to array and sort by month
    const fundingByMonthArray = Object.entries(fundingByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: this.formatMonth(month),
        amount
      }));

    return {
      totalArtists: filteredArtists.length,
      totalApplications: filteredApplications.length,
      acceptedApplications: filteredApplications.filter(a => a.status === 'accepted').length,
      totalFunding: filteredApplications
        .filter(a => a.status === 'accepted')
        .reduce((sum, a) => sum + (a.fundingAmount || 0), 0),
      byDiscipline,
      byStatus,
      fundingByMonth: fundingByMonthArray,
    };
  }

  // Resources
  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.type, type)).orderBy(resources.name);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }

  async updateResource(id: string, insertResource: Partial<InsertResource>): Promise<Resource | undefined> {
    const [resource] = await db.update(resources)
      .set({ ...insertResource, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return resource || undefined;
  }

  async deleteResource(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  // Artist Notes
  async getArtistNotes(artistId: string): Promise<ArtistNote[]> {
    return await db.select().from(artistNotes).where(eq(artistNotes.artistId, artistId)).orderBy(desc(artistNotes.sessionDate));
  }

  async createArtistNote(note: InsertArtistNote): Promise<ArtistNote> {
    const [artistNote] = await db.insert(artistNotes).values(note).returning();
    return artistNote;
  }

  async deleteArtistNote(id: string): Promise<void> {
    await db.delete(artistNotes).where(eq(artistNotes.id, id));
  }

  // Team Members
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).orderBy(teamMembers.name);
  }

  async getTeamMemberByName(name: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.name, name));
    return member || undefined;
  }

  async getTeamMemberByEmail(email: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.email, email));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [teamMember] = await db.insert(teamMembers).values(member).returning();
    return teamMember;
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db.update(teamMembers).set(member).where(eq(teamMembers.id, id)).returning();
    return updated || undefined;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  // Campaign
  async getCampaign(id: string): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return campaign || undefined;
  }

  private translateDiscipline(discipline: string): string {
    const translations: Record<string, string> = {
      visual_arts: 'Arts visuels',
      music: 'Musique',
      theater: 'Théâtre',
      dance: 'Danse',
      literature: 'Littérature',
      other: 'Autre'
    };
    return translations[discipline] || discipline;
  }

  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      draft: 'Brouillon',
      in_progress: 'En cours',
      submitted: 'Soumise',
      accepted: 'Acceptée',
      rejected: 'Refusée'
    };
    return translations[status] || status;
  }

  private formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }
}

export const storage = new DatabaseStorage();
