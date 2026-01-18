import type { Express, Request } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { config } from "./config";
import { z } from "zod";
import { getDiscountCodeBySubscriberId } from "./services/discount-code";
import { loggers } from "./lib/logger";

const logger = loggers.routes;

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
  app.post("/api/newsletter/subscribe", async (req: Request, res) => {
    const reqLogger = logger.withRequestId(req.requestId);

    try {
      reqLogger.info("Newsletter subscription request received", {
        email: req.body?.email,
        contactPreference: req.body?.contactPreference,
        hasPhone: !!req.body?.phone,
      });

      const validationResult = insertNewsletterSubscriberSchema.safeParse(req.body);

      if (!validationResult.success) {
        const readableError = fromZodError(validationResult.error);
        reqLogger.warn("Validation failed", {
          error: readableError.message,
          fields: validationResult.error.errors.map((e) => e.path.join(".")),
        });
        return res.status(400).json({
          error: readableError.message
        });
      }

      const subscriberData = validationResult.data;

      // Validate WhatsApp data if WhatsApp is selected
      if (subscriberData.contactPreference === "whatsapp") {
        if (!subscriberData.phone || !subscriberData.phoneCountryCode) {
          reqLogger.warn("WhatsApp selected but phone missing", {
            email: subscriberData.email,
          });
          return res.status(400).json({
            error: "Se requiere número de teléfono para recibir el código por WhatsApp"
          });
        }
        if (!subscriberData.consentWhatsapp) {
          reqLogger.warn("WhatsApp selected but consent missing", {
            email: subscriberData.email,
          });
          return res.status(400).json({
            error: "Se requiere consentimiento para recibir mensajes por WhatsApp"
          });
        }
      }

      // Check if already subscribed
      const existingSubscriber = await storage.getSubscriberByEmail(subscriberData.email);
      if (existingSubscriber) {
        reqLogger.info("Subscriber already exists", {
          subscriberId: existingSubscriber.id,
          email: subscriberData.email,
        });
        // Get existing discount code if any
        const existingCode = await getDiscountCodeBySubscriberId(existingSubscriber.id);
        return res.status(200).json({
          message: "Already subscribed",
          isExisting: true,
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
      reqLogger.debug("Creating new subscriber with discount code", {
        email: subscriberData.email,
        contactPreference: subscriberData.contactPreference,
      });

      const result = await storage.subscribeWithDiscountCode(subscriberData);

      reqLogger.info("Subscriber created successfully", {
        subscriberId: result.subscriber.id,
        email: subscriberData.email,
        discountCode: result.discountCode.code,
        deliveryChannel: result.discountCode.deliveryChannel,
        deliveryStatus: result.deliveryStatus,
      });

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
      reqLogger.errorWithData(
        "Newsletter subscription failed",
        {
          email: req.body?.email,
          errorType: error instanceof Error ? error.constructor.name : "Unknown",
        },
        error instanceof Error ? error : new Error(String(error))
      );
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
  app.post("/api/discount-codes/validate", async (req: Request, res) => {
    const reqLogger = logger.withRequestId(req.requestId);

    try {
      const schema = z.object({
        code: z.string().min(1, "Code is required"),
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        const readableError = fromZodError(validationResult.error);
        reqLogger.warn("Validation failed", { error: readableError.message });
        return res.status(400).json({ error: readableError.message });
      }

      const { code } = validationResult.data;
      reqLogger.info("Validating discount code", { code });

      const result = await storage.validateCode(code);

      if (!result.valid) {
        reqLogger.warn("Discount code validation failed", {
          code,
          error: result.error,
        });
        return res.status(400).json({
          valid: false,
          error: result.error,
        });
      }

      reqLogger.info("Discount code validated successfully", {
        code,
        type: result.code?.type,
      });

      return res.json({
        valid: true,
        code: result.code?.code,
        type: result.code?.type,
        value: parseFloat(result.code?.value || "10"),
        expiresAt: result.code?.expiresAt,
      });
    } catch (error) {
      reqLogger.errorWithData(
        "Discount code validation error",
        { code: req.body?.code },
        error instanceof Error ? error : new Error(String(error))
      );
      return res.status(500).json({
        valid: false,
        error: "Error validating discount code",
      });
    }
  });

  // Discount code redemption endpoint
  app.post("/api/discount-codes/redeem", async (req: Request, res) => {
    const reqLogger = logger.withRequestId(req.requestId);

    try {
      const schema = z.object({
        code: z.string().min(1, "Code is required"),
        orderId: z.string().min(1, "Order ID is required"),
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        const readableError = fromZodError(validationResult.error);
        reqLogger.warn("Validation failed", { error: readableError.message });
        return res.status(400).json({ error: readableError.message });
      }

      const { code, orderId } = validationResult.data;
      reqLogger.info("Redeeming discount code", { code, orderId });

      const result = await storage.redeemCode(code, orderId);

      if (!result.success) {
        reqLogger.warn("Discount code redemption failed", {
          code,
          orderId,
          error: result.error,
        });
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      reqLogger.info("Discount code redeemed successfully", { code, orderId });

      return res.json({
        success: true,
        message: "Discount code redeemed successfully",
      });
    } catch (error) {
      reqLogger.errorWithData(
        "Discount code redemption error",
        { code: req.body?.code, orderId: req.body?.orderId },
        error instanceof Error ? error : new Error(String(error))
      );
      return res.status(500).json({
        success: false,
        error: "Error redeeming discount code",
      });
    }
  });

  return httpServer;
}
