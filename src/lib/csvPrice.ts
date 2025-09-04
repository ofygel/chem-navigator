// src/lib/csvPrice.ts
import { getLargeCatalog } from "@/data/catalogLarge";

type Row = {
  productId?: string;
  title?: string;
  cas?: string;
  price?: string;
  currency?: string;
  pack?: string;
  qty?: string;
  leadTime?: string;
  availability?: string;
  state?: string;
};

// простенький CSV-парсер (поддержка ; и , и кавычек)
export function parseCSV(text: string): Row[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  if (lines.length === 0) return [];
  const sep = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";

  const parseLine = (ln: string) => {
    const out: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < ln.length; i++) {
      const ch = ln[i];
      if (ch === '"') {
        if (inQ && ln[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === sep && !inQ) {
        out.push(cur); cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };

  const header = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    const r: any = {};
    header.forEach((h, j) => (r[h] = (cells[j] ?? "").trim()));
    rows.push(r);
  }
  return rows;
}

export function toCSV(rows: Row[], sep = ","): string {
  const headers = ["productId","title","cas","price","currency","pack","qty","leadTime","availability","state"];
  const esc = (s: any) => {
    const v = s == null ? "" : String(s);
    return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
  const out = [headers.join(sep)];
  for (const r of rows) {
    out.push([
      esc(r.productId),
      esc(r.title),
      esc(r.cas),
      esc(r.price),
      esc(r.currency),
      esc(r.pack),
      esc(r.qty),
      esc(r.leadTime),
      esc(r.availability),
      esc(r.state),
    ].join(sep));
  }
  return out.join("\n");
}

// попытка сопоставить строку с товаром (id > cas > title)
export function matchProduct(row: Row) {
  const cats = getLargeCatalog();
  const all = cats.flatMap((c: any) => c.products);
  const norm = (s?: string) => (s ?? "").toLowerCase().replaceAll("ё","е").trim();

  if (row.productId) {
    const p = all.find((x: any) => x.id === row.productId);
    if (p) return p.id;
  }
  if (row.cas) {
    const p = all.find((x: any) => (x.cas ?? "").toLowerCase() === (row.cas ?? "").toLowerCase());
    if (p) return p.id;
  }
  if (row.title) {
    const t = norm(row.title);
    const p = all.find((x: any) => norm(x.title) === t);
    if (p) return p.id;
  }
  return undefined;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
