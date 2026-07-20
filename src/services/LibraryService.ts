import type { LibraryRepository } from "@/data/library/LibraryRepository";
import type { LibraryEntry } from "@/domain/library/types";
import type { LearningGraphService } from "@/services/graph/LearningGraphService";

/**
 * Encyclopedia facade.
 * Garden Learning Graph is the primary knowledge source for MVP.
 * Legacy LibraryRepository remains as optional fallback content.
 */
export class LibraryService {
  constructor(
    private readonly repository: LibraryRepository,
    private readonly learningGraph: LearningGraphService,
  ) {}

  getCategories() {
    return this.repository.getCategories();
  }

  getEntries(categoryId?: string): LibraryEntry[] {
    const fromGraph = this.learningGraph.listLibraryEntries(categoryId);
    if (fromGraph.length > 0) return fromGraph;
    return this.repository.getEntries(categoryId);
  }

  getEntry(id: string): LibraryEntry | null {
    return (
      this.learningGraph.getLibraryEntry(id) ??
      this.repository.getEntryById(id)
    );
  }

  /**
   * Discover search — traverses the Learning Graph first.
   * Never creates memories, adventures, or journey progress.
   */
  search(query: string): LibraryEntry[] {
    const trimmed = query.trim();
    if (!trimmed) return this.learningGraph.listLibraryEntries();
    const graphHits = this.learningGraph.searchAsLibraryEntries(trimmed);
    if (graphHits.length > 0) return graphHits;
    const key = trimmed.toLowerCase();
    return this.repository
      .getEntries()
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(key) ||
          entry.pronunciation.toLowerCase().includes(key),
      );
  }

  getLearningGraph() {
    return this.learningGraph;
  }
}
