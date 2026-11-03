# Icon choreography

Every one of the 121 Vellum glyphs has its own hover gesture and a different press reply.
The gesture is chosen from what the icon does, not from a shared hover rule:
undo rewinds, download drops, crop frames, eye blinks, flip mirrors, bell swings,
trash rattles, and the alignment family squashes toward its own guide.

Hover is a one-shot performance resolved back to rest. Press is a shorter,
compressed answer with a different axis or direction, so a click never reads as a
second hover. Only `transform` and `opacity` animate; nothing affects layout.

Implementation: `src/styles/icon-motion.css` (per-glyph keyframes and timing),
verified by `node scripts/icon-choreography.mjs`.

## Workspace

Navigation and creation surfaces. Gestures follow the destination.

| Icon | Hover | Press |
|---|---|---|
| `home` | the roof lifts 2px and the mark grows 7% | drops 1.2px and compresses to 92% |
| `projects` | the folder tilts open 5° | turns 2° and compresses to 92% |
| `templates` | the tiles tilt 2.5° and grow 6% | tilt −3° and snap to 90% |
| `brand` | the peak rises 2.2px | presses 1px down and 88% tall |
| `spark` | a 24° flare at 112% | twists −14° to 86% |
| `print` | the sheet feeds up 2px | squashes to 86% tall |
| `more` | the dots fan 20% wider | pinch to 80% |
| `elements` | the shapes orbit 10° | orbit back to −5° at 90% |
| `text` | the baseline lifts 1.6px | stamps to 84% tall |
| `uploads` | the tray bounces 2.2px | drops 1.6px to 90% |
| `background` | the horizon pans 2.4px | recoils −1.4px |
| `present` | the screen grows 9% | collapses to 86% |
| `share` | the nodes push out 7° | pull back −5° at 88% |

## Files, history and transport

Direction carries meaning: rewind, advance, drop, fold.

| Icon | Hover | Press |
|---|---|---|
| `download` | the arrow drops 2.4px | lands and squashes to 84% tall |
| `undo` | rewinds 26° | steps forward 9° at 88% |
| `redo` | advances 26° | steps back −9° at 88% |
| `help` | leans in 9° | shrugs −7° at 90% |
| `bell` | swings −13° / 10° / −4° from the crown | tilts 5° and settles at 90% |
| `plus` | turns a quarter to become an × | folds to 45° and 84% |
| `search` | the lens sweeps 1.8px across | recoils 1px and focuses at 90% |
| `fit` | the frame opens 13% | closes to 87% |
| `play` | the triangle leans 2.2px forward | presses back at 84% |
| `pause` | the bars squeeze to 84% wide | pinch to 68% |
| `close` | one quarter turn | a smaller 45° turn at 82% |
| `chevronLeft` | travels 2.6px left | squashes 80% along the axis |
| `chevronRight` | travels 2.6px right | squashes 80% along the axis |
| `chevronUp` | travels 2.6px up | squashes 80% along the axis |
| `chevronDown` | travels 2.6px down | squashes 80% along the axis |
| `bolt` | flashes −9° at 112% | strikes 1.6px down to 88% |
| `alert` | wobbles 7° / −6° / 3° | flinches to 85% |
| `arrowRight` | slides 2.8px right | recoils 1.2px left at 85% |
| `arrowLeft` | slides 2.8px left | recoils 1.2px right at 85% |
| `arrowUpRight` | escapes 2.2px diagonally | recoils 1px at 90% |

## State and visibility

Small, legible answers: a blink, a lift, a shake.

