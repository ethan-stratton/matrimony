# Matrimony Beyond Space and Time

A top-down RPG with Wait-based combat (Helen's Mysterious Castle inspired). Built with JavaScript/Canvas, designed for browser play.

🎮 **Play:** https://ethan-stratton.github.io/matrimony/
🛠 **Editor:** https://ethan-stratton.github.io/matrimony/editor.html

---

## TODO

### 🔴 Priority — Core Systems
- [ ] Wire DeepDive enemy sprites into game (animated, not placeholder)
- [ ] Earthbound-style animated backgrounds in combat arena
- [ ] Death animation for enemies
- [ ] Rewards text window after combat
- [ ] Fire visual effect for Fire Punch
- [ ] "Clash!" system — simultaneous timer resolution → timed input minigame
- [ ] Combo detection system — track recent actions, check against combo table
- [ ] Build more rooms in LDtk with decorative tiles

### 🟡 Medium Priority — Content & Polish
- [ ] Add more enemies (design in editor, wire into LDtk maps)
- [ ] Add more weapons/actions beyond Punch/Kick/Shortbow/Defend
- [ ] Weapon Awakening system — weapons evolve based on usage patterns
- [ ] Equipment slots (Weapon, Armor, Cloak, Accessory) — separate from 8 action slots
- [ ] Transformation system — Vampire/Werewolf/Lich metamorphosis
- [ ] NPC dialogue system (non-combat NPCs)
- [ ] Sneak attack bonus (Cloak of Invisibility — DEF penalty, first-strike bonus)
- [ ] Screen shake on Fire Punch (already coded, needs testing)
- [ ] Explosion effect on Fire Punch (already coded, needs testing)

### 🟢 Lower Priority — Features & QoL
- [ ] Downtime activities: Cooking, Fishing, Crafting, Foraging
- [ ] Gambling minigame
- [ ] Companion interaction system
- [ ] Boss gates on upgrade caps (anti-grind)
- [ ] KOTOR-style diminishing enemy respawns
- [ ] Flying/free movement (collision value 2 already set up)
- [ ] Itch.io distribution
- [ ] Minify + obfuscate source for release
- [ ] Safari performance optimization

### ✅ Done
- [x] LDtk level loading, tile rendering, grid movement, camera
- [x] Wait-based combat (Helen's MC inspired, staggered resolve)
- [x] Player sprite (Snoblin Prototype Character, 32×32 at 2× scale)
- [x] Title screen (stars, satellites, comet, procedural planets, sprite planet)
- [x] Screen transitions (fade to black, LDtk `__neighbours`)
- [x] Save/Load system (3 slots, localStorage, shows location name)
- [x] Save slot picker in inventory (Shift to open)
- [x] Enemy dialogue system (cycling conversations before combat)
- [x] Chest entity system (Shortbow item)
- [x] Combat hit effects (hitstop, block sheen, HP flash)
- [x] Battle music + title music + ambient wind
- [x] Splash screen (autoplay unlock) → title → game emerge transition
- [x] CSS frame border (gold bevel)
- [x] Inventory screen with action reorder
- [x] Crisp pixel text rendering (RM2000Alt, 32px, threshold 220)
- [x] Game data editor (enemies, weapons, combos, items, transformations)
- [x] Editor ↔ Game bridge (editor changes reflect in game via localStorage)

---

## Decisions

Tracking design decisions — things we've discussed and either committed to or are still debating.

### ✅ Decided
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Engine | JavaScript/Canvas | Dad clicks a link and plays. No install. |
| Combat | Wait-based (Helen's MC) | Staggered resolve, simultaneous countdowns |
| Font | RM2000Alt, 32px, threshold 220 | Crisp pixel text, RPG Maker 2000 vibes |
| Resolution | 640×480 native, 1.4× CSS | Classic VGA, scales well |
| Controls | Arrows/Z/X/Shift | RPG Maker standard |
| Damage | max(0, eff - def) | Full block possible |
| Defense timing | Active during YOUR countdown only | Once action fires, def = 0 |
| Enemy action visibility | Hidden first exchange, always visible after | Rewards repeat encounters |
| Player wins ties | Player attacks first when WAIT = 0 simultaneously | Feels fair |
| Collision for flying | Value 1 = always wall, Value 2 = walkable/flyable | No map rebuild needed |
| No character levels | Weapon upgrades only | Less grind, more horizontal progression |
| Anti-grind | Boss gates on upgrade caps | Can't over-level weapons |

### 🤔 Under Discussion
| Idea | Status | Notes |
|------|--------|-------|
| Transformations (Vampire/Werewolf/Lich) | Designing | Metamorphosis, not menu choice. Changes sprite, actions, NPC reactions |
| Weapon Awakening (animism) | Designing | Weapons evolve based on what they've been through, not generic XP |
| Combos as discovery | Designing | No combo list — learn by doing. Hidden patterns in action sequences |
| "Clash!" on simultaneous zero | Idea | Timed input minigame when both timers hit 0 at once |
| Companion anti-grind | Idea | Powerful ally who prevents grinding narratively |
| Cooking/Fishing/Crafting | Placeholder | Where in menu? Context-dependent (campfire/water/etc) |
| Equipment menu | Needs design | How many slots? Separate from 8 actions? |
| Sneak attack (Cloak) | Idea | DEF -3, first attack = half WAIT + 10 EFF |
| Diminishing respawns (KOTOR) | Idea | Each kill reduces respawn chance by 15-20% |
| Enemies flee when overleveled | Idea | Instant win if too strong for area |

---

## Tools

- **Game:** `index.html` — the game itself
- **Editor:** `editor.html` — visual data editor for enemies, weapons, combos, items, transformations
- **LDtk:** `LDtK_Matrimony/Matrimony.ldtk` — level design
- **Sprites:** `sprites/` — effect sprites, planet sprite
- **Music:** `sounds/` — battle.mp3, title.mp3

### Editor → Game Bridge
The editor saves to `localStorage('matrimony_editor_data')`. The game reads this on load and overrides `COMBAT_ACTIONS` and `ENEMY_DATA`. Change stats in the editor, refresh the game, changes are live.

---

## Tech Stack
- Pure JavaScript + HTML Canvas
- LDtk for level design
- GitHub Pages for hosting
- localStorage for saves + editor data
- No build step, no dependencies
