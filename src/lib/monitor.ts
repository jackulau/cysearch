import { getDb } from "@/db";
import { trackers, sections, courses, users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendDiscordNotification, type NotificationData } from "@/lib/discord";
import type { SectionDisplay } from "@/types";

interface SeatChange {
  trackerId: string;
  userId: string;
  sectionId: string;
  previousSeats: number;
  currentSeats: number;
  section: SectionDisplay;
  course: {
    subject: string;
    courseNumber: string;
    title: string;
  };
  webhookUrl: string;
}

// Store previous seat counts for comparison
const previousSeatCounts: Map<string, number> = new Map();

export async function checkSeatAvailability(): Promise<void> {
  console.log("[Monitor] Checking seat availability...");

  try {
    const db = getDb();
    // Get all active trackers with their sections and user webhooks
    const activeTrackers = await db
      .select({
        trackerId: trackers.id,
        userId: trackers.userId,
        sectionId: trackers.sectionId,
        section: sections,
        course: courses,
        webhookUrl: users.discordWebhookUrl,
      })
      .from(trackers)
      .innerJoin(sections, eq(trackers.sectionId, sections.id))
      .innerJoin(courses, eq(sections.courseId, courses.id))
      .innerJoin(users, eq(trackers.userId, users.id))
      .where(eq(trackers.isActive, true));

    console.log(`[Monitor] Found ${activeTrackers.length} active trackers`);

    const seatChanges: SeatChange[] = [];

    for (const tracker of activeTrackers) {
      if (!tracker.webhookUrl) continue;

      const sectionId = tracker.sectionId;
      const currentSeats = Math.max(
        0,
        (tracker.section.enrollmentMax ?? 0) - (tracker.section.enrollmentCurrent ?? 0)
      );
      const previousSeats = previousSeatCounts.get(sectionId) ?? 0;

      // Update stored count
      previousSeatCounts.set(sectionId, currentSeats);

      // Check if seats became available (from 0 to > 0)
      if (previousSeats === 0 && currentSeats > 0) {
        seatChanges.push({
          trackerId: tracker.trackerId,
          userId: tracker.userId,
          sectionId: tracker.sectionId,
          previousSeats,
          currentSeats,
          section: {
            id: tracker.section.id,
            crn: tracker.section.crn,
            sectionNumber: tracker.section.sectionNumber,
            term: tracker.section.term,
            termCode: tracker.section.termCode,
            instructor: tracker.section.instructor,
            meetingDays: tracker.section.meetingDays,
            startTime: tracker.section.startTime,
            endTime: tracker.section.endTime,
            location: tracker.section.location,
            enrollmentMax: tracker.section.enrollmentMax ?? 0,
            enrollmentCurrent: tracker.section.enrollmentCurrent ?? 0,
            waitlistMax: tracker.section.waitlistMax ?? 0,
            waitlistCurrent: tracker.section.waitlistCurrent ?? 0,
            classType: tracker.section.classType,
            deliveryMode: tracker.section.deliveryMode,
            seatsAvailable: currentSeats,
            isFull: currentSeats === 0,
            hasWaitlist: (tracker.section.waitlistMax ?? 0) > 0,
          },
          course: {
            subject: tracker.course.subject,
            courseNumber: tracker.course.courseNumber,
            title: tracker.course.title,
          },
          webhookUrl: tracker.webhookUrl,
        });
      }
    }

    console.log(`[Monitor] Found ${seatChanges.length} sections with newly available seats`);

    // Send notifications for seat changes
    for (const change of seatChanges) {
      try {
        const notificationData: NotificationData = {
          course: change.course,
          section: change.section,
          previousSeats: change.previousSeats,
          currentSeats: change.currentSeats,
        };

        const success = await sendDiscordNotification(
          change.webhookUrl,
          notificationData
        );

        // Log the notification
        await db.insert(notifications).values({
          id: crypto.randomUUID(),
          trackerId: change.trackerId,
          userId: change.userId,
          sectionId: change.sectionId,
          message: `Seats available: ${change.course.subject} ${change.course.courseNumber} Section ${change.section.sectionNumber}`,
          sentAt: new Date(),
          success,
        });

        // Update tracker's last notified time
        await db
          .update(trackers)
          .set({ lastNotified: new Date() })
          .where(eq(trackers.id, change.trackerId));

        console.log(
          `[Monitor] Notification ${success ? "sent" : "failed"} for ${change.course.subject} ${change.course.courseNumber}`
        );
      } catch (error) {
        console.error(`[Monitor] Error sending notification:`, error);
      }
    }

    console.log("[Monitor] Seat availability check complete");
  } catch (error) {
    console.error("[Monitor] Error checking seat availability:", error);
  }
}

// For use with node-cron or similar scheduler
export function startMonitoring(intervalMs: number = 5 * 60 * 1000) {
  console.log(`[Monitor] Starting seat monitoring (interval: ${intervalMs}ms)`);

  // Initial check
  checkSeatAvailability();

  // Schedule periodic checks
  const intervalId = setInterval(checkSeatAvailability, intervalMs);

  return () => {
    console.log("[Monitor] Stopping seat monitoring");
    clearInterval(intervalId);
  };
}
