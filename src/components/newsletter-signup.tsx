"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(formData.get("email") ?? "") })
      });
      const data = (await response.json()) as { message: string };
      setMessage(data.message);
      event.currentTarget.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <input aria-label="Email address" disabled={isSubmitting} type="email" name="email" placeholder="Your email for monthly updates" required />
      <button disabled={isSubmitting} type="submit">{isSubmitting ? "Submitting..." : "Join the newsletter"}</button>
      {message ? <div aria-live="polite" className="muted">{message}</div> : null}
    </form>
  );
}
