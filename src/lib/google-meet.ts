import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from './prisma';

/**
 * Google Meet Integration for SPARKS Therapy Platform
 *
 * This module handles creation of Google Calendar events with Google Meet links
 * for online therapy sessions.
 */

interface MeetingEventData {
  summary: string;
  description: string;
  startDateTime: string; // ISO 8601 format
  endDateTime: string;   // ISO 8601 format
  attendeeEmails: string[];
  timezone: string;
}

interface MeetingResponse {
  eventId: string;
  meetingLink: string;
  calendarEventLink: string;
}

/**
 * Create an OAuth2 client with the given tokens
 */
function createOAuth2Client(accessToken: string, refreshToken: string): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

/**
 * Refresh the access token if it's expired and update in database
 */
async function refreshAccessTokenIfNeeded(
  userId: string,
  oauth2Client: OAuth2Client
): Promise<string> {
  try {
    // Get new credentials (this will auto-refresh if needed)
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (credentials.access_token) {
      // Update the access token in the database
      await prisma.account.updateMany({
        where: {
          userId,
          provider: 'google',
        },
        data: {
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
        },
      });

      return credentials.access_token;
    }

    throw new Error('Failed to refresh access token');
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh Google OAuth token. User may need to re-authenticate.');
  }
}

/**
 * Create a Google Calendar event with Google Meet conference
 *
 * @param eventData - Event details including times, attendees, etc.
 * @param accessToken - Google OAuth access token
 * @param refreshToken - Google OAuth refresh token
 * @param userId - User ID for token refresh if needed
 * @returns Meeting link and event ID
 */
export async function createGoogleMeetEvent(
  eventData: MeetingEventData,
  accessToken: string,
  refreshToken: string,
  userId: string
): Promise<MeetingResponse> {
  try {
    const oauth2Client = createOAuth2Client(accessToken, refreshToken);

    // Initialize Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Generate a unique request ID for conference creation
    const requestId = `sparks-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create the event with conference data
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timezone,
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timezone,
      },
      attendees: eventData.attendeeEmails.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 },      // 30 minutes before
        ],
      },
    };

    let response;
    try {
      // Create the event with conferenceDataVersion=1 to enable Meet link generation
      response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
        sendUpdates: 'all', // Send email notifications to all attendees
      });
    } catch (error: unknown) {
      // If access token expired, refresh and retry
      if (error && typeof error === 'object' && 'code' in error && error.code === 401) {
        console.log('Access token expired, refreshing...');
        const newAccessToken = await refreshAccessTokenIfNeeded(userId, oauth2Client);

        // Update OAuth client with new token
        oauth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token: refreshToken,
        });

        // Retry the request
        response = await calendar.events.insert({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          requestBody: event,
          sendUpdates: 'all',
        });
      } else {
        throw error;
      }
    }

    if (!response.data.id) {
      throw new Error('Failed to create calendar event: No event ID returned');
    }

    // Extract the Google Meet link from the conference data
    const meetingLink = response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri;

    if (!meetingLink) {
      console.warn('No Google Meet link found in calendar event response');
      throw new Error('Failed to generate Google Meet link');
    }

    const calendarEventLink = response.data.htmlLink || '';

    console.log('✅ Google Meet event created successfully:', {
      eventId: response.data.id,
      meetingLink,
      summary: eventData.summary,
    });

    return {
      eventId: response.data.id,
      meetingLink,
      calendarEventLink,
    };
  } catch (error) {
    console.error('Error creating Google Meet event:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to create Google Meet event: ${error.message}`);
    }
    throw new Error('Failed to create Google Meet event: Unknown error');
  }
}

/**
 * Update an existing Google Calendar event
 *
 * @param eventId - The Google Calendar event ID
 * @param eventData - Updated event details
 * @param accessToken - Google OAuth access token
 * @param refreshToken - Google OAuth refresh token
 * @param userId - User ID for token refresh if needed
 */
export async function updateGoogleMeetEvent(
  eventId: string,
  eventData: Partial<MeetingEventData>,
  accessToken: string,
  refreshToken: string,
  userId: string
): Promise<MeetingResponse> {
  try {
    const oauth2Client = createOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const updateData: Record<string, unknown> = {};

    if (eventData.summary) updateData.summary = eventData.summary;
    if (eventData.description) updateData.description = eventData.description;
    if (eventData.startDateTime) {
      updateData.start = {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timezone || 'Asia/Colombo',
      };
    }
    if (eventData.endDateTime) {
      updateData.end = {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timezone || 'Asia/Colombo',
      };
    }
    if (eventData.attendeeEmails) {
      updateData.attendees = eventData.attendeeEmails.map(email => ({ email }));
    }

    let response;
    try {
      response = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: updateData,
        sendUpdates: 'all',
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 401) {
        console.log('Access token expired, refreshing...');
        await refreshAccessTokenIfNeeded(userId, oauth2Client);

        response = await calendar.events.patch({
          calendarId: 'primary',
          eventId,
          requestBody: updateData,
          sendUpdates: 'all',
        });
      } else {
        throw error;
      }
    }

    const meetingLink = response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri || '';

    return {
      eventId: response.data.id!,
      meetingLink,
      calendarEventLink: response.data.htmlLink || '',
    };
  } catch (error) {
    console.error('Error updating Google Meet event:', error);
    throw new Error('Failed to update Google Meet event');
  }
}

/**
 * Delete a Google Calendar event
 *
 * @param eventId - The Google Calendar event ID
 * @param accessToken - Google OAuth access token
 * @param refreshToken - Google OAuth refresh token
 * @param userId - User ID for token refresh if needed
 */
export async function deleteGoogleMeetEvent(
  eventId: string,
  accessToken: string,
  refreshToken: string,
  userId: string
): Promise<void> {
  try {
    const oauth2Client = createOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 401) {
        console.log('Access token expired, refreshing...');
        await refreshAccessTokenIfNeeded(userId, oauth2Client);

        await calendar.events.delete({
          calendarId: 'primary',
          eventId,
          sendUpdates: 'all',
        });
      } else {
        throw error;
      }
    }

    console.log('✅ Google Calendar event deleted:', eventId);
  } catch (error) {
    console.error('Error deleting Google Meet event:', error);
    throw new Error('Failed to delete Google Meet event');
  }
}

/**
 * Generate a fallback meeting link when Google Meet creation fails
 * or when therapist hasn't connected Google account
 *
 * This creates a simple link that can be used as a placeholder
 * The actual video call infrastructure would need to be implemented separately
 */
export function generateSimpleMeetingLink(sessionId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/meeting/${sessionId}`;
}

/**
 * Check if a user has valid Google OAuth tokens with Calendar access
 *
 * @param userId - The user ID to check
 * @returns True if user has valid tokens
 */
export async function hasGoogleCalendarAccess(userId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'google',
      },
      select: {
        access_token: true,
        refresh_token: true,
        scope: true,
      },
    });

    if (!account?.access_token || !account?.refresh_token) {
      return false;
    }

    // Check if the scope includes calendar access
    const hasCalendarScope = account.scope?.includes('calendar');

    return Boolean(hasCalendarScope);
  } catch (error) {
    console.error('Error checking Google Calendar access:', error);
    return false;
  }
}
