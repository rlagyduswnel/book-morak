import type { Book } from "@/components/PostCard";

export function parseCSV(csv: string): Book[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0]
    .split(",")
    .map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values =
      line
        .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
        ?.map((value) => value.replace(/^"|"$/g, "").trim()) ?? [];

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return {
      isbn13: row.isbn13,
      title: row.title,
      author: row.author,
      genre: row.genre,
      cover: row.cover,
    };
  });
}
