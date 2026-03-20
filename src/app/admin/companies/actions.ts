"use server";

import { revalidatePath } from "next/cache";
import { EsgCategory } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

export async function updateCompanyAction(companyId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const sector = String(formData.get("sector") ?? "");
  const shortDescription = String(formData.get("shortDescription") ?? "");
  const rationaleShort = String(formData.get("rationaleShort") ?? "");
  const rationaleLong = String(formData.get("rationaleLong") ?? "");
  const strengths = String(formData.get("strengths") ?? "");
  const concerns = String(formData.get("concerns") ?? "");
  const lifecycleStatus = String(formData.get("lifecycleStatus") ?? "candidate");
  const esgCategory = String(formData.get("esgCategory") ?? "green") as EsgCategory;
  const haloFit = Number(formData.get("haloFit") ?? 3);
  const esgFit = Number(formData.get("esgFit") ?? 3);
  const mediumTermScore = Number(formData.get("mediumTermScore") ?? 3);
  const inBasket = String(formData.get("inBasket") ?? "no") === "yes";
  const ticker = String(formData.get("ticker") ?? "").toLowerCase();

  await prisma.company.update({
    where: { id: companyId },
    data: {
      name,
      sector,
      shortDescription,
      lifecycleStatus: lifecycleStatus as "candidate" | "active" | "under_review" | "removed" | "archived",
      haloFit,
      esgFit,
      mediumTermScore,
      active: lifecycleStatus !== "archived",
      esgProfile: {
        upsert: {
          create: {
            category: esgCategory,
            rationaleShort,
            rationaleLong,
            strengths,
            concerns,
            lastReviewedAt: new Date()
          },
          update: {
            category: esgCategory,
            rationaleShort,
            rationaleLong,
            strengths,
            concerns,
            lastReviewedAt: new Date()
          }
        }
      }
    } as never
  });

  const basket = await prisma.basket.findFirst({ where: { slug: "halo-esg" } });
  if (basket) {
    const existing = await prisma.basketMember.findFirst({ where: { basketId: basket.id, companyId } });
    if (inBasket) {
      if (existing) {
        await prisma.basketMember.update({
          where: { id: existing.id },
          data: { membershipStatus: "active", endDate: null }
        });
      } else {
        const order = (await prisma.basketMember.count({ where: { basketId: basket.id, membershipStatus: "active" } })) + 1;
        await prisma.basketMember.create({
          data: { basketId: basket.id, companyId, order, membershipStatus: "active", startDate: new Date() }
        });
      }
    } else if (existing) {
      await prisma.basketMember.update({
        where: { id: existing.id },
        data: { membershipStatus: "removed", endDate: new Date() }
      });
    }
  }

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${ticker}`);
  revalidatePath(`/companies/${ticker}`);
  revalidatePath("/halo-esg");
}

export async function addEditorialUpdateAction(companyId: string, formData: FormData) {
  await prisma.editorialUpdate.create({
    data: {
      companyId,
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      body: String(formData.get("body") ?? ""),
      updateType: "thesis",
      effectiveDate: new Date(),
      published: true
    }
  });

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${formData.get("ticker")}`);
  revalidatePath(`/companies/${formData.get("ticker")}`);
}

export async function createCompanyAction(formData: FormData) {
  const ticker = String(formData.get("ticker") ?? "").toUpperCase();
  const slug = String(formData.get("slug") ?? "").toLowerCase();
  const company = await prisma.company.create({
    data: {
      ticker,
      slug,
      name: String(formData.get("name") ?? ""),
      exchange: String(formData.get("exchange") ?? "NYSE"),
      country: String(formData.get("country") ?? "United States"),
      sector: String(formData.get("sector") ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      lifecycleStatus: "candidate",
      haloFit: Number(formData.get("haloFit") ?? 3),
      esgFit: Number(formData.get("esgFit") ?? 3),
      mediumTermScore: Number(formData.get("mediumTermScore") ?? 3),
      esgProfile: {
        create: {
          category: "mixed",
          rationaleShort: "Candidate under review.",
          rationaleLong: "This company has been added as a candidate for future inclusion review.",
          strengths: "",
          concerns: "",
          lastReviewedAt: new Date()
        }
      }
    } as never
  });

  revalidatePath("/admin/companies");
  revalidatePath("/halo-esg");
  revalidatePath(`/admin/companies/${company.ticker.toLowerCase()}`);
}
