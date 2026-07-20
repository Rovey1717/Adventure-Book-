export type LibraryCategoryId =
  | "animals"
  | "vehicles"
  | "ocean"
  | "food"
  | "construction"
  | "nature";

/** Permanent encyclopedia category — never stores user photos. */
export type LibraryCategory = {
  id: LibraryCategoryId;
  title: string;
  description: string;
  accent: string;
};

/** Permanent encyclopedia entry with learning assets. */
export type LibraryEntry = {
  id: string;
  categoryId: LibraryCategoryId;
  title: string;
  pronunciation: string;
  facts: string[];
  hasVideo: boolean;
  hasSound: boolean;
  hasQuiz: boolean;
};
