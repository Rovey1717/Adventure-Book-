import type { LibraryRepository } from "@/data/library/LibraryRepository";
import type { LibraryEntry } from "@/domain/library/types";

/** Encyclopedia only — never mutates personal Adventure Book data. */
export class LibraryService {
  constructor(private readonly repository: LibraryRepository) {}

  getCategories() {
    return this.repository.getCategories();
  }

  getEntries(categoryId?: string) {
    return this.repository.getEntries(categoryId);
  }

  getEntry(id: string) {
    return this.repository.getEntryById(id);
  }

  /** Case-insensitive Library search for intentional learning (no memories). */
  search(query: string): LibraryEntry[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return this.repository.getEntries();
    return this.repository
      .getEntries()
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(trimmed) ||
          entry.pronunciation.toLowerCase().includes(trimmed),
      );
  }
}
