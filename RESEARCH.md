# Research Note

## The learner problem

Low-Level Design is easy to *start* and hard to *evaluate*. Unlike an algorithms problem, an LLD problem
(Parking Lot, Elevator, Vending Machine) rarely has one correct answer — it has many defensible designs and many
subtly bad ones. A learner who designs a `ParkingLot` class that owns everything (spots, pricing, tickets,
vehicles) will produce code that *runs*, so nothing tells them it's a design smell. The feedback loop that makes
practice work for algorithms ("your code passed/failed these test cases") doesn't exist for design quality, so
learners either stop practicing after one or two attempts, or practice without ever finding out whether they're
improving.

Three things make this specifically hard to build a tool for:

1. **No single ground truth.** A grader can't just diff the learner's answer against a canonical solution — two
   valid designs can look structurally very different.
2. **Structure and reasoning are both part of "good."** A design can have all the right class names and still be
   bad (a `ParkingLot` with 15 methods and no delegation), or have imperfect structure but a well-reasoned
   trade-off ("I didn't model `Level` separately because this lot is single-level by requirement").
3. **Improvement only shows up over multiple attempts.** A single piece of feedback on one attempt doesn't tell a
   learner if they're actually getting better at *decomposition* in general.

## Existing approaches researched

| Approach | What it gets right | Gap for this problem |
|---|---|---|
| **LeetCode / Educative "LLD" tracks** | Structured problem sets, some with reference solutions | Mostly one-way content (read a model answer); no submission or feedback on *your own* design |
| **Mock interview platforms (Pramp, interviewing.io)** | High-quality, nuanced human feedback on trade-offs | Not on-demand, not repeatable at will, doesn't scale, no persistent history to compare attempts |
| **Pasting a design into ChatGPT/Claude directly** | Flexible, nuanced reasoning, zero setup | No structure (feedback quality depends entirely on how well you phrase the question), no problem set, no history, nothing deterministic to anchor the feedback — two runs on the same design can disagree |
| **Design pattern books / repos (Head First Design Patterns, Grokking OOD)** | Deep, well-explained reference material | Zero interactivity — reading is not practicing |
| **Whiteboard/diagram tools (Excalidraw, Miro) + manual review** | Good for expressing a design visually | No automatic evaluation at all; requires a human reviewer every time |

The common gap: every tool is either **practice without feedback** (books, diagram tools, most problem sets) or
**feedback without repeatable structure** (raw LLM chat, human mock interviews). Nothing combines a structured,
repeatable practice loop with feedback that's both grounded (not just vibes) and nuanced (not just a checklist).

## Product direction

Build the practice loop directly around that gap: **Choose problem → Design → Submit → Get feedback → Review →
Try again**, where "design" means filling in a *structured* model (classes/interfaces, fields, methods,
relationships, and a written rationale) rather than free text, a diagram image, or raw code.

Structured input is the key decision this research points to: it's the only format that is simultaneously
(a) meaningful for a learner to produce — it mirrors what they'd actually design in an interview or on a
whiteboard — and (b) checkable by software. Free text can't be reliably parsed for "did they model the right
entities." A diagram image would need OCR/vision parsing before any evaluation could run at all. A structured
model gives a deterministic evaluator something concrete to check (expected entities, relationships, responsibility
statements) while a written rationale field still leaves room for the nuanced, non-deterministic part — explaining
*why* — that a language model is actually good at judging. That split (deterministic structure, AI-judged
reasoning) is the core design decision explored further in `DESIGN.md`.
