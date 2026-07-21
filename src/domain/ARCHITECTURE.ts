/**
 * Adventure Book — product + intelligence architecture.
 *
 * PRODUCT PRINCIPLE
 * Real life comes first. Discoveries save immediately.
 * Celebrate Now or Continue Exploring — never force a lesson.
 *
 * INTELLIGENCE LAYER (`src/intelligence/`)
 * Five independent graphs connected by typed relationships:
 *
 *   World Graph      — objective knowledge (no child data)
 *   Learning Graph   — how to teach a World Node (age variants)
 *   Adventure Graph  — multi-node experiences + progress rules
 *   Child Graph      — one child; IDs only, never duplicated world content
 *   Memory Graph     — every real-world discovery (digital childhood)
 *
 * GraphEngine is the OS facade. FamilyAI queries GraphEngine only —
 * never UI state. RecommendationEngine scores relationship traversals
 * (no hardcoded discovery if/else trees).
 *
 * LEARNING PROGRESSION ENGINE
 * Answers: "What is the NEXT BEST thing for THIS child to learn?"
 * Inputs: child profile · discovery · adventure · history · parent goals · level.
 * Output: one intentional activity — never random quizzes.
 *
 * Learning Levels (age stages):
 *   1 (2–3) naming, colors, sounds, matching
 *   2 (4–5) counting, helpers, nature, patterns
 *   3 (6–7) reading, simple engineering, ecosystems
 *   4 (8–10) critical thinking, experiments, history
 *   5 (11+) research, projects, real-world / careers
 *
 * Spanish appears ONLY when parent-enabled or a parent goal —
 * always integrated into the current discovery, never as a random interrupt.
 *
 * Adventure unlock flow:
 *   Celebrate → Unlock → age-appropriate discovery activity → Adventure Card
 *
 * CELEBRATIONS (personalized, rotating)
 * Every celebration celebrates the child — not just the completed lesson.
 * Use the child's first name whenever appropriate. Rotate a large library of
 * encouraging, curiosity-first messages (never school-grade tone).
 * Every celebration surfaces meaningful progress (Explorer XP, Level, Badge,
 * Adventure / Collection / Learning Journey progress, Memory Added).
 * Domain: `src/domain/celebration/messages.ts` · UI: CelebrationBurst,
 * celebrate / adventure-unlock screens, lesson celebrate phases, SavedToast.
 *
 * Learning Graph lessons carry:
 *   min/max age · difficulty · category · objectives · required knowledge ·
 *   related world nodes · duration · languages supported
 *
 * LIVING DISCOVERY CARD (lifelong Learning Journey home)
 * Every Discovery Card is a structured course that never ends — not a fact sheet.
 * Primary sections (Learning Journey is the focus):
 *   ❤️ My Journey · 📖 Learning Journey · 🗺 Adventures ·
 *   🏆 Collections · 🌱 What's Next (Family AI, never random)
 * Learning Journey: reusable sequential path (lessons · quizzes · seek · draw ·
 * mastery · age-gated future lessons). No per-discovery custom path code.
 * Adventure Journey: parallel real-world unlock chain per discovery.
 * Domain: `src/domain/discovery-card/` · UI: DiscoveryCard*Section components.
 * Memory Timeline queries the Memory Graph — the card stores no memory data.
 * Family AI always recommends nextLearningJourneyLesson() — never random.
 *
 * Persistence: InMemoryGraphRepository (MVP) → Firebase/remote later
 * without changing engines.
 *
 * LEGACY COMPAT
 * `src/services/graph/LearningGraphService` remains the Garden UI facade.
 * Migrate screens onto GraphEngine / FamilyAI incrementally.
 */
export {};
