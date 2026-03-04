/**
 * Styled HTML email templates matching the main website.
 * Uses inline CSS for maximum email client compatibility.
 */

const RAINBOW_GRADIENT = 'linear-gradient(90deg, #FF6B6B, #FFB471, #FFD93D, #6BCB77, #4D96FF, #A66CFF)';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#14141E;font-family:'Outfit',Arial,sans-serif;color:#F4F4F8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#14141E;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#1E1E2C;border-radius:16px;overflow:hidden;border:1px solid #2D2D42;">
        <!-- Header with rainbow gradient -->
        <tr><td style="background:${RAINBOW_GRADIENT};padding:3px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1E1E2C;border-radius:13px;overflow:hidden;">
            <tr><td style="padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#F4F4F8;">
                <span style="background:${RAINBOW_GRADIENT};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">High Desert</span> Meet
              </h1>
            </td></tr>
          </table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:0 32px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #2D2D42;">
          <p style="margin:0;font-size:12px;color:#A1A1B5;">${process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"} — Queer Speed Dating</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr><td style="background:${RAINBOW_GRADIENT};border-radius:9999px;padding:3px;">
      <a href="${url}" style="display:block;padding:12px 32px;background-color:#1E1E2C;border-radius:9999px;color:#F4F4F8;text-decoration:none;font-weight:600;font-size:15px;text-align:center;">${text}</a>
    </td></tr>
  </table>`;
}

function infoBox(label: string, value: string): string {
  return `<p style="margin:4px 0;font-size:14px;"><span style="color:#A1A1B5;">${label}:</span> <strong>${value}</strong></p>`;
}

// ============ EMAIL BUILDERS ============

export function newEventAnnouncementEmail(event: { title: string; date: Date; address: string | null }, dashboardLink: string): string {
  const dateStr = event.date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return layout(`
    <h2 style="margin:24px 0 8px;font-size:20px;color:#FFD447;">✨ New Event Announced!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#A1A1B5;">A new speed dating event has been scheduled. Sign up before spots fill up!</p>
    <div style="background-color:#262638;border-radius:12px;padding:20px;margin:16px 0;">
      <h3 style="margin:0 0 12px;font-size:18px;color:#F4F4F8;">${event.title}</h3>
      ${infoBox('📅 Date', dateStr)}
      ${event.address ? infoBox('📍 Location', event.address) : ''}
    </div>
    ${button('Register Now →', dashboardLink)}
  `);
}

export function inviteEmail(event: { title: string; date: Date; address: string | null }): string {
  const dateStr = event.date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return layout(`
    <h2 style="margin:24px 0 8px;font-size:20px;color:#6BCB77;">✓ You're Registered!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#A1A1B5;">Your registration is confirmed. A calendar invite is attached to this email.</p>
    <div style="background-color:#262638;border-radius:12px;padding:20px;margin:16px 0;">
      <h3 style="margin:0 0 12px;font-size:18px;color:#F4F4F8;">${event.title}</h3>
      ${infoBox('📅 Date', dateStr)}
      ${event.address ? infoBox('📍 Location', event.address) : ''}
    </div>
    <p style="margin:16px 0 0;font-size:14px;color:#A1A1B5;text-align:center;">See you there! 🌈</p>
  `);
}

export function cancellationEmail(event: { title: string; date: Date }): string {
  const dateStr = event.date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return layout(`
    <h2 style="margin:24px 0 8px;font-size:20px;color:#FF6B6B;">Event Cancelled</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#A1A1B5;">We're sorry to let you know that the following event has been cancelled.</p>
    <div style="background-color:#262638;border-radius:12px;padding:20px;margin:16px 0;">
      <h3 style="margin:0 0 12px;font-size:18px;color:#F4F4F8;">${event.title}</h3>
      ${infoBox('📅 Was Scheduled', dateStr)}
    </div>
    <p style="margin:16px 0 0;font-size:14px;color:#A1A1B5;text-align:center;">We hope to see you at a future event! 💜</p>
  `);
}

export function feedbackFormEmail(event: { title: string }, magicLink: string): string {
  return layout(`
    <h2 style="margin:24px 0 8px;font-size:20px;color:#FFD93D;">📝 Share Your Feedback</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#A1A1B5;">Thanks for attending <strong>${event.title}</strong>! Fill out your feedback form so we can find your matches.</p>
    <p style="margin:0 0 8px;font-size:14px;color:#A1A1B5;">Click below to sign in and go directly to your form:</p>
    ${button('Open Feedback Form →', magicLink)}
    <p style="margin:0;font-size:12px;color:#A1A1B5;text-align:center;">This link expires in 24 hours.</p>
  `);
}

export function matchResultsEmail(event: { title: string }, matches: { name: string; pronouns: string; categories: string[]; contact: string }[]): string {
  let matchesHtml: string;
  if (matches.length === 0) {
    matchesHtml = `
      <div style="background-color:#262638;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
        <p style="margin:0;font-size:15px;color:#A1A1B5;">No mutual matches this time — but don't lose hope! 💜</p>
      </div>`;
  } else {
    matchesHtml = matches.map(m => `
      <div style="background-color:#262638;border-radius:12px;padding:20px;margin:12px 0;border-left:3px solid #A66CFF;">
        <h3 style="margin:0 0 4px;font-size:16px;color:#F4F4F8;">${m.name} <span style="font-weight:400;font-size:13px;color:#A1A1B5;">(${m.pronouns})</span></h3>
        <p style="margin:4px 0;font-size:13px;color:#FFD447;">${m.categories.join(' · ')}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#A1A1B5;">${m.contact}</p>
      </div>`).join('');
  }

  return layout(`
    <h2 style="margin:24px 0 8px;font-size:20px;color:#A66CFF;">🌈 Your Matches Are In!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#A1A1B5;">Results for <strong>${event.title}</strong></p>
    ${matchesHtml}
    <p style="margin:20px 0 0;font-size:13px;color:#A1A1B5;text-align:center;">Matches are mutual — both people expressed interest. Have fun connecting! ✨</p>
  `);
}
