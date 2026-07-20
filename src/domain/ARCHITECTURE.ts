/**
 * Adventure Book — discovery-first product architecture (MVP).
 *
 * PRINCIPLE
 * Real life comes first. Every discovery saves immediately.
 * Families choose Celebrate Now or Continue Exploring — never forced to stop.
 *
 * USER FLOW
 * Discover → Name → Save (Adventure Book + Learning Adventure background)
 *   → Decision: Celebrate Now | Continue Exploring
 * Celebrate Now → short celebration → Learning Card
 * Continue Exploring → Discover + lightweight toast
 * Adventure Book later → same Learning Card (celebration only if never viewed)
 *
 * Learning Card is modular (hero, fact, quiz, wonder, challenge, progress…).
 * Future modules (video, story, song, AR…) plug in without redesigning the UI.
 *
 * INTERNAL SYSTEMS
 * World / Learning Graph · Library (encyclopedia) · Recommendation Engine
 * Adventure unlocks · Memory Graph
 */
export {};
