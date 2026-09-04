type InlineAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
  contentId: string;
};

type SendMicrosoftGraphEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: InlineAttachment[];
  headers?: Record<string, string>;
};

function getMicrosoftGraphConfig() {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const senderEmail = process.env.MICROSOFT_SENDER_EMAIL;

  if (!tenantId || !clientId || !clientSecret || !senderEmail) {
    throw new Error("Microsoft Graph email delivery is not configured.");
  }

  return { tenantId, clientId, clientSecret, senderEmail };
}

export function isMicrosoftGraphEmailConfigured() {
  return Boolean(
    process.env.MICROSOFT_TENANT_ID &&
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_SENDER_EMAIL,
  );
}

export async function sendMicrosoftGraphEmail(options: SendMicrosoftGraphEmailOptions) {
  const { tenantId, clientId, clientSecret, senderEmail } = getMicrosoftGraphConfig();
  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody,
      cache: "no-store",
    },
  );
  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw new Error(
      `Microsoft Graph authentication failed (${tokenResponse.status}): ${tokenPayload.error ?? "unknown error"}`,
    );
  }

  const sendResponse = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: options.subject,
          body: { contentType: "HTML", content: options.html },
          toRecipients: [{ emailAddress: { address: options.to } }],
          replyTo: [{ emailAddress: { address: senderEmail } }],
          internetMessageHeaders: Object.entries(options.headers ?? {}).map(([name, value]) => ({ name, value })),
          attachments: (options.attachments ?? []).map((attachment) => ({
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: attachment.filename,
            contentType: attachment.contentType,
            contentBytes: attachment.content.toString("base64"),
            contentId: attachment.contentId,
            isInline: true,
          })),
        },
        saveToSentItems: true,
      }),
      cache: "no-store",
    },
  );

  if (!sendResponse.ok) {
    const errorBody = await sendResponse.text();
    throw new Error(`Microsoft Graph sendMail failed (${sendResponse.status}): ${errorBody.slice(0, 500)}`);
  }

  return { text: options.text };
}
