import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register route with /api prefix
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      console.log("[Newsletter] Received subscription request:", { body: req.body, path: req.path, url: req.url });
      const validationResult = insertNewsletterSubscriberSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const readableError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: readableError.message 
        });
      }

      const { email } = validationResult.data;

      // Check if already subscribed
      const existingSubscriber = await storage.getSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(200).json({ 
          message: "Already subscribed",
          subscriber: existingSubscriber 
        });
      }

      // Subscribe new email
      const subscriber = await storage.subscribeToNewsletter({ email });
      
      return res.status(201).json({ 
        message: "Successfully subscribed",
        subscriber 
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined;
      return res.status(500).json({ 
        error: "Failed to subscribe to newsletter",
        message: errorMessage,
        ...(errorStack && { stack: errorStack })
      });
    }
  });

  // Also register without /api prefix (in case Vercel strips it)
  app.post("/newsletter/subscribe", async (req, res) => {
    try {
      console.log("[Newsletter] Received subscription request (no /api prefix):", { body: req.body, path: req.path, url: req.url });
      const validationResult = insertNewsletterSubscriberSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const readableError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: readableError.message 
        });
      }

      const { email } = validationResult.data;

      // Check if already subscribed
      const existingSubscriber = await storage.getSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(200).json({ 
          message: "Already subscribed",
          subscriber: existingSubscriber 
        });
      }

      // Subscribe new email
      const subscriber = await storage.subscribeToNewsletter({ email });
      
      return res.status(201).json({ 
        message: "Successfully subscribed",
        subscriber 
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined;
      return res.status(500).json({ 
        error: "Failed to subscribe to newsletter",
        message: errorMessage,
        ...(errorStack && { stack: errorStack })
      });
    }
  });

  return httpServer;
}
