import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertArtistSchema,
  insertOpportunitySchema,
  insertInteractionSchema,
  insertTaskSchema,
  insertApplicationSchema,
  insertDocumentSchema,
  insertWaitlistSchema,
  insertEmailCampaignSchema,
  insertAccompanimentPlanSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Artists endpoints
  app.get("/api/artists", async (_req, res) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ error: "Failed to fetch artists" });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
    try {
      const artist = await storage.getArtist(req.params.id);
      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ error: "Failed to fetch artist" });
    }
  });

  app.post("/api/artists", async (req, res) => {
    try {
      const validatedData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(validatedData);
      res.status(201).json(artist);
    } catch (error) {
      console.error("Error creating artist:", error);
      res.status(400).json({ error: "Invalid artist data" });
    }
  });

  app.patch("/api/artists/:id", async (req, res) => {
    try {
      const artist = await storage.updateArtist(req.params.id, req.body);
      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      console.error("Error updating artist:", error);
      res.status(500).json({ error: "Failed to update artist" });
    }
  });

  app.delete("/api/artists/:id", async (req, res) => {
    try {
      await storage.deleteArtist(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting artist:", error);
      res.status(500).json({ error: "Failed to delete artist" });
    }
  });

  // Interactions endpoints
  app.get("/api/artists/:id/interactions", async (req, res) => {
    try {
      const interactions = await storage.getArtistInteractions(req.params.id);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  app.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(validatedData);
      res.status(201).json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(400).json({ error: "Invalid interaction data" });
    }
  });

  // Accompaniment Plans endpoints
  app.get("/api/artists/:id/plans", async (req, res) => {
    try {
      const plans = await storage.getArtistAccompanimentPlans(req.params.id);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching accompaniment plans:", error);
      res.status(500).json({ error: "Failed to fetch accompaniment plans" });
    }
  });

  app.post("/api/plans", async (req, res) => {
    try {
      const validatedData = insertAccompanimentPlanSchema.parse(req.body);
      const plan = await storage.createAccompanimentPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating accompaniment plan:", error);
      res.status(400).json({ error: "Invalid accompaniment plan data" });
    }
  });

  app.patch("/api/plans/:id", async (req, res) => {
    try {
      const plan = await storage.updateAccompanimentPlan(req.params.id, req.body);
      if (!plan) {
        return res.status(404).json({ error: "Accompaniment plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error updating accompaniment plan:", error);
      res.status(500).json({ error: "Failed to update accompaniment plan" });
    }
  });

  // Applications endpoints
  app.get("/api/artists/:id/applications", async (req, res) => {
    try {
      const applications = await storage.getArtistApplications(req.params.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const application = await storage.updateApplication(req.params.id, req.body);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Documents endpoints
  app.get("/api/artists/:id/documents", async (req, res) => {
    try {
      const documents = await storage.getArtistDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Setup multer for file uploads
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const multerStorage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png"
  ];

  const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé. Seuls PDF, DOC, DOCX, JPG et PNG sont acceptés."));
    }
  };

  const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter
  });

  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { title, type, artistId } = req.body;
      if (!title || !type || !artistId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const document = await storage.createDocument({
        artistId,
        title,
        type,
        fileUrl,
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Fichier trop volumineux (max 10MB)" });
        }
      }
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      // Get document to find file path
      const doc = await storage.getArtistDocuments("dummy"); // This is a hack, need better method
      // TODO: Add getDocument method to storage
      
      await storage.deleteDocument(req.params.id);
      
      // TODO: Delete physical file from uploads directory
      // Note: For production, this should use object storage deletion
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Opportunities endpoints
  app.get("/api/opportunities", async (_req, res) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const opportunity = await storage.getOpportunity(req.params.id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      res.status(500).json({ error: "Failed to fetch opportunity" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const validatedData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(validatedData);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      res.status(400).json({ error: "Invalid opportunity data" });
    }
  });

  app.patch("/api/opportunities/:id", async (req, res) => {
    try {
      const opportunity = await storage.updateOpportunity(req.params.id, req.body);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      console.error("Error updating opportunity:", error);
      res.status(500).json({ error: "Failed to update opportunity" });
    }
  });

  app.delete("/api/opportunities/:id", async (req, res) => {
    try {
      await storage.deleteOpportunity(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      res.status(500).json({ error: "Failed to delete opportunity" });
    }
  });

  // Tasks endpoints
  app.get("/api/tasks", async (_req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/today", async (_req, res) => {
    try {
      const tasks = await storage.getTodayTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      res.status(500).json({ error: "Failed to fetch today's tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Waitlist endpoints
  app.get("/api/waitlist", async (_req, res) => {
    try {
      const waitlist = await storage.getAllWaitlistEntries();
      res.json(waitlist);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      res.status(500).json({ error: "Failed to fetch waitlist" });
    }
  });

  app.post("/api/waitlist", async (req, res) => {
    try {
      const validatedData = insertWaitlistSchema.parse(req.body);
      const entry = await storage.createWaitlistEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating waitlist entry:", error);
      res.status(400).json({ error: "Invalid waitlist data" });
    }
  });

  app.patch("/api/waitlist/:id", async (req, res) => {
    try {
      const entry = await storage.updateWaitlistEntry(req.params.id, req.body);
      if (!entry) {
        return res.status(404).json({ error: "Waitlist entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error updating waitlist entry:", error);
      res.status(500).json({ error: "Failed to update waitlist entry" });
    }
  });

  // Email Campaigns endpoints
  app.get("/api/campaigns", async (_req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertEmailCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ error: "Invalid campaign data" });
    }
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  // Stats and Reports endpoints
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/deadlines/upcoming", async (_req, res) => {
    try {
      const deadlines = await storage.getUpcomingOpportunities();
      res.json(deadlines);
    } catch (error) {
      console.error("Error fetching upcoming deadlines:", error);
      res.status(500).json({ error: "Failed to fetch deadlines" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const filters = {
        timeRange: req.query.timeRange as string,
        discipline: req.query.discipline as string,
      };
      const reportData = await storage.getReportData(filters);
      res.json(reportData);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
