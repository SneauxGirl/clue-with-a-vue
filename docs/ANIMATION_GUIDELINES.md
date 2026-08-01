# Animation Guidelines

This project uses purposeful animations per Emil Kowalski's design engineering philosophy 
[emilkowal.ski](https://emilkowal.ski/) and skills repo.

Values here are exact and should be copied, not approximated, when implementing
components.

## 1. Purpose & frequency

Every animation must answer "why does this animate?" — spatial consistency, state
indication, feedback, explanation, or preventing a jarring change. "It looks cool"
on a frequently-seen element is not a purpose.

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | No animation. Ever. |
| Tens of times/day (hover effects, list navigation) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, feedback, celebrations) | Can add delight |

In this dashboard: table sort/filter/group happen constantly — keep those instant.
Modal-like surfaces (if any), toasts, and first-search empty→results transitions
are the right places for standard motion.

## 2. Easing & duration

Decision order for easing:

- Entering or exiting → **`ease-out`** (starts fast, feels responsive)
- Moving / morphing on screen → **`ease-in-out`**
- Hover / color change → **`ease`**
- Constant motion (marquee, progress) → **`linear`**
- Default → **`ease-out`**

`ease-in` on UI is always a finding — it starts slow, delaying the exact moment the
user is watching. Built-in CSS easings are too weak for deliberate motion, so this
project overrides them with stronger custom curves, defined as tokens in
`src/style.css`:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve */
```

Duration budgets — UI animations stay under 300ms:

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

## 3. Physicality & origin

- Never `scale(0)` — nothing in the real world appears from nothing. Target:
  `scale(0.9–0.97)` + `opacity: 0`.
- Popovers/dropdowns/tooltips scale from their trigger, not center
  (`transform-origin` set to the trigger). Modals are exempt — centered is correct.
- Press feedback: `transform: scale(0.97)` on `:active` with
  `transition: transform 160ms ease-out`. Keep it subtle (0.95–0.98).

## 4. Interruptibility

CSS transitions retarget from the current state mid-animation; keyframes restart
from zero. Anything triggered rapidly or reversible mid-motion (toasts stacking,
toggles, drags, expand/collapse) must use transitions or springs, not keyframes.

- Entry without JS: `@starting-style` (legacy fallback: a mounted-state data
  attribute set after mount).
- Asymmetric timing: deliberate phases (press, hold, destructive confirm) animate
  slower; the system's response snaps. Symmetric timing on press-and-release is a
  finding.

## 5. Performance

- Animate `transform` and `opacity` only. `width`/`height`/`margin`/`padding`/
  `top`/`left` trigger layout + paint + composite.
- `transition: all` is always a finding — it animates unintended properties
  off-GPU. Name the properties explicitly.
- Keep transition-time `filter: blur()` under 20px.

## 6. Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop movement */
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* touch fires false hovers on tap */
}
```

Reduced motion means fewer and gentler animations, not zero — keep transitions
that aid comprehension (opacity/color), remove position/scale changes.

## 7. Cohesion & tokens

This is a fraud-analyst dashboard — motion stays crisp and utilitarian, not
bouncy or playful. Curves and durations live as shared tokens in
`src/style.css` `@theme`, not hand-typed per component. Group entrances (e.g.
table rows on filter) get a 30–80ms stagger at most, and it must never block
interaction.

## 8. Missed opportunities to watch for

- State changes that teleport (content swaps, layout jumps) where a brief
  transition prevents a jarring change — e.g. summary cards populating after
  search, filter/sort re-ordering the event table.
- Spatially-connected UI with no motion explaining where it came from.
- Loading → results and empty → error transitions are good candidates for a
  short opacity/transform transition rather than a hard cut.