| Icon | Hover | Press |
|---|---|---|
| `check` | stamps 20% larger with a −7° twist | stamps down to 80% |
| `shuffle` | shifts 1.8px and twists 6° | crosses −7° at 90% |
| `cloud` | floats 2.2px | flattens to 84% tall |
| `lock` | the shackle lifts 1.6px | snaps 1.2px down to 89% |
| `unlock` | swings open 9° | clicks −5° at 90% |
| `eye` | opens 15% wider | blinks to 45% tall |
| `eyeOff` | the slash tilts −9° | closes to 70% tall |
| `chevronsUp` | travels 3.2px up | compresses to 76% tall |
| `chevronsDown` | travels 3.2px down | compresses to 76% tall |
| `comment` | the bubble lifts 1.4px and grows 9% | flattens to 86% tall |

## Documents and objects

Pages, copies and layers move along the axis of their meaning.

| Icon | Hover | Press |
|---|---|---|
| `page` | peels −3.5° at its corner | presses flat to 88% |
| `duplicate` | the copy steps 2px out | merges 1.2px back at 93% |
| `copy` | a shorter 1.6px offset | slides back at 90% |
| `pencil` | writes a −11° stroke | dabs to 85% |
| `external` | escapes 2.4px out | recoils 1px at 89% |
| `trash` | rattles −7° / 5° / −3° | takes the weight at 84% tall |
| `palette` | turns 15° to offer a colour | tilts −8° at 89% |
| `magic` | waves the wand −17° | sparks 14% then settles at 94% |
| `image` | zooms 11% toward the viewer | closes to 87% |
| `code` | the brackets open 14% wide | close to 86% |
| `sheet` | scrolls 1.8px sideways | compresses to 91% |
| `video` | the playhead nudges 1.8px | stops at 87% |
| `doc` | the page lifts 1.7px and tilts −2.5° | is pressed to 87% tall |
| `website` | the window lifts 1.2px | settles to 88% |
| `layers` | the stack spreads 2.2px | collapses to 82% tall |
| `sliders` | the knobs slide 2px | compress to 86% wide |
| `menu` | the lines lean 1.8px | pinch to 80% wide |

## Creation shortcuts

Open, add, annotate: the gesture suggests the action.

| Icon | Hover | Press |
|---|---|---|
| `custom` | the corners open 12% | snap to 86% |
| `upload` | the arrow rises 2.4px | presses down at 85% tall |
| `type` | the letterform widens 10% | inks down to 84% tall |
| `social` | a heartbeat to 120% with a rebound | squeezes to 84% |
| `printable` | the sheet slides out 1.6px | presses to 86% tall |
| `board` | the board slides 2.2px | taps to 89% |

## Alignment and distribution

Every glyph travels toward its own guide; press squashes toward that same guide.

| Icon | Hover | Press |
|---|---|---|
| `alignLeft` | nudges 2.2px toward the left guide | squashes 90% from the left edge |
| `alignCenter` | stretches 9% vertically | compresses to 86% tall |
| `alignRight` | nudges 2.2px toward the right guide | squashes 90% from the right edge |
| `alignTop` | nudges 2.2px toward the top guide | squashes 90% from the top edge |
| `alignMiddle` | stretches 9% horizontally | compresses to 86% wide |
| `alignBottom` | nudges 2.2px toward the bottom guide | squashes 90% from the bottom edge |
| `alignHorizontalStart` | nudges 2.4px left | squashes 88% from the left edge |
| `alignHorizontalCenter` | widens 7% | compresses to 85% wide |
| `alignHorizontalEnd` | nudges 2.4px right | squashes 88% from the right edge |
| `alignVerticalStart` | nudges 2.4px up | squashes 88% from the top edge |
| `alignVerticalCenter` | heightens 7% | compresses to 85% tall |
| `alignVerticalEnd` | nudges 2.4px down | squashes 88% from the bottom edge |
| `distributeH` | spreads 10% wider | closes to 90% wide |
| `distributeV` | spreads 10% taller | closes to 90% tall |

## Layering and tools

Depth moves front/back; tools perform their own small action.

