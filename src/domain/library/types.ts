export type LibraryCategoryId =
  | "animals"
  | "nature"
  | "ocean"
  | "food"
  | "vehicles"
  | "construction"
  | "space"
  | "science";

/** Permanent encyclopedia category — never stores user photos. */
export type LibraryCategory = {
  id: LibraryCategoryId;
  title: string;
  description: string;
  accent: string;
};

/** Generic quiz item — not personalized; available to everyone. */
export type LibraryQuizQuestion = {
  question: string;
  choices: string[];
  answerIndex: number;
};

/**
 * Permanent encyclopedia entry.
 * Contains universal knowledge only — never memories, never personalized adventures.
 */
export type LibraryEntry = {
  id: string;
  categoryId: LibraryCategoryId;
  title: string;
  pronunciation: string;
  vocabulary: string[];
  facts: string[];
  hasVideo: boolean;
  hasSound: boolean;
  hasQuiz: boolean;
  quiz: LibraryQuizQuestion[];
};
