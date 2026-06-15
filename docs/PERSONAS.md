# Who We Are Building For

A persona reference for this project — a kid-friendly, Scratch-like
"Digital Playground" where children **make and share** projects. Use it to
keep product decisions anchored to real users and to defend scope: if a feature
does not serve one of these people, question it.

> **Sourcing & freshness.** This document synthesizes two internal sources:
> a real-child interest profile (notes dated **2025-07**, describing Jonas at
> age **8**) and a designed persona/axiom system from a sibling learn-to-code
> project (`learn-code`, dated **2025-12**). Jonas is **~9 now**, so treat
> specific interests as directional, not fixed — re-confirm with him before
> leaning hard on any single detail. Names here are first-name-only by design;
> do not add last names, schools, locations, or other identifying details.

---

## Primary persona — Jonas (The Kinetic Architect)

**Age:** ~9 (was 8 in the source notes). A bright, high-energy maker who has
already brushed up against code (Scratch, Minecraft-style commands) and wants to
feel like a **"real" programmer**, not be handed a toy.

**How his mind works.** Jonas is a systems thinker whose signature move is
spotting **"things that are secretly the same"** — hidden connections between
ideas. He gravitates to **evolution trees, network/relationship diagrams**
(e.g. "Cells to Singularity"-style maps), and **mind-mapping**. He draws
characters with personality (mice, bees), builds and animates, and identifies
strongly as a **builder/maker**. Designed with **ADHD in mind**: short feedback
loops, clear transitions, engaging-but-not-overstimulating visuals.

**What he does in a make-and-share playground.**
- Lives in the **editor**, not just the player. He wants "God mode" — building
  worlds, sprites, and hard challenges, then organizing them into packs.
- Is motivated by **sharing**: he builds *specifically* to challenge his sister
  and friends. The point of making is showing someone.
- Wants to **peek under the hood** — see that a block "is really this code."
  Magic he can't inspect frustrates him.

**Needs from us.**
- Fast, tactile **power tools** that feel like modding, not "baby" tools.
- A real **make → package → share** loop (this is why the editor + packager +
  backend all had to be self-hosted and working end to end).
- **Speed controls** and multiple valid solutions — never one forced path.
- **Sandbox freedom** alongside structured challenges.
- Inspectable internals (the "real code" toggle ethos).

**Frustrations.** Slow animations he can't skip; being forced into one solution;
black-box magic; clunky creation tools; long setup before he can *make* something.

---

## Secondary personas

### Zoey (The Narrative Creator) — sibling, ages 4–5+
A precocious early reader who engages through **story**. She uses creation tools
to script dialogue and build scenarios, not just puzzles. She treats on-screen
guides as characters and likes optional text labels and "do it in fewer blocks"
challenges. For a sharing playground, she's the **storyteller** who makes
projects *about* something. Needs: story/dialogue tools, readable labels, and
not being talked down to.

### The Intuitive Explorer — pre-literate, ages 3–4
Touch-native, can't read yet. Explores by direct manipulation with high "go"
energy. Needs **zero-text**, icon/animation/voice-driven interfaces, instant
feedback, and forgiving "wrong" answers. Relevant whenever we expose a feature
to the youngest end of the audience.

---

## Facilitators (the adults in the loop)

- **The Novice Guide** — a parent/teacher with no coding background who wants to
  help without fear of teaching the "wrong" thing. Needs jargon-free context,
  answer keys, and curated/known-good starting points.
- **Leah (Pedagogy-First)** — an engaged facilitator who wants the tool to teach
  *transferable* skills, with visible reasoning behind each mechanic. Hates
  "cool" features that teach nothing.
- **Yehuda (Expert Mentor)** — a professional programmer/parent who wants the
  abstractions to build a **correct mental model** (leaky in the *right* ways,
  no magic that defies real CS) and to be able to extend the tool and show Jonas
  the real code beneath a block. This is the project owner; "would this hold up
  if shown the underlying code?" is a real review lens.

---

## Guiding axioms (adapted from `learn-code`)

These principles travel well to this make-and-share playground and should guide
fork/feature decisions:

1. **Low Floor, High Ceiling, Wide Walls** — trivial to start, deep enough for
   experts, room for many kinds of projects.
2. **Creation is Social** — making is a medium for connection; sharing is the
   payoff, not an afterthought.
3. **Failure is Information** — errors are clues, not punishments.
4. **You can't share what you can't solve** — the "Mario Maker" honesty rule for
   anything published.
5. **Real Tools, the user owns their data** — prefer real, inspectable tools and
   user-owned artifacts over walled gardens. (This is exactly why we forked the
   full stack onto GitHub and self-hosted it rather than depending on upstream.)
6. **Tooling Parity / Dogfooding** — if a tool is good enough for the user, it's
   good enough for us; don't ship a toy version of something real.
7. **No magic that defies real CS** — abstractions may be simplified, but never
   *wrong* in a way a child must later unlearn.

---

## How to use this doc

- **Scope test:** a proposed feature should clearly serve Jonas (primary) or a
  named secondary/facilitator persona. If it serves none, push back.
- **Kid-safe by default:** no profanity, frightening imagery, or requests for
  sensitive identifiers — ever.
- **Re-confirm interests periodically:** these notes age; a 9-year-old's tastes
  shift. Treat specifics as a starting point for a real conversation, not a spec.
