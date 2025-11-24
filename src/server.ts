import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import config from "./config/environment.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rateLimiter.middleware.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import qrCodeRoutes from "./routes/qrCode.routes.js";
import shopBannerRoutes from "./routes/shopBanner.routes.js";
import widgetRoutes from "./routes/widget.routes.js";
import shopUserRoutes from "./routes/shopUser.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import tierRoutes from "./routes/tier.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import rewardRoutes from "./routes/rewards.routes.js";
import locationRoutes from "./routes/location.route.js";
import redemptionRoutes from "./routes/redemption.routes.js";

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
      })
    );

    // Compression
    this.app.use(compression());

    // Logging
    if (config.server.nodeEnv === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Serve static files (uploaded images)
    this.app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "uploads"))
    );

    // Rate limiting
    this.app.use(generalLimiter);
  }

  private configureRoutes(): void {
    const apiPrefix = config.server.apiPrefix;

    // Health check
    this.app.get("/health", (_req, res) => {
      res.json({
        success: true,
        message: "Server is running",
        environment: config.server.nodeEnv,
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/customers`, customerRoutes);
    this.app.use(`${apiPrefix}/profiles`, profileRoutes);
    this.app.use(`${apiPrefix}/qr-codes`, qrCodeRoutes);
    this.app.use(`${apiPrefix}/shop-banners`, shopBannerRoutes);
    this.app.use(`${apiPrefix}/widgets`, widgetRoutes);
    this.app.use(`${apiPrefix}/shop-users`, shopUserRoutes);
    this.app.use(`${apiPrefix}/menus`, menuRoutes);
    this.app.use(`${apiPrefix}/promotions`, promotionRoutes);
    this.app.use(`${apiPrefix}/tiers`, tierRoutes);
    this.app.use(`${apiPrefix}/challenges`, challengeRoutes);
    this.app.use(`${apiPrefix}/rewards`, rewardRoutes);
    this.app.use(`${apiPrefix}/locations`, locationRoutes);
    this.app.use(`${apiPrefix}/redemptions`, redemptionRoutes);

    // 404 handler
    this.app.use(notFoundHandler);
  }

  private configureErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Start server
      const server = this.app.listen(config.server.port, () => {
        console.log("═══════════════════════════════════════════════════════");
        console.log(`🚀 Server running in ${config.server.nodeEnv} mode`);
        console.log(`📡 HTTP Server: http://localhost:${config.server.port}`);
        console.log(`📚 API Prefix: ${config.server.apiPrefix}`);
        console.log("═══════════════════════════════════════════════════════");
      });

      // Graceful shutdown
      const shutdown = () => {
        console.log("Received kill signal, shutting down gracefully");
        server.close(() => {
          console.log("Closed out remaining connections");
          process.exit(0);
        });
      };

      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start();

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(reason.name, reason.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(error.name, error.message);
  process.exit(1);
});

export default server;
