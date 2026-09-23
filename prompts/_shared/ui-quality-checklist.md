# UI quality checklist

Dev A runs this before every UI PR. Look at the screen at 360 px first, then 768, then 1280. Then switch to Telugu. Then dark mode.

## Layout

- [ ] Single clear purpose. The main action is obvious within 2 seconds.
- [ ] One primary button in view.
- [ ] Spacing only from the 4 px scale. Edges line up. 16 px gutter on mobile.
- [ ] Nothing jumps while loading (skeletons match the final shape, space reserved for QR, maps, numbers).
- [ ] Stress content: long bus stand names, Telugu text, 6 passengers, 60 seats, 100 table rows. Nothing breaks or clips.

## Type and colour

- [ ] Only type tokens. Inputs at least 16 px. Tabular numbers for times, money, counts.
- [ ] Only colour tokens. Status via `StatusBadge` with label and icon.
- [ ] No custom colours (tokens already pass AA, so any custom colour is a bug).

## Interaction

- [ ] Every tap target at least 44 px (56 px in driver and conductor).
- [ ] Hover, focus visible, active, disabled and loading states for every control.
- [ ] Disabled buttons show why, nearby.
- [ ] Destructive actions confirm with a dialog that names the consequence.
- [ ] Back button works and keeps state (filters and search live in the URL).
- [ ] Double clicking submit never sends twice.

## Copy

- [ ] Every string from i18n. No em dash or en dash. Sentence case. Buttons are verb + object.
- [ ] Errors say what happened and what to do.
- [ ] Empty state has a title, a hint and one action.

## Accessibility

- [ ] Keyboard only: task can be finished, focus order is logical, Escape closes overlays.
- [ ] Screen reader: page title, one `h1`, labels on inputs and icon buttons, live region for timers and results.
- [ ] Works with `prefers-reduced-motion`.
- [ ] Zoom to 200 percent: still usable.

## Performance

- [ ] No layout shift (CLS under 0.1).
- [ ] Maps and heavy panels load lazily.
- [ ] No new heavy client dependency on citizen routes.
