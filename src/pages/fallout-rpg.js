import React, { useMemo, useReducer, useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import styles from './fallout-rpg.module.css';

const MAP_SIZE = 7;
const MOVEMENT_RANGE = 3;
const MAX_AP = 6;

const ZONES = [
  { name: 'Vault 17', type: 'vault', description: 'Sterile corridors and humming reactors.' },
  { name: 'Ashen Market', type: 'settlement', description: 'Traders, fixers, and a roaring generator.' },
  { name: 'Cracked Highway', type: 'road', description: 'A broken artery littered with rusted cars.' },
  { name: 'Feral Nest', type: 'ruins', description: 'Echoes and claw marks on concrete.' },
  { name: 'Glow Gulch', type: 'radiation', description: 'Sickly green light seeps from the ground.' },
  { name: 'Dust Farm', type: 'outpost', description: 'Windmills fight to pull water from sand.' },
  { name: 'Watcher Ridge', type: 'highland', description: 'A sniper nest with a full horizon.' },
  { name: 'Subway Wastes', type: 'underground', description: 'Dark tunnels and distant metal clanks.' },
  { name: 'Delta Docks', type: 'waterfront', description: 'Sunken barges and scrap divers.' },
  { name: 'Mirage Flats', type: 'desert', description: 'Heat haze hides what stalks you.' },
  { name: 'Signal Tower', type: 'tower', description: 'A lonely beacon spitting static.' },
  { name: 'Red Quarry', type: 'industrial', description: 'Dust storms and abandoned rigs.' },
];

const ENEMIES = [
  { name: 'Radroamer', health: 18, attack: 5, reward: { caps: 12, scrap: 2 } },
  { name: 'Scrap Stalker', health: 24, attack: 7, reward: { caps: 20, ammo: 3 } },
  { name: 'Ash Raider', health: 22, attack: 6, reward: { caps: 16, med: 1 } },
  { name: 'Glowling', health: 28, attack: 8, reward: { caps: 24, artifact: 1 } },
];

const QUESTS = [
  { id: 'signal', title: 'Trace the Signal', reward: 'Unlock the Signal Tower relay.' },
  { id: 'water', title: 'Secure Water Filters', reward: 'Supply the Dust Farm with filters.' },
  { id: 'map', title: 'Map the Quarries', reward: 'Deliver a full map to Ashen Market.' },
];

const initialState = {
  day: 1,
  health: 100,
  maxHealth: 100,
  radiation: 8,
  thirst: 12,
  hunger: 10,
  caps: 40,
  ammo: 6,
  medkits: 2,
  scrap: 3,
  artifacts: 0,
  position: { x: 3, y: 3 },
  zoneIndex: 0,
  log: [
    { type: 'system', text: "Pip-Boy online. Your mission: keep the Wasteland alive." },
  ],
  encounter: null,
  quest: QUESTS[0],
  questProgress: 0,
  reputation: 12,
  ap: MAX_AP,
  maxAp: MAX_AP,
  playerTurn: true,
};

const zonePalette = {
  vault: '🧪',
  settlement: '🏚️',
  road: '🛣️',
  ruins: '🏚️',
  radiation: '☢️',
  outpost: '💧',
  highland: '⛰️',
  underground: '🚇',
  waterfront: '⚓',
  desert: '🌵',
  tower: '📡',
  industrial: '🏭',
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const addLog = (state, text, type = 'event') => ({
  ...state,
  log: [{ type, text }, ...state.log].slice(0, 12),
});

const rollEncounter = () => {
  const chance = Math.random();
  if (chance < 0.45) {
    const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    return {
      ...enemy,
      currentHealth: enemy.health,
    };
  }
  return null;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'MOVE': {
      if (state.ap <= 0) return addLog(state, "Pas assez d'AP pour se déplacer.", 'warning');
      const nextPosition = {
        x: clamp(state.position.x + action.payload.x, 0, MAP_SIZE - 1),
        y: clamp(state.position.y + action.payload.y, 0, MAP_SIZE - 1),
      };
      const zoneIndex = (nextPosition.x + nextPosition.y * MAP_SIZE) % ZONES.length;
      let nextState = {
        ...state,
        position: nextPosition,
        zoneIndex,
        ap: clamp(state.ap - 1, 0, state.maxAp),
        thirst: clamp(state.thirst + 1, 0, 100),
        hunger: clamp(state.hunger + 1, 0, 100),
        radiation: clamp(state.radiation + (Math.random() < 0.25 ? 2 : 0), 0, 100),
      };
      nextState = addLog(
        nextState,
        `Déplacement tactique vers ${ZONES[zoneIndex].name}.`,
      );
      const encounter = state.encounter || (Math.random() < 0.35 ? rollEncounter() : null);
      if (encounter && !state.encounter) {
        nextState = addLog(nextState, `Alerte : ${encounter.name} repéré !`, 'alert');
      }
      return {
        ...nextState,
        encounter: encounter || state.encounter,
      };
    }
    case 'REST': {
      let nextState = {
        ...state,
        day: state.day + 1,
        health: clamp(state.health + 18, 0, state.maxHealth),
        thirst: clamp(state.thirst + 2, 0, 100),
        hunger: clamp(state.hunger + 1, 0, 100),
      };
      nextState = addLog(nextState, 'Repos express. Le Pip-Boy optimise l’énergie.');
      return nextState;
    }
    case 'SCAVENGE': {
      if (state.ap < 2) return addLog(state, "Pas assez d'AP pour fouiller.", 'warning');
      const lootRoll = Math.random();
      let caps = 0;
      let ammo = 0;
      let medkits = 0;
      let scrap = 0;
      // Loot table influenced by zone type
      const zoneType = ZONES[state.zoneIndex].type;
      if (zoneType === 'settlement') {
        if (lootRoll < 0.5) caps = 15 + Math.floor(Math.random() * 20);
        else ammo = 1 + Math.floor(Math.random() * 3);
      } else if (zoneType === 'ruins' || zoneType === 'industrial') {
        if (lootRoll < 0.4) scrap = 2 + Math.floor(Math.random() * 4);
        else if (lootRoll < 0.7) medkits = 1;
        else caps = 5 + Math.floor(Math.random() * 10);
      } else {
        if (lootRoll < 0.35) {
          caps = 8 + Math.floor(Math.random() * 12);
        } else if (lootRoll < 0.6) {
          ammo = 2 + Math.floor(Math.random() * 4);
        } else if (lootRoll < 0.8) {
          medkits = 1;
        } else {
          scrap = 2;
        }
      }
      let nextState = {
        ...state,
        day: state.day + 1,
        caps: state.caps + caps,
        ammo: state.ammo + ammo,
        medkits: state.medkits + medkits,
        scrap: state.scrap + scrap,
        thirst: clamp(state.thirst + 3, 0, 100),
        hunger: clamp(state.hunger + 2, 0, 100),
        ap: clamp(state.ap - 2, 0, state.maxAp),
      };
      nextState = addLog(
        nextState,
        `Fouille réussie. +${caps} caps, +${ammo} munitions, +${medkits} medkit, +${scrap} ferraille.`,
      );
      return nextState;
    }
    case 'USE_MEDKIT': {
      if (state.medkits <= 0) return state;
      let nextState = {
        ...state,
        medkits: state.medkits - 1,
        health: clamp(state.health + 30, 0, state.maxHealth),
        radiation: clamp(state.radiation - 8, 0, 100),
      };
      nextState = addLog(nextState, 'Injection de Stimpak. Les signaux vitaux se stabilisent.');
      return nextState;
    }
    case 'FIGHT': {
      if (!state.encounter) return state;
      if (state.ap < 2) return addLog(state, "Pas assez d'AP pour attaquer.", 'warning');
      const enemy = state.encounter;
      const playerDamage = 6 + Math.floor(Math.random() * 8);
      const enemyHealth = enemy.currentHealth - playerDamage;
      let nextState = {
        ...state,
        ammo: clamp(state.ammo - 1, 0, 999),
        ap: clamp(state.ap - 2, 0, state.maxAp),
      };
      if (enemyHealth <= 0) {
        nextState = {
          ...nextState,
          encounter: null,
          caps: nextState.caps + (enemy.reward.caps || 0),
          ammo: nextState.ammo + (enemy.reward.ammo || 0),
          medkits: nextState.medkits + (enemy.reward.med || 0),
          scrap: nextState.scrap + (enemy.reward.scrap || 0),
          artifacts: nextState.artifacts + (enemy.reward.artifact || 0),
          questProgress: clamp(nextState.questProgress + 1, 0, 4),
          reputation: nextState.reputation + 2,
        };
        nextState = addLog(nextState, `Vous éliminez ${enemy.name}. Butin récupéré.`);
        return nextState;
      }
      const retaliation = enemy.attack + Math.floor(Math.random() * 6);
      nextState = {
        ...nextState,
        encounter: { ...enemy, currentHealth: enemyHealth },
        health: clamp(nextState.health - retaliation, 0, nextState.maxHealth),
        radiation: clamp(nextState.radiation + 2, 0, 100),
      };
      nextState = addLog(
        nextState,
        `Vous infligez ${playerDamage} dégâts. ${enemy.name} riposte (${retaliation}).`,
      );
      return nextState;
    }

    case 'END_TURN': {
      // enemy acts once if present, then refill AP
      let nextState = { ...state };
      if (state.encounter) {
        const enemy = state.encounter;
        const damage = enemy.attack + Math.floor(Math.random() * 6);
        nextState = {
          ...nextState,
          health: clamp(nextState.health - damage, 0, nextState.maxHealth),
          radiation: clamp(nextState.radiation + 1, 0, 100),
        };
        nextState = addLog(nextState, `${enemy.name} profite de l'ouverture et inflige ${damage} dégâts.`);
      }
      nextState = {
        ...nextState,
        ap: nextState.maxAp,
        playerTurn: true,
      };
      return nextState;
    }
    case 'FLEE': {
      if (!state.encounter) return state;
      const escape = Math.random() > 0.35;
      let nextState = {
        ...state,
        encounter: escape ? null : state.encounter,
        ap: escape ? clamp(state.ap - 1, 0, state.maxAp) : clamp(state.ap - 2, 0, state.maxAp),
        health: clamp(state.health - (escape ? 4 : 10), 0, state.maxHealth),
        radiation: clamp(state.radiation + 3, 0, 100),
      };
      nextState = addLog(
        nextState,
        escape ? 'Vous semez la menace dans la poussière.' : 'Fuite ratée ! L’ennemi vous bloque.',
      );
      return nextState;
    }
    case 'END_DAY': {
      let nextState = {
        ...state,
        day: state.day + 1,
        thirst: clamp(state.thirst + 5, 0, 100),
        hunger: clamp(state.hunger + 4, 0, 100),
        radiation: clamp(state.radiation + 1, 0, 100),
        health: clamp(state.health - 6, 0, state.maxHealth),
      };
      nextState = addLog(nextState, 'Nuit froide. Les systèmes de survie se dégradent.');
      return nextState;
    }
    case 'ADVANCE_QUEST': {
      const nextQuest = QUESTS[(QUESTS.findIndex((quest) => quest.id === state.quest.id) + 1) % QUESTS.length];
      let nextState = {
        ...state,
        quest: nextQuest,
        questProgress: 0,
        reputation: state.reputation + 5,
      };
      nextState = addLog(nextState, `Mission mise à jour : ${nextQuest.title}.`, 'system');
      return nextState;
    }
    default:
      return state;
  }
};

const FalloutRpg = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isFull, setIsFull] = useState(false);
  const pageRef = useRef(null);
  const zone = ZONES[state.zoneIndex];
  const mapTiles = useMemo(() => {
    return Array.from({ length: MAP_SIZE * MAP_SIZE }, (_, index) => {
      const x = index % MAP_SIZE;
      const y = Math.floor(index / MAP_SIZE);
      const zoneInfo = ZONES[index % ZONES.length];
      return {
        x,
        y,
        zoneInfo,
      };
    });
  }, []);

  const healthPercent = (state.health / state.maxHealth) * 100;

  useEffect(() => {
    const onFullscreenChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          dispatch({ type: 'MOVE', payload: { x: 0, y: -1 } });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          dispatch({ type: 'MOVE', payload: { x: 0, y: 1 } });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          dispatch({ type: 'MOVE', payload: { x: -1, y: 0 } });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          dispatch({ type: 'MOVE', payload: { x: 1, y: 0 } });
          break;
        case ' ': // space -> scavenge
          e.preventDefault();
          dispatch({ type: 'SCAVENGE' });
          break;
        case 'Enter':
          e.preventDefault();
          if (state.encounter) dispatch({ type: 'FIGHT' });
          break;
        default:
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, state.encounter]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && pageRef.current) {
        await pageRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      // ignore
    }
  };

  const reachableSet = useMemo(() => {
    const set = new Set();
    mapTiles.forEach((t) => {
      const dist = Math.abs(t.x - state.position.x) + Math.abs(t.y - state.position.y);
      if (dist <= MOVEMENT_RANGE) set.add(`${t.x}-${t.y}`);
    });
    return set;
  }, [mapTiles, state.position]);

  const tips = [
    'Utilisez les AP pour optimiser vos actions chaque tour.',
    'Fouillez les settlements pour plus de caps.',
    "Surveillez l'irradiation — utilisez un medkit si nécessaire.",
    'Espace = fouiller, Entrée = tirer, Flèches/WASD pour bouger.',
  ];
  const currentTip = useMemo(() => {
    if (state.radiation > 60) return "Radiation élevée — cherchez des medkits ou un abri.";
    if (state.hunger > 70) return "Faim critique — trouvez de la nourriture ou reposez-vous.";
    if (state.thirst > 70) return "Soif critique — trouvez de l\'eau filtrée.";
    return tips[Math.floor(Math.random() * tips.length)];
  }, [state.radiation, state.hunger, state.thirst]);

  return (
    <Layout title="Fallout Web RPG" description="A Fallout-inspired RPG experience in the browser.">
      <div ref={pageRef} className={`${styles.page} ${isFull ? styles.fullscreen : ''}`}>
        <header className={styles.header}>
          <h1>WASTELAND OPERATOR</h1>
          <p>
            Prenez le contrôle d’un opérateur Vault-Tec, explorez la zone contaminée, gérez vos ressources
            et survivez assez longtemps pour reconnecter les relais du désert.
          </p>
          <div style={{ marginTop: '0.8rem' }}>
            <button type="button" className={styles.fullscreenButton} onClick={toggleFullscreen}>
              {isFull ? 'Quitter plein écran' : 'Plein écran'}
            </button>
            <span style={{ marginLeft: '0.8rem', color: '#9bd39b', fontSize: '0.85rem' }}>Raccourcis: flèches / WASD, espace = fouiller, Entrée = tirer</span>
          </div>
          <div className={styles.tip}>
            {currentTip}
          </div>
        </header>

        <section className={styles.layout}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Système vital</div>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <span>Jour</span>
                <strong>{state.day}</strong>
              </div>
              <div className={styles.stat}>
                <span>Réputation</span>
                <strong>{state.reputation}</strong>
              </div>
              <div className={styles.stat}>
                <span>Caps</span>
                <strong>{state.caps}</strong>
              </div>
              <div className={styles.stat}>
                <span>Munitions</span>
                <strong>{state.ammo}</strong>
              </div>
              <div className={styles.stat}>
                <span>AP</span>
                <strong>{state.ap}/{state.maxAp}</strong>
              </div>
              <div className={styles.stat}>
                <span>Stimpaks</span>
                <strong>{state.medkits}</strong>
              </div>
              <div className={styles.stat}>
                <span>Ferraille</span>
                <strong>{state.scrap}</strong>
              </div>
              <div className={styles.stat}>
                <span>Artefacts</span>
                <strong>{state.artifacts}</strong>
              </div>
              <div className={styles.stat}>
                <span>Zone actuelle</span>
                <strong>{zone.name}</strong>
                <div className={styles.zoneType}>{zone.description}</div>
              </div>
            </div>

            <div className={styles.stat}>
              <span>Santé</span>
              <strong>{state.health}%</strong>
              <div className={styles.meter}>
                <div className={styles.meterFill} style={{ width: `${healthPercent}%` }} />
              </div>
            </div>

            <div className={styles.stat}>
              <span>Radiation</span>
              <strong>{state.radiation}%</strong>
              <div className={styles.meter}>
                <div className={styles.meterFill} style={{ width: `${state.radiation}%` }} />
              </div>
            </div>

            <div className={styles.stat}>
              <span>Faim</span>
              <strong>{state.hunger}%</strong>
              <div className={styles.meter}>
                <div className={styles.meterFill} style={{ width: `${state.hunger}%` }} />
              </div>
            </div>

            <div className={styles.stat}>
              <span>Soif</span>
              <strong>{state.thirst}%</strong>
              <div className={styles.meter}>
                <div className={styles.meterFill} style={{ width: `${state.thirst}%` }} />
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Carte tactique</div>
            <div className={styles.map}>
              {mapTiles.map((tile) => {
                const isPlayer = tile.x === state.position.x && tile.y === state.position.y;
                const reachable = reachableSet.has(`${tile.x}-${tile.y}`);
                return (
                  <div
                    key={`${tile.x}-${tile.y}`}
                    className={`${styles.tile} ${isPlayer ? styles.playerTile : ''} ${reachable ? styles.reachableTile : ''}`}
                  >
                    <div className={styles.tileContent}>
                      <div className={styles.zoneIcon}>{zonePalette[tile.zoneInfo.type] || '⬛'}</div>
                      <div className={styles.zoneName}>{tile.zoneInfo.name}</div>
                      {isPlayer && (
                        <div className={styles.avatar} title="Vous">
                          <div className={styles.avatarPortrait}>YOU</div>
                          <div className={styles.avatarAp}>{state.ap}/{state.maxAp}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.panelTitle} style={{ marginTop: '1.5rem' }}>
              Actions
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'MOVE', payload: { x: 0, y: -1 } })}
              >
                Nord
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'MOVE', payload: { x: 0, y: 1 } })}
              >
                Sud
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'MOVE', payload: { x: -1, y: 0 } })}
              >
                Ouest
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'MOVE', payload: { x: 1, y: 0 } })}
              >
                Est
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'SCAVENGE' })}
              >
                Fouiller
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'REST' })}
              >
                Repos
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'USE_MEDKIT' })}
                disabled={state.medkits === 0}
              >
                Stimpak
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => dispatch({ type: 'END_DAY' })}
              >
                Passer la nuit
              </button>
            </div>

            {state.encounter && (
              <div className={styles.encounter}>
                <strong>Combat engagé :</strong> {state.encounter.name} ({state.encounter.currentHealth} PV)
                <div className={styles.encounterActions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => dispatch({ type: 'FIGHT' })}
                    disabled={state.ammo === 0}
                  >
                    Tirer ({state.ammo})
                  </button>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => dispatch({ type: 'FLEE' })}
                  >
                    Fuite tactique
                  </button>
                </div>
              </div>
            )}

            {state.questProgress >= 4 && (
              <div className={styles.encounter}>
                <strong>Objectif atteint :</strong> {state.quest.title}
                <div className={styles.encounterActions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => dispatch({ type: 'ADVANCE_QUEST' })}
                  >
                    Débriefer la mission
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Mission & Inventaire</div>
            <div className={styles.inventory}>
              <div className={styles.inventoryItem}>
                <h4>Mission en cours</h4>
                <p>{state.quest.title}</p>
                <p>Progression: {state.questProgress}/4</p>
                <p>Récompense narrative: {state.quest.reward}</p>
              </div>
              <div className={styles.inventoryItem}>
                <h4>Équipement</h4>
                <p>Carabine G.E.C.K. + Drone d’analyse atmosphérique.</p>
                <p>Armure légère composite (défense moyenne).</p>
              </div>
              <div className={styles.inventoryItem}>
                <h4>Notes du Pip-Boy</h4>
                <p>Les relais sont instables. Les signaux s’éteignent chaque nuit.</p>
                <p>Les habitants de l’Ashen Market veulent une preuve de fiabilité.</p>
              </div>
              <div className={styles.inventoryItem}>
                <h4>Objectifs secondaires</h4>
                <p>Collecter 5 artefacts pré-guerre pour le laboratoire.</p>
                <p>Éviter de dépasser 75% de radiation.</p>
              </div>
            </div>

            <div className={styles.panelTitle} style={{ marginTop: '1.5rem' }}>
              Journal
            </div>
            <div className={styles.log}>
              {state.log.map((entry, index) => (
                <div key={`${entry.text}-${index}`} className={styles.logEntry}>
                  <span>›</span>
                  {entry.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tactical HUD (Fallout Tactics style) */}
        <div className={styles.tacticalHud} role="region" aria-label="Tactical HUD">
          <div className={styles.hudPortrait}>YOU</div>
          <div className={styles.hudStats}>
            <div style={{display:'flex', justifyContent:'space-between', color:'#bfe8bf'}}>
              <div>Nom: Opérateur</div>
              <div>Jour {state.day}</div>
            </div>
            <div className={styles.hudBars}>
              <div style={{width:80, color:'#bfe8bf'}}>PV</div>
              <div className={styles.hudBar}><div className={styles.hudBarFill} style={{width:`${healthPercent}%`}} /></div>
              <div style={{width:60, textAlign:'right', color:'#bfe8bf'}}>{state.health}%</div>
            </div>
            <div className={styles.hudBars}>
              <div style={{width:80, color:'#bfe8bf'}}>AP</div>
              <div className={styles.hudBar}><div className={styles.hudBarFill} style={{width:`${(state.ap/state.maxAp)*100}%`, background:'linear-gradient(90deg,#ffd66b,#ffb26b)'}} /></div>
              <div className={styles.hudAp}>{state.ap}/{state.maxAp}</div>
            </div>
          </div>
          <div className={styles.hudActions}>
            <button className={styles.hudActionBtn} onClick={() => dispatch({type:'END_TURN'})}>End Turn</button>
            <button className={styles.hudActionBtn} onClick={() => dispatch({type:'REST'})}>Rest</button>
            <button className={styles.hudActionBtn} onClick={() => dispatch({type:'SCAVENGE'})}>Scavenge</button>
            <button className={styles.hudActionBtn} onClick={() => dispatch({type:'USE_MEDKIT'})} disabled={state.medkits===0}>Medkit</button>
          </div>
        </div>

        <footer className={styles.footer}>
          Fallout-inspired tactical RPG experience. Ajustez votre stratégie pour survivre au désert.
        </footer>
      </div>
    </Layout>
  );
};

export default FalloutRpg;
