import type { LibraryRepository } from "@/data/library/LibraryRepository";

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
}
