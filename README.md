# Responsible Wealth

**A research-focused platform for responsible, medium-term investing built around heavy-asset, lower-obsolescence companies.**

Responsible Wealth publishes the **HALO ESG Index** — a curated basket of companies selected through a framework that prioritises durable physical infrastructure, essential services, and measurable environmental relevance. The project is designed to be educational rather than advisory, helping readers understand how responsible investing can work over a calmer, medium-term horizon.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (via [Supabase](https://supabase.com/)) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Styling** | Vanilla CSS with custom design tokens |
| **Charts** | [Recharts](https://recharts.org/) |
| **Email** | [SendPulse](https://sendpulse.com/) |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## 📁 Project Structure

```
ResponsibleWealth/
├── prisma/
│   ├── schema.prisma          # Database schema (Company, Basket, ESG, Market, Newsletter…)
│   ├── migrations/            # Prisma migration history
│   └── seed.ts                # Entry point for database seeding
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage — Basket overview
│   │   ├── companies/         # Individual company pages
│   │   ├── compare/           # Side-by-side company comparison
│   │   ├── halo-esg/          # HALO ESG methodology page
│   │   ├── methodology/       # Scoring methodology
│   │   ├── changes/           # Change log
│   │   ├── sources/           # Data sources page
│   │   ├── resources/         # Research guides
│   │   ├── newsletter/        # Newsletter archive
│   │   ├── how-it-works/      # How the platform works
│   │   ├── legal/             # Disclaimers and legal
│   │   ├── admin/             # Admin dashboard (protected)
│   │   ├── api/               # API routes (admin, newsletter)
│   │   ├── globals.css        # Design system and global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Shared React components
│   │   ├── basket-page-content.tsx
│   │   ├── research-charts.tsx
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── content/
│   │   │   └── seed.ts        # Company data, benchmarks, newsletter archive
│   │   ├── server/
│   │   │   ├── prisma.ts      # Prisma client singleton
│   │   │   ├── repository.ts  # Data-access layer
│   │   │   ├── seed-database.ts
│   │   │   ├── market-sync.ts
│   │   │   ├── news-collector.ts
│   │   │   ├── newsletter.ts
│   │   │   └── ...
│   │   ├── news-policy.ts
│   │   └── utils.ts
│   └── middleware.ts          # Auth middleware for admin routes
├── .env.example               # Environment variable template
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## 📊 HALO ESG Basket — Current Holdings (24 Companies)

### Renewable & Regulated Utilities
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| NEE | NextEra Energy | NYSE | 🇺🇸 US |
| EXC | Exelon | NASDAQ | 🇺🇸 US |
| DUK | Duke Energy | NYSE | 🇺🇸 US |
| SO | Southern Company | NYSE | 🇺🇸 US |
| IBE | Iberdrola | BME | 🇪🇸 Spain |
| ORSTED | Orsted | CPH | 🇩🇰 Denmark |
| EDP | EDP Renovaveis | ELI | 🇵🇹 Portugal |

### Water & Sustainability
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| AWK | American Water Works | NYSE | 🇺🇸 US |
| XYL | Xylem | NYSE | 🇺🇸 US |
| ECL | Ecolab | NYSE | 🇺🇸 US |
| VIE | Veolia Environnement SA | EPA | 🇫🇷 France |

### Circular Economy & Efficiency
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| WM | Waste Management | NYSE | 🇺🇸 US |
| TT | Trane Technologies | NYSE | 🇺🇸 US |

### Transport Infrastructure
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| UNP | Union Pacific | NYSE | 🇺🇸 US |
| CNI | Canadian National Railway | TSX | 🇨🇦 Canada |
| FER | Ferrovial SE | AMS | 🇳🇱 Netherlands |

### Real Estate Infrastructure
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| PLD | Prologis | NYSE | 🇺🇸 US |
| PSA | Public Storage | NYSE | 🇺🇸 US |

### Essential Services
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| SCI | Service Corporation International | NYSE | 🇺🇸 US |
| ROL | Rollins | NYSE | 🇺🇸 US |

### Telecom Infrastructure
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| AMT | American Tower Corp | NYSE | 🇺🇸 US |
| CCI | Crown Castle Inc | NYSE | 🇺🇸 US |

### Electricity Transmission
| Ticker | Company | Exchange | Country |
|--------|---------|----------|---------|
| TRN | Terna | BIT | 🇮🇹 Italy |
| RED | Redeia Corporacion SA | BME | 🇪🇸 Spain |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database (or a [Supabase](https://supabase.com/) project)

### Installation

```bash
# Clone the repository
git clone https://github.com/Skaldcraft/ResponsibleWealth.git
cd ResponsibleWealth

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run db:push

# Seed the database with the HALO ESG basket
npm run prisma:seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Testing

```bash
npm test
```

### Production Build

```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_SECRET` | Secret for session signing |
| `MARKET_DATA_PROVIDER` | Market data provider (`demo-seed` for local) |
| `NEWS_PROVIDER` | News API provider |
| `ALPHA_VANTAGE_API_KEY` | API key for Alpha Vantage (market data) |
| `SENDPULSE_API_ID` | SendPulse API ID (newsletter) |
| `SENDPULSE_API_SECRET` | SendPulse API secret |
| `SENDPULSE_ADDRESSBOOK_ID` | SendPulse address book ID |
| `NEWS_FEED_URLS` | Comma-separated RSS feed URLs |
| `NEWS_PAGE_URLS` | Comma-separated newsroom page URLs |

---

## 🧪 Key npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:seed` | Seed database with HALO ESG basket |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm test` | Run tests with Vitest |

---

## 📜 License

This project is proprietary. All rights reserved.

---

## ⚠️ Disclaimer

Responsible Wealth is an **educational and research project**. It does not provide financial advice, investment recommendations, or personalised guidance. All company data, scores, and commentary are provided for informational purposes only. Always do your own research and consult a qualified financial adviser before making investment decisions.
