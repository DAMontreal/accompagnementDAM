import { Client } from '@microsoft/microsoft-graph-client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=outlook',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Outlook not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableOutlookClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

// Get recent emails from Outlook
export async function getRecentEmails(maxResults: number = 50) {
  const client = await getUncachableOutlookClient();
  
  const messages = await client
    .api('/me/messages')
    .top(maxResults)
    .select('subject,from,receivedDateTime,bodyPreview,toRecipients,ccRecipients')
    .orderby('receivedDateTime DESC')
    .get();
  
  return messages.value;
}

// Search emails by email address
export async function searchEmailsByAddress(emailAddress: string, maxResults: number = 20) {
  const client = await getUncachableOutlookClient();
  
  const messages = await client
    .api('/me/messages')
    .filter(`from/emailAddress/address eq '${emailAddress}' or (toRecipients/any(r:r/emailAddress/address eq '${emailAddress}'))`)
    .top(maxResults)
    .select('subject,from,receivedDateTime,bodyPreview,body,toRecipients,ccRecipients')
    .orderby('receivedDateTime DESC')
    .get();
  
  return messages.value;
}

// Get full email details
export async function getEmailById(messageId: string) {
  const client = await getUncachableOutlookClient();
  
  const message = await client
    .api(`/me/messages/${messageId}`)
    .select('subject,from,receivedDateTime,body,toRecipients,ccRecipients,importance')
    .get();
  
  return message;
}

// Get calendar events
export async function getCalendarEvents(startDate?: Date, endDate?: Date, maxResults: number = 50) {
  const client = await getUncachableOutlookClient();
  
  let query = client
    .api('/me/calendar/events')
    .top(maxResults)
    .select('subject,start,end,location,attendees,body,organizer,webLink')
    .orderby('start/dateTime DESC');
  
  // Apply date filters if provided
  if (startDate || endDate) {
    const filters: string[] = [];
    
    if (startDate) {
      const startISO = startDate.toISOString();
      filters.push(`start/dateTime ge '${startISO}'`);
    }
    
    if (endDate) {
      const endISO = endDate.toISOString();
      filters.push(`end/dateTime le '${endISO}'`);
    }
    
    if (filters.length > 0) {
      query = query.filter(filters.join(' and '));
    }
  }
  
  const events = await query.get();
  return events.value;
}

// Search calendar events by attendee email
export async function searchEventsByAttendee(emailAddress: string, maxResults: number = 20) {
  const client = await getUncachableOutlookClient();
  
  const events = await client
    .api('/me/calendar/events')
    .filter(`attendees/any(a:a/emailAddress/address eq '${emailAddress}')`)
    .top(maxResults)
    .select('subject,start,end,location,attendees,body,organizer,webLink')
    .orderby('start/dateTime DESC')
    .get();
  
  return events.value;
}

// Create calendar event
export async function createCalendarEvent(eventData: {
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  attendees?: Array<{ emailAddress: { address: string; name?: string }; type: string }>;
  body?: { contentType: string; content: string };
}) {
  const client = await getUncachableOutlookClient();
  
  const event = await client
    .api('/me/calendar/events')
    .post(eventData);
  
  return event;
}

// Get event by ID
export async function getEventById(eventId: string) {
  const client = await getUncachableOutlookClient();
  
  const event = await client
    .api(`/me/calendar/events/${eventId}`)
    .select('subject,start,end,location,attendees,body,organizer,webLink')
    .get();
  
  return event;
}
