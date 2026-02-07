# Codex Multi-Agent Development Prompt: Fallout Tactics Web Game

## Project Overview
Develop a playable, feature-complete **Fallout-inspired tactical RPG web game** in 6–8 weeks (solo dev, Phaser 3 + React). Target: **Full game loop with 1 major zone, 8+ quests, 15+ NPCs, combat, dialogue, and save/load**.

---

## Scope Definition

### Phase 1: Core Foundation (Weeks 1–2)
**Goal:** Skeleton project with isometric map, player movement, basic UI.

**Deliverables:**
- [ ] Phaser 3 project scaffold + React integration
- [ ] Tiled map editor integration (single zone: "Vault 13 Perimeter" or "Shady Sands")
- [ ] Player character movement (A* pathfinding, isometric 32×32 tiles)
- [ ] Camera follow player
- [ ] Basic HUD: portrait, stats (HP, AP, caps, Day)
- [ ] Keyboard / mouse controls

**Tech:**
- Phaser 3 (isometric plugin or custom transform)
- Tiled (map data in JSON)
- React for UI overlay (stats, dialogue, inventory)
- localStorage for save/load

**Files to Create:**
```
src/
  game/
    Game.tsx          # Main Phaser scene
    isometry.ts       # Cartesian ↔ iso conversion
    pathfinding.ts    # A* on tile grid
    state.ts          # Game state (Redux-like)
  components/
    HUD.tsx           # Stats, portrait, AP bar
    DialogueBox.tsx   # NPC dialogue UI
    Inventory.tsx     # Equipment, items
  data/
    zones.json        # Zone configs
    npcs.json         # NPC data
  assets/
    maps/vault13.json # Tiled export
    sprites/          # Player, NPCs, enemies (pixel art)
```

---

### Phase 2: NPCs & Dialogue System (Weeks 3–4)
**Goal:** Functional dialogue trees, NPC interactions, quest tracking.

**Deliverables:**
- [ ] NPC spawning on map (click-to-talk)
- [ ] Dialogue branching system (Ink-like JSON format)
- [ ] Quest log (tracking, objectives, rewards)
- [ ] Reputation system (faction influence)
- [ ] Dynamic dialogue (skill checks: Charisma, Science, Swat)
- [ ] Initial 8 quests (mix of simple → complex)

**NPC Examples:**
1. **Overseer** (Vault 13) – Guard duty quest
2. **Merchant** (Shady Sands) – Loot delivery quest
3. **Raider Boss** – Combat encounter
4. **Scientist** – Fetch quest + skill check
5. **Settlement Elder** – Multi-step quest chain
6. **Scavenger** – Reputation unlock secondary quest
7. **Trader** – Buy/sell items
8. **Radio Operator** – Story relay, quest dispatch

**Dialogue Format:**
```json
{
  "npcId": "overseer",
  "lines": [
    { "id": "greet", "text": "Welcome, Vault Dweller...", "choices": ["quest1", "quest2", "exit"] },
    { "id": "quest1", "text": "Go kill 5 radroaches. Reward: 100 caps.", "action": "acceptQuest", "questId": "kill_radroaches" },
    { "id": "quest2", "text": "[Charisma 50+] I need your best armor.", "requirement": "charisma >= 50", "action": "giveItem" }
  ]
}
```

---

### Phase 3: Combat & Encounters (Weeks 5–6)
**Goal:** Tactical turn-based combat with multiple enemies, cover, abilities.

**Deliverables:**
- [ ] Enemy spawning from encounter triggers
- [ ] Combat turn order (Initiative = speed stat + d10)
- [ ] Action economy: Move (1 AP), Attack (2 AP), Use item (1 AP), Special (1–3 AP)
- [ ] Damage calculation (damage roll + armor reduction)
- [ ] Cover system (tiles marked +20% defense)
- [ ] Special abilities: Burst Fire (3 AP, 2 shots), Aimed Shot (2 AP, +hit%), Grenade (2 AP, AoE)
- [ ] Loot drop on enemy death
- [ ] Victory/defeat conditions

**Enemy Types (at least 5):**
- Radroach (Weak, melee)
- Raider (Medium, ranged, tactics)
- Deathclaw (Strong, melee, high damage)
- Enclave Soldier (Hard, armor, grouped)
- Boss: Supermutant Commander (Very Hard, multi-turn boss fight)

