import { Request, Response, NextFunction } from "express";
import { config } from "../config/environment.js";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
  switch (err.code) {
    case "P2002":
      return new AppError("Duplicate field value: " + err.meta?.target, 409);
    case "P2025":
      return new AppError("Record not found", 404);
    default:
      return new AppError(`Database Error: ${err.message}`, 500);
  }
};

const handleZodError = (err: ZodError) => {
  const message = err.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
  return new AppError(`Validation Error: ${message}`, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof jwt.JsonWebTokenError) {
    error = handleJWTError();
  } else if (err instanceof jwt.TokenExpiredError) {
    error = handleJWTExpiredError();
  } else if (err instanceof SyntaxError && "body" in err) {
    error = new AppError("Invalid JSON payload", 400);
  }

  if (!(error instanceof AppError)) {
    error = new AppError(err.message || "Internal Server Error", 500, false);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";

  // Log unexpected errors
  if (statusCode === 500) {
    console.error("💥 Unexpected Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.server.nodeEnv === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
