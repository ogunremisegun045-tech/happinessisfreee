// WebCraft Nigeria — Lead Automation via Kudisms
// Netlify Function: handles form submission + follow up sequences

const KUDISMS_API_KEY = 'xZ3hRBKtUJHrduj4p1oMwiWgyYnSa9PFlvzTCVkQmeO0c625qXIGLf7NsbADE8';
const KUDISMS_SENDER  = 'Emmanuel';
const GROUP_LEADS     = '9562';
const GROUP_CLIENTS   = '9563';
const GROUP_NURTURE   = '9564';

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzh_EutYf6FKSdGq4K5CFwWAfltvjzIw9RLteOYJaNlajJCd_0IuLXXC5PCjaonNTieAA/exec';

// ── MESSAGE SEQUENCES ──────────────────────────────────────────────
const FOLLOWUP_SMS = [
  // SMS 1 — instant on submit
  (email) => `Hi! Thanks for reaching out to WebCraft Nigeria. I'll have your free website preview ready shortly. — Emmanuel`,

  // SMS 2 — 1 hour
  (email) => `Hi! Just checking — did you get a chance to look at your free preview? I'd love to hear what you think. Reply here anytime. — Emmanuel`,

  // SMS 3 — 24 hours
  (email) => `Hi again! Your free preview is still waiting. Nigerian businesses using websites are getting customers while others are still answering WhatsApp questions. Want to see yours? — Emmanuel`,

  // SMS 4 — 72 hours
  (email) => `Hi! Quick reminder — I only have 3 consultation slots left this week. Your free preview is ready and it takes less than 5 minutes to look at. — Emmanuel`,

  // SMS 5 — 7 days
  (email) => `Hi! Last message from me — if you're ever ready to get your business online properly, I'm here. No pressure. Your preview link is still live. — Emmanuel`,
];

const FOLLOWUP_EMAIL = [
  // Email 1 — instant
  {
    subject: 'Your free website preview is coming',
    body: `Hi there,

Thanks for reaching out to WebCraft Nigeria.

I'm putting together your free website preview right now. You'll be able to see exactly how your business looks online before paying a single kobo.

I'll be in touch shortly.

Emmanuel
WebCraft Nigeria`,
  },

  // Email 2 — 1 hour
  {
    subject: 'Did you see your preview?',
    body: `Hi,

Just checking in — your free website preview should be ready.

Remember, you don't pay anything until you love what you see. I'll add all your products from Instagram and have everything live within 24 hours of your go-ahead.

Reply to this email or WhatsApp me anytime.

Emmanuel
WebCraft Nigeria`,
  },

  // Email 3 — 24 hours
  {
    subject: 'Your customers are Googling you right now',
    body: `Hi,

Every day without a website is a day your customers find someone else on Google.

Your free preview is ready and waiting. No payment. No commitment. Just a look at what your business could be.

Reply here or WhatsApp: 2349031375718

Emmanuel
WebCraft Nigeria`,
  },

  // Email 4 — 72 hours
  {
    subject: 'Only 3 slots left this week',
    body: `Hi,

I only take on 3 new clients per week to make sure every site gets my full attention.

I have 3 slots left and your preview is already done. All you need to do is say go ahead.

No payment until you see it and love it.

Emmanuel
WebCraft Nigeria`,
  },

  // Email 5 — 7 days
  {
    subject: 'Leaving the door open',
    body: `Hi,

This is my last follow up — I don't want to flood your inbox.

Whenever you're ready to get your business properly online, I'm here. Your free preview is still available.

No pressure. No obligation.

Emmanuel
WebCraft Nigeria
WhatsApp: 2349031375718`,
  },
];

const NURTURE_EMAIL = {
  subject: 'One thing killing Nigerian business sales online',
  body: `Hi,

Quick insight for your business:

Most Nigerian business owners think having an Instagram page is enough. It's not.

When someone hears about your business the first thing they do is Google you. Not Instagram you. Google you.

If nothing comes up — they move on.

A website is not just a fancy page. It's open 24 hours collecting customers while you sleep. It answers the same WhatsApp questions automatically. It makes you look like the serious option in your market.

Whenever you're ready — I'm one message away.

Emmanuel
WebCraft Nigeria`,
};

const ONBOARDING_SMS = (name) =>
  `Welcome to WebCraft Nigeria! Your site is in good hands. I'll keep you updated as we build. Feel free to WhatsApp me anytime with questions. — Emmanuel`;

// ── KUDISMS HELPERS ────────────────────────────────────────────────
async function sendSMS(phone, message) {
  try {
    const res = await fetch('https://my.kudisms.net/api/corporate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: KUDISMS_API_KEY,
        senderid: KUDISMS_SENDER,
        message,
        recipients: phone,
        compress: false,
      }),
    });
    return await res.json();
  } catch (e) {
    console.error('SMS error:', e);
  }
}

async function sendEmail(email, subject, body) {
  try {
    const res = await fetch('https://my.kudisms.net/api/sendemail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: KUDISMS_API_KEY,
        email,
        subject,
        message: body,
        sender_name: 'Emmanuel | WebCraft Nigeria',
        sender_email: 'ogunremiemmanuel469@gmail.com',
      }),
    });
    return await res.json();
  } catch (e) {
    console.error('Email error:', e);
  }
}

async function addToGroup(phone, groupId) {
  try {
    await fetch('https://my.kudisms.net/api/addcontact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: KUDISMS_API_KEY,
        phonebook_id: groupId,
        phone,
      }),
    });
  } catch (e) {
    console.error('Group error:', e);
  }
}

// ── GOOGLE SHEETS HELPERS ──────────────────────────────────────────
async function updateSheet(data) {
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error('Sheets error:', e);
  }
}

// ── MAIN HANDLER ───────────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, email, phone, hasWebsite } = body;

    // ── ACTION: new lead submitted ──
    if (action === 'new_lead') {
      const now = new Date().toISOString();
      const nextSend = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1hr

      // Save to Google Sheets
      await updateSheet({
        action: 'new_lead',
        email,
        phone: phone || '',
        hasWebsite: hasWebsite || '',
        status: 'lead',
        followUpCount: 0,
        lastSent: now,
        nextSend,
        sequence: 'followup',
      });

      // Add to Webleads group
      if (phone) await addToGroup(phone, GROUP_LEADS);

      // Send instant SMS + email
      if (phone) await sendSMS(phone, FOLLOWUP_SMS[0](email));
      await sendEmail(email, FOLLOWUP_EMAIL[0].subject, FOLLOWUP_EMAIL[0].body);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Lead saved and welcome message sent' }),
      };
    }

    // ── ACTION: mark as client ──
    if (action === 'mark_client') {
      await updateSheet({
        action: 'mark_client',
        email,
        status: 'client',
        sequence: 'onboarding',
      });

      if (phone) {
        await addToGroup(phone, GROUP_CLIENTS);
        await sendSMS(phone, ONBOARDING_SMS());
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Marked as client' }),
      };
    }

    // ── ACTION: run follow up scheduler ──
    // Call this via a cron job or scheduled function every hour
    if (action === 'run_followups') {
      // This would fetch all leads from Google Sheets
      // and send the appropriate follow up based on followUpCount and nextSend
      // Full implementation requires Google Sheets read API
      // For now returns success — add read logic when Google Sheets API is connected

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Follow up scheduler triggered' }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Unknown action' }),
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