| Icon | Hover | Press |
|---|---|---|
| `layerFront` | lifts 2.2px forward | settles back at 91% |
| `layerBack` | drops 2.2px backward | settles forward at 91% |
| `group` | pulls the handles in to 108% | tightens to 87% with a 3° turn |
| `ungroup` | separates 10% with a −3.5° turn | gathers to 89% |
| `clipboard` | lifts 1.6px | presses to 87% tall |
| `component` | turns the diamond 45° | turns back −22° at 89% |
| `paintBucket` | tips −13° to pour | splashes 12% then settles |
| `paintbrush` | draws a −13° stroke | dabs to 84% |
| `language` | rotates the globe 12° | settles −4° at 87% |

## Utility and studio

The smallest gestures: stretch, pinch, rotate, slide.

| Icon | Hover | Press |
|---|---|---|
| `minus` | stretches 26% wide | pinches to 74% |
| `zoomIn` | grows 15% | closes to 86% |
| `zoomOut` | shrinks to 88% | pushes out to 112% |
| `rotate` | turns 30° | whips back −18° at 88% |
| `clock` | the hands advance 13° | tick back −7° at 91% |
| `info` | pops 10% | presses to 85% |
| `scan` | the focus frame opens 11% | closes to 89% |
| `sidebar` | the edge slides 2px | collapses 86% from the left |
| `sidebarOpen` | pushes 3.2px open | pulls back 1.2px at 89% |
| `refresh` | rotates 42° | rewinds −32° at 88% |
| `camera` | the body lifts 1px and grows 6% | shutter squashes to 85% tall |
| `film` | the strip advances 2px | stops at 88% wide |
| `music` | the notes bob 2.2px and tilt −7° | beat down to 87% |

## Media

Sound, cuts, loops and the image tools.

| Icon | Hover | Press |
|---|---|---|
| `volume` | the waves widen 10% | mute-squeeze to 87% |
| `volumeOff` | shakes −7° | shakes back 7° at 86% |
| `scissors` | snips 11° | closes −9° at 85% |
| `split` | the halves part 14% | cut to 84% wide |
| `skipStart` | travels 2.4px to the start | squashes 82% to the edge |
| `skipEnd` | travels 2.4px to the end | squashes 82% to the edge |
| `loop` | chases 26° around | rewinds −20° at 88% |
| `record` | swells 16% | collapses to 78% |
| `waveform` | the levels jump 20% | flatten to 68% tall |
| `photo` | the aperture turns 38° | closes −22° at 88% |
| `crop` | the frame closes to 89% | snaps open to 110% |
| `flipX` | mirrors fully and returns | squeezes to 68% wide |
| `flipY` | mirrors vertically and returns | squeezes to 68% tall |

## Tone and compare

Light, temperature, levels and the original.

| Icon | Hover | Press |
|---|---|---|
| `sun` | the rays rotate 34° at 110% | dims to 85% |
| `contrast` | turns 180° to show the far side | settles 22° at 88% |
| `thermometer` | the mercury rises 2.4px | drops 1.4px to 88% tall |
| `histogram` | the bars grow 16% from the floor | flatten to 80% from the floor |
| `compare` | the panels push 12% apart | close to 86% wide |
| `droplet` | falls 2.4px | splashes 16% then settles at 94% |

## Mechanics

- Each glyph declares `--im-hover` and `--im-press` animation shorthands on its
  `[data-vellum-icon]` element; the shared rules resolve them on the ink group.
- Interactive ancestors (`button`, links, `role="button"`, tabs) trigger the
  gesture from anywhere in the hit area, not only over the 24px glyph.
- The two ink layers live in one `.vellum-icon-ink` group, so the duotone mark
  moves as a single object and the echo never drifts into a second glyph.
- `transform-box: fill-box` rotates every glyph around its own geometry;
  alignment and edge tools override the origin to squash toward their guide.
- Disabled controls are excluded. Keyboard focus replays the hover gesture.
- `prefers-reduced-motion: reduce` removes every animation, transform and
  transition while keeping colour and the static duotone.
