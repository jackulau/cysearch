import type { DiscordEmbed, SectionDisplay } from "@/types";

const ISU_CARDINAL = 0xC8102E; // ISU Cardinal red color

export interface NotificationData {
  course: {
    subject: string;
    courseNumber: string;
    title: string;
  };
  section: SectionDisplay;
  previousSeats: number;
  currentSeats: number;
}

export async function sendDiscordNotification(
  webhookUrl: string,
  data: NotificationData
): Promise<boolean> {
  const { course, section, previousSeats, currentSeats } = data;
  const seatsOpened = currentSeats - previousSeats;

  const embed: DiscordEmbed = {
    title: `🎉 Seats Available: ${course.subject} ${course.courseNumber}`,
    description: `**${course.title}**\n\nA seat has opened up in a section you're tracking!`,
    color: ISU_CARDINAL,
    fields: [
      {
        name: "Section",
        value: `Section ${section.sectionNumber} (CRN: ${section.crn})`,
        inline: true,
      },
      {
        name: "Instructor",
        value: section.instructor || "TBA",
        inline: true,
      },
      {
        name: "Schedule",
        value: section.meetingDays && section.startTime
          ? `${section.meetingDays} ${section.startTime} - ${section.endTime}`
          : "TBA",
        inline: true,
      },
      {
        name: "Location",
        value: section.location || "TBA",
        inline: true,
      },
      {
        name: "Seats Available",
        value: `**${currentSeats}** / ${section.enrollmentMax} (${seatsOpened > 0 ? `+${seatsOpened}` : seatsOpened} seats)`,
        inline: true,
      },
      {
        name: "Waitlist",
        value: section.waitlistMax > 0
          ? `${section.waitlistCurrent} / ${section.waitlistMax}`
          : "No waitlist",
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "CySearch - Iowa State University Course Search",
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "CySearch",
        avatar_url: "https://www.iastate.edu/themes/iastate_theme/images/cy-icon.svg",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error("Discord webhook failed:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Discord webhook error:", error);
    return false;
  }
}

export async function sendTestNotification(webhookUrl: string): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: "🔔 CySearch Notification Test",
    description: "Your Discord webhook is configured correctly! You will receive notifications when seats open up in the sections you're tracking.",
    color: ISU_CARDINAL,
    fields: [
      {
        name: "Status",
        value: "✅ Connected",
        inline: true,
      },
      {
        name: "Next Steps",
        value: "Start tracking sections to receive seat availability alerts!",
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "CySearch - Iowa State University Course Search",
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "CySearch",
        embeds: [embed],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Test notification error:", error);
    return false;
  }
}

// Validate Discord webhook URL format
export function isValidWebhookUrl(url: string): boolean {
  const pattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
  return pattern.test(url);
}
