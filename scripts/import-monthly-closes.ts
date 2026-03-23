import fs from "node:fs";
import path from "node:path";

type CsvRecord = {
  year: number;
  month: number;
  ticker: string;
  close: number;
};

function fail(message: string): never {
  throw new Error(message);
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const csvPath = args.find((value) => !value.startsWith("--"));
  const outIndex = args.findIndex((value) => value === "--out");
  const outPath = outIndex >= 0 ? args[outIndex + 1] : undefined;

  if (!csvPath) {
    fail("Missing CSV path. Usage: npm run closes:import -- path/to/file.csv [--out src/data/monthly-close-overrides.ts]");
  }

  return {
    csvPath,
    outPath: outPath ?? "src/data/monthly-close-overrides.ts"
  };
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      const nextCharacter = line[index + 1];
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function readCsvRecords(csvText: string) {
  const normalized = csvText.replace(/^\uFEFF/, "").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    fail("CSV must include a header row and at least one data row.");
  }

  const headerCells = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  const requiredHeaders = ["year", "month", "ticker", "close"];

  for (const header of requiredHeaders) {
    if (!headerCells.includes(header)) {
      fail(`CSV header must include '${header}'. Found: ${headerCells.join(", ")}`);
    }
  }

  const headerIndex = new Map(headerCells.map((cell, index) => [cell, index]));
  const records: CsvRecord[] = [];

  for (const [lineIndex, line] of lines.slice(1).entries()) {
    const rowNumber = lineIndex + 2;
    const cells = splitCsvLine(line);

    const year = Number(cells[headerIndex.get("year") ?? -1]);
    const month = Number(cells[headerIndex.get("month") ?? -1]);
    const ticker = String(cells[headerIndex.get("ticker") ?? -1] ?? "").toUpperCase();
    const close = Number(cells[headerIndex.get("close") ?? -1]);

    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      fail(`Invalid year at row ${rowNumber}: ${cells[headerIndex.get("year") ?? -1]}`);
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      fail(`Invalid month at row ${rowNumber}: ${cells[headerIndex.get("month") ?? -1]}`);
    }
    if (!/^[A-Z0-9.-]+$/.test(ticker)) {
      fail(`Invalid ticker at row ${rowNumber}: ${cells[headerIndex.get("ticker") ?? -1]}`);
    }
    if (!Number.isFinite(close) || close <= 0) {
      fail(`Invalid close at row ${rowNumber}: ${cells[headerIndex.get("close") ?? -1]}`);
    }

    records.push({
      year,
      month,
      ticker,
      close: Number(close.toFixed(4))
    });
  }

  return records;
}

function dedupeLastWins(records: CsvRecord[]) {
  const byKey = new Map<string, CsvRecord>();
  for (const record of records) {
    byKey.set(`${record.year}-${record.month}-${record.ticker}`, record);
  }
  return Array.from(byKey.values()).sort(
    (left, right) => left.year - right.year || left.month - right.month || left.ticker.localeCompare(right.ticker)
  );
}

function toOverridesFile(records: CsvRecord[]) {
  const rows = records.map((record) =>
    `  { year: ${record.year}, month: ${record.month}, ticker: "${record.ticker}", close: ${record.close} }`
  );

  return [
    'import type { MonthlyClosePoint } from "@/data/monthly-closes";',
    "",
    "// Generated from CSV via npm run closes:import",
    "export const monthlyCloseOverrides: MonthlyClosePoint[] = [",
    ...rows,
    "];",
    ""
  ].join("\n");
}

function main() {
  const { csvPath, outPath } = parseArgs(process.argv);
  const csvAbsolutePath = path.resolve(process.cwd(), csvPath);
  const outAbsolutePath = path.resolve(process.cwd(), outPath);

  if (!fs.existsSync(csvAbsolutePath)) {
    fail(`CSV file not found: ${csvAbsolutePath}`);
  }

  const csvText = fs.readFileSync(csvAbsolutePath, "utf8");
  const parsedRecords = readCsvRecords(csvText);
  const records = dedupeLastWins(parsedRecords);
  const fileContent = toOverridesFile(records);

  fs.mkdirSync(path.dirname(outAbsolutePath), { recursive: true });
  fs.writeFileSync(outAbsolutePath, fileContent, "utf8");

  console.log(`Imported ${records.length} monthly close points to ${path.relative(process.cwd(), outAbsolutePath)}`);
}

main();
