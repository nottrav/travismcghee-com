import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

export function readingTime(markdown: string) {
  const textOnly = markdown
    .replace(/<[^>]+>/g, "")       // strip inline HTML
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")  // strip images
    .replace(/\[[^\]]*\]\([^)]*\)/g, (m) => m.replace(/\[|\]\([^)]*\)/g, "")) // links to text
    .replace(/#{1,6}\s+/g, "")     // strip heading markers
    .replace(/[*_~`>|]/g, "")      // strip emphasis/quote/code markers
    .replace(/---+/g, "")          // strip horizontal rules
    .replace(/\n+/g, " ");         // collapse newlines
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = ((wordCount / 200) + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear().toString();
  let endMonth;
  let endYear;

  if (endDate) {
    if (typeof endDate === "string") {
      endMonth = "";
      endYear = endDate;
    } else {
      endMonth = endDate.toLocaleString("default", { month: "short" });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth}${startYear} - ${endMonth}${endYear}`;
}

export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getDisplayTags(tags?: string[], limit = 2): string[] {
  if (!tags || tags.length === 0) return [];
  if (tags.length <= limit) return tags;

  const unique = [...new Set(tags)];
  const dcimTag = unique.find((tag) => tag.toLowerCase() === "dcim capstone");
  const trimmed = unique.slice(0, limit);

  if (!dcimTag || trimmed.includes(dcimTag)) return trimmed;
  return [dcimTag, ...unique.filter((tag) => tag !== dcimTag)].slice(0, limit);
}
