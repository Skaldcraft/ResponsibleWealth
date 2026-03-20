const SENDPULSE_API_BASE = "https://api.sendpulse.com";

type SendPulseToken = {
  access_token: string;
  token_type: string;
};

function getSendPulseCredentials() {
  const clientId = process.env.SENDPULSE_API_ID ?? process.env.SENDPULSE_CLIENT_ID ?? "";
  const clientSecret = process.env.SENDPULSE_API_SECRET ?? process.env.SENDPULSE_CLIENT_SECRET ?? "";
  return {
    clientId,
    clientSecret,
    addressBookId: process.env.SENDPULSE_ADDRESSBOOK_ID ?? "",
    senderName: process.env.SENDPULSE_SENDER_NAME ?? "Responsible Wealth"
  };
}

async function getSendPulseToken() {
  const { clientId, clientSecret } = getSendPulseCredentials();
  if (!clientId || !clientSecret) {
    return null;
  }

  const response = await fetch(`${SENDPULSE_API_BASE}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SendPulse auth failed with status ${response.status}.`);
  }

  return (await response.json()) as SendPulseToken;
}

async function sendSendPulseRequest(path: string, init: RequestInit) {
  const token = await getSendPulseToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`${SENDPULSE_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token.token_type} ${token.access_token}`,
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendPulse request failed (${response.status}): ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export function isSendPulseConfigured() {
  const { clientId, clientSecret } = getSendPulseCredentials();
  return Boolean(clientId && clientSecret);
}

export async function subscribeEmailInSendPulse(email: string) {
  const { addressBookId } = getSendPulseCredentials();
  if (!addressBookId || !isSendPulseConfigured()) {
    return null;
  }

  return sendSendPulseRequest(`/addressbooks/${addressBookId}/emails`, {
    method: "POST",
    body: JSON.stringify({
      emails: [
        {
          email
        }
      ]
    })
  });
}

export async function unsubscribeEmailInSendPulse(email: string) {
  const { addressBookId } = getSendPulseCredentials();
  if (!addressBookId || !isSendPulseConfigured()) {
    return null;
  }

  return sendSendPulseRequest(`/addressbooks/${addressBookId}/emails/unsubscribe`, {
    method: "POST",
    body: JSON.stringify({
      addressBookId: Number(addressBookId),
      emails: [email]
    })
  });
}

export async function sendNewsletterViaSendPulse(input: {
  fromEmail: string;
  subject: string;
  html: string;
  text: string;
  recipients: Array<{ email: string; name?: string }>;
}) {
  const { senderName } = getSendPulseCredentials();
  if (!isSendPulseConfigured()) {
    return null;
  }

  const htmlBase64 = Buffer.from(input.html, "utf8").toString("base64");

  return sendSendPulseRequest("/smtp/emails", {
    method: "POST",
    body: JSON.stringify({
      email: {
        html: htmlBase64,
        text: input.text,
        subject: input.subject,
        from: {
          name: senderName,
          email: input.fromEmail
        },
        to: input.recipients.map((recipient) => ({
          name: recipient.name ?? recipient.email,
          email: recipient.email
        }))
      }
    })
  });
}
