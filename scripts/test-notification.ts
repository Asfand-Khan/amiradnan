import { NotificationService } from "../src/services/notification.service.js";
import { NotificationType, TargetType } from "@prisma/client";

async function testNotification() {
  const service = new NotificationService();

  console.log("Testing Notification Service...");

  try {
    // Test creating a notification (Broadcast)
    console.log("1. Sending Broadcast Notification...");
    const broadcastNotif = await service.sendNotification(
      "Test Broadcast",
      "This is a test broadcast notification",
      NotificationType.promo,
      TargetType.all
    );
    console.log("Broadcast Notification Created:", broadcastNotif.id);

    // Test creating a notification (Email Target)
    console.log("2. Sending Email Notification...");
    const emailNotif = await service.sendNotification(
      "Test Email",
      "This is a test email notification",
      NotificationType.transaction,
      TargetType.email,
      "test@example.com"
    );
    console.log("Email Notification Created:", emailNotif.id);

    console.log("✅ Notification Service Tests Passed!");
  } catch (error) {
    console.error("❌ Notification Service Test Failed:", error);
  } finally {
    process.exit(0);
  }
}

testNotification();
