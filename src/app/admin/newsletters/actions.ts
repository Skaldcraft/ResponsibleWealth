"use server";

import { revalidatePath } from "next/cache";
import { approveNewsletterDraft, createNewsletterDraft, sendNewsletterDraft, updateNewsletterDraft } from "@/lib/server/newsletter";

export async function createDraftAction() {
  await createNewsletterDraft();
  revalidatePath("/admin/newsletters");
}

export async function updateDraftAction(draftId: string, formData: FormData) {
  await updateNewsletterDraft(draftId, formData);
  revalidatePath("/admin/newsletters");
  revalidatePath(`/admin/newsletters/${draftId}`);
}

export async function approveDraftAction(draftId: string) {
  await approveNewsletterDraft(draftId);
  revalidatePath("/admin/newsletters");
  revalidatePath(`/admin/newsletters/${draftId}`);
  revalidatePath("/newsletter");
}

export async function sendDraftAction(draftId: string) {
  await sendNewsletterDraft(draftId);
  revalidatePath("/admin/newsletters");
  revalidatePath(`/admin/newsletters/${draftId}`);
  revalidatePath("/newsletter");
}
