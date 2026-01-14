import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
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
      return res.status(500).json({ 
        error: "Failed to subscribe to newsletter" 
      });
    }
  });

  return httpServer;
}
