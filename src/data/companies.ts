import type { Company } from "@/types/company";

export const companies: Company[] = [
  { ticker: "NEE", name: "NextEra Energy", theme: "Renewable Utilities", country: "US", currency: "USD" },
  { ticker: "IBE", name: "Iberdrola", theme: "Renewable Utilities", country: "ES", currency: "EUR" },
  { ticker: "EXC", name: "Exelon", theme: "Regulated Utilities", country: "US", currency: "USD" },
  { ticker: "DUK", name: "Duke Energy", theme: "Utilities", country: "US", currency: "USD" },
  { ticker: "SO", name: "Southern Company", theme: "Utilities", country: "US", currency: "USD" },
  { ticker: "ORSTED", name: "Ørsted", theme: "Offshore Wind", country: "DK", currency: "DKK" },
  { ticker: "EDP", name: "EDP Renováveis", theme: "Renewables", country: "PT", currency: "EUR" },
  { ticker: "AWK", name: "American Water Works", theme: "Water Infrastructure", country: "US", currency: "USD" },
  { ticker: "XYL", name: "Xylem", theme: "Water Technology", country: "US", currency: "USD" },
  { ticker: "ECL", name: "Ecolab", theme: "Water and Sustainability Solutions", country: "US", currency: "USD" },
  { ticker: "WM", name: "Waste Management", theme: "Circular Economy", country: "US", currency: "USD" },
  { ticker: "TT", name: "Trane Technologies", theme: "Energy Efficiency", country: "IE", currency: "USD" },
  { ticker: "UNP", name: "Union Pacific", theme: "Rail Infrastructure", country: "US", currency: "USD" },
  { ticker: "CNI", name: "Canadian National Railway", theme: "Rail Infrastructure", country: "CA", currency: "CAD" },
  { ticker: "PLD", name: "Prologis", theme: "Sustainable Logistics REIT", country: "US", currency: "USD" },
  { ticker: "PSA", name: "Public Storage", theme: "Storage REIT", country: "US", currency: "USD" },
  { ticker: "SCI", name: "Service Corporation International", theme: "Essential Services", country: "US", currency: "USD" },
  { ticker: "ROL", name: "Rollins", theme: "Essential Services", country: "US", currency: "USD" },
  { ticker: "AMT", name: "American Tower Corp", theme: "Telecom Infrastructure", country: "US", currency: "USD" },
  { ticker: "CCI", name: "Crown Castle Inc", theme: "Telecom Infrastructure", country: "US", currency: "USD" },
  { ticker: "VIE", name: "Veolia Environnement SA", theme: "Water Infrastructure", country: "FR", currency: "EUR" },
  { ticker: "TRN", name: "Terna", theme: "Electricity Transmission", country: "IT", currency: "EUR" },
  { ticker: "RED", name: "Redeia Corporacion SA", theme: "Electricity Transmission", country: "ES", currency: "EUR" },
  { ticker: "FER", name: "Ferrovial SE", theme: "Airport & Transport Infrastructure", country: "ES", currency: "EUR" }
];

const companyDirectory = new Map(companies.map((company) => [company.ticker.toUpperCase(), company]));

export function getCompanyDirectoryEntry(ticker: string) {
  return companyDirectory.get(ticker.toUpperCase());
}