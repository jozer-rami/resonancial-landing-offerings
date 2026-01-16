import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { config } from "./config";
import { z } from "zod";
import { getDiscountCodeBySubscriberId } from "./services/discount-code";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint - used by Railway/Render for health monitoring
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || "1.0.0",
    });
  });

  // Newsletter subscription with discount code delivery
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

      const subscriberData = validationResult.data;

      // Validate WhatsApp data if WhatsApp is selected
      if (subscriberData.contactPreference === "whatsapp") {
        if (!subscriberData.phone || !subscriberData.phoneCountryCode) {
          return res.status(400).json({
            error: "Se requiere número de teléfono para recibir el código por WhatsApp"
          });
        }
        if (!subscriberData.consentWhatsapp) {
          return res.status(400).json({
            error: "Se requiere consentimiento para recibir mensajes por WhatsApp"
          });
        }
      }

      // Check if already subscribed
      const existingSubscriber = await storage.getSubscriberByEmail(subscriberData.email);
      if (existingSubscriber) {
        // Get existing discount code if any
        const existingCode = await getDiscountCodeBySubscriberId(existingSubscriber.id);
        return res.status(200).json({
          message: "Already subscribed",
          subscriber: existingSubscriber,
          discountCode: existingCode ? {
            code: existingCode.code,
            value: "10%",
            expiresAt: existingCode.expiresAt,
            redeemed: !!existingCode.redeemedAt,
          } : null
        });
      }

      // Subscribe and generate discount code
      const result = await storage.subscribeWithDiscountCode(subscriberData);

      return res.status(201).json({
        message: "Successfully subscribed",
        subscriber: result.subscriber,
        discountCode: {
          code: result.discountCode.code,
          value: "10%",
          expiresAt: result.discountCode.expiresAt,
          deliveryChannel: result.discountCode.deliveryChannel,
          deliveryStatus: result.deliveryStatus,
        }
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

  // Discount code validation endpoint
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const schema = z.object({
        code: z.string().min(1, "Code is required"),
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        const readableError = fromZodError(validationResult.error);
        return res.status(400).json({ error: readableError.message });
      }

      const { code } = validationResult.data;
      const result = await storage.validateCode(code);

      if (!result.valid) {
        return res.status(400).json({
          valid: false,
          error: result.error,
        });
      }

      return res.json({
        valid: true,
        code: result.code?.code,
        type: result.code?.type,
        value: parseFloat(result.code?.value || "10"),
        expiresAt: result.code?.expiresAt,
      });
    } catch (error) {
      console.error("Discount code validation error:", error);
      return res.status(500).json({
        valid: false,
        error: "Error validating discount code",
      });
    }
  });

  // Discount code redemption endpoint
  app.post("/api/discount-codes/redeem", async (req, res) => {
    try {
      const schema = z.object({
        code: z.string().min(1, "Code is required"),
        orderId: z.string().min(1, "Order ID is required"),
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        const readableError = fromZodError(validationResult.error);
        return res.status(400).json({ error: readableError.message });
      }

      const { code, orderId } = validationResult.data;
      const result = await storage.redeemCode(code, orderId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        message: "Discount code redeemed successfully",
      });
    } catch (error) {
      console.error("Discount code redemption error:", error);
      return res.status(500).json({
        success: false,
        error: "Error redeeming discount code",
      });
    }
  });

  return httpServer;
}
