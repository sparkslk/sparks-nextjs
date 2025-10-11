import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Google Meet and Calendar integration utility
 * Handles creating calendar events with Google Meet links for online therapy sessions
 */

interface CreateMeetingParams {
  summary: string;
  description: string;
  startDateTime: string; // ISO 8601 format
  endDateTime: string; // ISO 8601 format
  attendeeEmails: string[];
  timezone?: string;
}

interface MeetingResponse {
  eventId: string;
  meetingLink: string;
  calendarLink: string;
}

/**
 * Create OAuth2 client using credentials from environment variables
 */
function getOAuth2Client(): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google'
  );

  return oauth2Client;
}

/**
 * Create OAuth2 client with refresh token (for service account or user tokens)
 */
function getOAuth2ClientWithToken(accessToken: string, refreshToken?: string): OAuth2Client {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

/**
 * Create a Google Calendar event with Google Meet link
 * Requires valid OAuth2 credentials
 */
export async function createGoogleMeetEvent(
  params: CreateMeetingParams,
  accessToken: string,
  refreshToken?: string
): Promise<MeetingResponse> {
  try {
    const auth = getOAuth2ClientWithToken(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startDateTime,
        timeZone: params.timezone || 'Asia/Colombo',
      },
      end: {
        dateTime: params.endDateTime,
        timeZone: params.timezone || 'Asia/Colombo',
      },
      attendees: params.attendeeEmails.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    if (!response.data.id || !response.data.hangoutLink) {
      throw new Error('Failed to create meeting with conference data');
    }

    return {
      eventId: response.data.id,
      meetingLink: response.data.hangoutLink,
      calendarLink: response.data.htmlLink || '',
    };
  } catch (error) {
    console.error('Error creating Google Meet event:', error);
    throw new Error(`Failed to create Google Meet event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing Google Calendar event
 */
export async function updateGoogleMeetEvent(
  eventId: string,
  params: Partial<CreateMeetingParams>,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  try {
    const auth = getOAuth2ClientWithToken(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });

    const updateData: {
      summary?: string;
      description?: string;
      start?: { dateTime: string; timeZone: string };
      end?: { dateTime: string; timeZone: string };
      attendees?: Array<{ email: string }>;
    } = {};

    if (params.summary) updateData.summary = params.summary;
    if (params.description) updateData.description = params.description;
    if (params.startDateTime && params.endDateTime) {
      updateData.start = {
        dateTime: params.startDateTime,
        timeZone: params.timezone || 'Asia/Colombo',
      };
      updateData.end = {
        dateTime: params.endDateTime,
        timeZone: params.timezone || 'Asia/Colombo',
      };
    }
    if (params.attendeeEmails) {
      updateData.attendees = params.attendeeEmails.map(email => ({ email }));
    }

    await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: updateData,
      sendUpdates: 'all',
    });
  } catch (error) {
    console.error('Error updating Google Meet event:', error);
    throw new Error(`Failed to update Google Meet event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a Google Calendar event
 */
export async function deleteGoogleMeetEvent(
  eventId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  try {
    const auth = getOAuth2ClientWithToken(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all', // Notify attendees
    });
  } catch (error) {
    console.error('Error deleting Google Meet event:', error);
    throw new Error(`Failed to delete Google Meet event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a simple meeting link (fallback when OAuth is not available)
 * This creates a unique meeting room identifier that can be used with any video platform
 */
export function generateSimpleMeetingLink(sessionId: string): string {
  // Generate a unique, memorable meeting code
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  const meetingCode = `${timestamp}-${random}`;

  // In production, this would be your actual video conferencing domain
  // For now, return a placeholder that can be replaced with actual meeting service
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meeting/${meetingCode}?session=${sessionId}`;
}

/**
 * Get Google Meet link from calendar event
 */
export async function getMeetingLink(
  eventId: string,
  accessToken: string,
  refreshToken?: string
): Promise<string | null> {
  try {
    const auth = getOAuth2ClientWithToken(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    return response.data.hangoutLink || null;
  } catch (error) {
    console.error('Error getting meeting link:', error);
    return null;
  }
}
