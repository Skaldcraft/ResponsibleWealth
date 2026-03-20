"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(formData.get("email") ?? "") })
    });
    const data = (await response.json()) as { message: string };
    setMessage(data.message);
    event.currentTarget.reset();
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <input aria-label="Email address" type="email" name="email" placeholder="Your email for monthly updates" required />
      <button type="submit">Join the newsletter</button>
      {message ? <div className="muted">{message}</div> : null}
    </form>
  );
}