**Combat Loop:**
```
1. Player turn: Move → Attack OR Move → Ability
2. Enemy turns (each enemy)
3. End Turn → AP refill, next round
4. Victory: Loot items, XP, quest progress
5. Defeat: Game Over (load save)
```

---

### Phase 4: Inventory, Crafting & Progression (Week 7)
**Goal:** Item management, equipment, level-up mechanics.

**Deliverables:**
- [ ] Inventory UI (grid, drag-drop optional)
- [ ] Equipment slots (Head, Body, Hands, Legs, Main weapon, Off-hand)
- [ ] Item types: Weapons, armor, consumables (medkits, food, water)
- [ ] Attribute/skill system: ST, PE, EN, CH, IN, AG, LU (fallout SPECIAL lite)
- [ ] Level-up mechanic (every 3 quests or 300 XP)
- [ ] Skill points: Allocate to Guns, Melee, Science, Charisma, Lockpick, Steal
- [ ] Basic crafting: Combine 2 items → 1 new item (e.g., scrap + scrap → ammo)

**Item Table:**
```
Weapons: 10.mm Pistol, Plasma Rifle, Minigun, Combat Shotgun, Sniper Rifle
Armor: Leather, Combat, Power (broken)
Consumables: Stimpak, Water, MRE, RadAway
Misc: Scrap, Caps, Quest items
```

---

### Phase 5: Polish, Save/Load, Deployment (Week 8)
**Goal:** Playable, stable, shippable.

**Deliverables:**
- [ ] Save game to localStorage (JSON state dump)
- [ ] Load screen with slot saves
- [ ] Auto-save after quests/major events
- [ ] Settings: Audio, brightness, difficulty (Easy/Normal/Hard)
- [ ] Main menu with play/settings/credits
- [ ] Bug fixes, balance tweaks
- [ ] Deploy to Vercel / GitHub Pages
- [ ] README with controls, game overview

---

## Technical Architecture

### Stack
- **Frontend:** React 18, TypeScript, Phaser 3
- **State:** Redux Toolkit or Zustand (game state machine)
- **Dialogue:** Custom JSON parser (or Ink.js if time)
- **Pathfinding:** EasyStar.js or custom A*
- **Assets:** Pixel art (32×32 isometric tiles), libre fonts (Press Start 2P)
- **Build:** Vite (fast HMR)

