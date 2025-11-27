import admin from "firebase-admin";
import { config } from "../config/environment.js";
import { NotificationRepository } from "../repositories/notification.repository.js";
import { CustomerRepository } from "../repositories/customer.repository.js";
import { NotificationType, Notification } from "@prisma/client";
import path from "path";
import fs from "fs";

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private customerRepository: CustomerRepository;
  private firebaseInitialized = false;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.customerRepository = new CustomerRepository();
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const serviceAccountPath = path.resolve(
          process.cwd(),
          config.firebase.serviceAccountPath
        );

        if (fs.existsSync(serviceAccountPath)) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountPath, "utf8")
          );

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          this.firebaseInitialized = true;
          console.log("Firebase initialized successfully");
        } else {
          console.warn(
            `Firebase service account file not found at ${serviceAccountPath}`
          );
        }
      } else {
        this.firebaseInitialized = true;
      }
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }
  }

  async sendNotification(
    title: string,
    body: string,
    type: NotificationType,
    createdBy: number
  ): Promise<Notification> {
    // 1. Create Notification in DB
    const notification = await this.notificationRepository.create({
      title,
      body,
      type,
      createdBy,
    });

    // 2. Send Push Notification
    if (this.firebaseInitialized) {
      await this.sendPushNotification(title, body, type);
    }

    return notification;
  }

  private async sendPushNotification(
    title: string,
    body: string,
    type: NotificationType
  ) {
    let tokens: string[] =
      await this.customerRepository.getAllActiveDeviceTokens();

    if (tokens.length > 0) {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: {
          type,
        },
        tokens,
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(
          `Sent ${response.successCount} messages; failed to send ${response.failureCount} messages.`
        );
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }
  }

  async getAllNotifications() {
    return await this.notificationRepository.findAll();
  }

  async getSingleNotification(id: number) {
    return await this.notificationRepository.findById(id);
  }
}
