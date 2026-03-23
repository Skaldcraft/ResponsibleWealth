export type BasketStatus = "added" | "maintained" | "removed" | "inactive";

export interface Company {
  ticker: string;
  name: string;
  theme: string;
  country: string;
  currency: string;
}