### File Structure
```
fallout-game/
├── src/
│   ├── game/
│   │   ├── Game.tsx           # Main Phaser scene
│   │   ├── scenes/
│   │   │   ├── BootScene.ts   # Assets load
│   │   │   ├── GameScene.ts   # Main gameplay
│   │   │   └── UIScene.ts     # HUD overlay
│   │   ├── objects/
│   │   │   ├── Player.ts
│   │   │   ├── Enemy.ts
│   │   │   ├── NPC.ts
│   │   │   └── Tile.ts
│   │   ├── systems/
│   │   │   ├── combat.ts      # Combat resolver
│   │   │   ├── pathfinding.ts
│   │   │   ├── dialogue.ts
│   │   │   └── quest.ts
│   │   └── data/
│   │       ├── zones.json
│   │       ├── npcs.json
│   │       ├── quests.json
│   │       ├── enemies.json
│   │       └── items.json
│   ├── ui/
│   │   ├── HUD.tsx
│   │   ├── DialogueBox.tsx
│   │   ├── Inventory.tsx
│   │   ├── MainMenu.tsx
│   │   └── styles.css
│   ├── store/
│   │   └── gameState.ts       # Redux or Zustand
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── assets/
│   │   ├── sprites/           # PNG/JSON spritesheets
│   │   ├── maps/              # Tiled JSON
│   │   └── audio/             # OGG/MP3
│   └── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## Quest Examples (8+ to implement)

1. **Vault Duty** (Tutorial)
   - Accept from Overseer
   - Kill 5 radroaches nearby
   - Return, get 50 caps

2. **Merchant Protection** (Medium)
   - Caravan is being robbed by 3 Raiders
   - Combat encounter, defeat them
   - Reward: 200 caps + Leather Armor

3. **Lost Scout** (Fetch)
   - Find missing scout in ruins
   - Navigate to location, grab item
   - Return to quest-giver

4. **Reputation Unlock** (Long chain)
   - Do 3 micro-quests for faction
   - Unlock special dialogue + gear vendor

5. **Science Lab Access** (Skill check)
   - Science skill 60+ OR Charisma check
   - Unlock previously locked area
   - Find schematic (crafting unlock)

6. **Mutant Extermination** (Combat)
   - Hunt down Supermutant Commander
   - Boss fight (high difficulty)
   - Reward: 500 caps, rare weapon

7. **Settlement Defense** (Timed)
   - Waves of enemies attack settlement
   - Defend for 3 rounds
   - Reward: Reputation + settlement unlock

8. **Water Chip Retrieval** (Endgame)
   - Multi-location chain quest
   - Complex dialogue + combat
   - Story climax / new game+ unlock

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✅ 1 fully explorable zone (20+ tiles)
- ✅ 8+ quests completable
- ✅ 3+ combat encounters
- ✅ 15+ NPCs with dialogue
- ✅ Inventory + equip system
- ✅ Save/load functional
- ✅ 5 hours of gameplay
- ✅ No game-breaking bugs

### Polish (If time permits)
- ✅ Music/SFX
- ✅ Difficulty modes
- ✅ Achievements
- ✅ Tutorial mode
- ✅ Mobile responsiveness

---

## Estimated Effort

| Phase | Duration | Agent Role | Key Output |
|-------|----------|-----------|-----------|
| 1: Core Map/Movement | Weeks 1–2 | Dev lead | Playable map, camera, movement |
| 2: NPCs/Dialogue/Quests | Weeks 3–4 | Quest/Dialogue designer | 8 quests, 15 NPCs, branching dialogue |
| 3: Combat System | Weeks 5–6 | Combat/Engine dev | 5 enemy types, skills, loot, balance |
| 4: Inventory/Progression | Week 7 | Systems engineer | Items, leveling, crafting |
| 5: Polish/Ship | Week 8 | QA/DevOps | Bug fixes, deploy, docs |

---

## Launch Checklist

- [ ] Phaser 3 + React boilerplate set up
- [ ] Tiled map created and integrated
- [ ] Player movement + pathfinding working
- [ ] NPC spawning + click-to-talk working
- [ ] Dialogue system parsing JSON correctly
- [ ] Combat resolver functional (damage, XP, loot)
- [ ] Inventory UI and equipment slots working
- [ ] Save/load to localStorage
- [ ] All 8 quests implementable and tested
- [ ] Main menu + settings UI
- [ ] Deployed to live URL
- [ ] README complete with controls + credits

---

## Key Dependencies

```json
{
  "phaser": "^3.55.2",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@reduxjs/toolkit": "^1.9.5",
  "react-redux": "^8.1.1",
  "easystarjs": "^0.4.4",
  "vite": "^4.4.0",
  "typescript": "^5.1.6"
}
```

---

## References & Inspiration

- **Fallout 1/2** (1997–1998) — Tactical turn-based combat, dialogue trees, reputation
- **Fallout Tactics** (2001) — Squad-based, grid combat, cover system
- **Wasteland 2** (2014) — Modern implementation of classic mechanics
- **Divinity: Original Sin 2** — Excellent cover/height system

---

## Notes for Codex / Agent

- **Start with Phase 1:** Get Phaser + map working first before any systems.
- **Iterate on combat balance:** Test early, adjust damage, AP costs, enemy stats.
- **Asset reuse:** Find libre pixel art packs (e.g., opengameart.org) to speed up spriting.
- **Test on mobile:** Responsive design from Day 1.
- **Create dev docs:** Comment code well; future maintainers will thank you.
- **Parallel work:** While one agent does UI, another can work on quest data + dialogue.

---

## Definition of Done

Game is **Launch Ready** when:
1. All 8+ quests playable and balanced
2. No crash-on-play bugs
3. Combat feels fair (win 60-70% difficulty easy, 40-50% normal)
4. Save/load works reliably
5. Game compiles and runs at 60 FPS on modern browser
6. Deployed to public URL (Vercel / GitHub Pages)
7. README + controls documented

---

**Ready to begin? Start Phase 1 immediately.**
