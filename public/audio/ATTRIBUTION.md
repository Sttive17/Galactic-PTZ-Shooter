# Audio Asset Attribution

All audio files in `public/audio/` are local royalty-free assets sourced from OpenGameArt.org under **CC0 1.0 Universal (Public Domain Dedication)** (with `tense-combat.mp3` dual-licensed under `CC0` / `CC-BY 3.0`, used here under `CC0`).

| Filename | Title | Author | OpenGameArt Node URL | Direct Download URL | License | Usage Context |
|---|---|---|---|---|---|---|
| `space-ambient.ogg` | Deep Space Array | Tozan | https://opengameart.org/content/deep-space-array | https://opengameart.org/sites/default/files/Spacearray.ogg | CC0 | `GALACTIC_ARENA` biome ambience & fallback drone bed |
| `tense-combat.mp3` | star run | Bobjt | https://opengameart.org/content/star-run | https://opengameart.org/sites/default/files/boss%20battle%20-%20star%20run.mp3 | CC0 (dual CC0 / CC-BY 3.0) | `COMBAT`, `HIGH_TENSION`, and `CRITICAL` combat layers |
| `tension-alarm.ogg` | Short alarm | yd | https://opengameart.org/content/short-alarm | https://opengameart.org/sites/default/files/alarm.ogg | CC0 | Boss encounter tension stinger (`playTensionAlarm`) |
| `menu-main.ogg` | Another space background track | yd | https://opengameart.org/content/another-space-background-track | https://opengameart.org/sites/default/files/ObservingTheStar.ogg | CC0 | `MAIN_MENU` and `LEVEL_MAP` waiting room |
| `menu-settings.mp3` | tEcHNo gEeK | mrpoly | https://opengameart.org/content/techno-geek | https://opengameart.org/sites/default/files/technogeek.mp3 | CC0 | `SETTINGS_MENU` (from Main Menu and Pause/Settings) |
| `biome-lab.ogg` | Factory ambiance | yd | https://opengameart.org/content/factory-ambiance | https://opengameart.org/sites/default/files/Factory.ogg | CC0 | `UNDERGROUND_LAB` biome (Levels 1–10) |
| `biome-earth.ogg` | Birds and Wind - Ambient, Birds, Wind and Synth | Spring Spring | https://opengameart.org/content/birds-and-wind-ambient-birds-wind-and-synth | https://opengameart.org/sites/default/files/Birds%20and%20Wind%20-%20Ambient_0.ogg | CC0 | `EARTH_OPEN_FIELD` biome (Levels 11–20) |
| `biome-launch.ogg` | Robotic City | section31 | https://opengameart.org/content/robotic-city | https://opengameart.org/sites/default/files/S31-Robotic%20City.ogg | CC0 | `ROCKET_LAUNCH_ZONE` biome (Levels 21–30) |
| `biome-orbital.mp3` | Space Graveyard - Ambient Track | TinyWorlds | https://opengameart.org/content/space-graveyard-ambient-track | https://opengameart.org/sites/default/files/space_graveyard.mp3 | CC0 | `ORBITAL_STRATOSPHERE` biome (Levels 31–40) |
| `situation-power-select.mp3` | Magic Space | CodeManu | https://opengameart.org/content/magic-space | https://opengameart.org/sites/default/files/magic%20space.mp3 | CC0 | `POWER_SELECT`, `PORTAL_ACTIVE`, and `WARP_CINEMATIC` situations |
| `situation-victory.mp3` | Victory Theme for RPG | cynicmusic | https://opengameart.org/content/victory-theme-for-rpg | https://opengameart.org/sites/default/files/Victory1.mp3 | CC0 | `ROUND_COMPLETE` and campaign `VICTORY` |
| `situation-gameover.mp3` | Bleak Terminal | Ruskerdax | https://opengameart.org/content/bleak-terminal | https://opengameart.org/sites/default/files/ruskerdax_-_bleak_terminal_theme.mp3 | CC0 | `GAMEOVER` screen & situation |
| `boss-standard.ogg` | Fast fight / battle music (looped) | XCVG (from Ville Nousiainen) | https://opengameart.org/content/fast-fight-battle-music-looped | https://opengameart.org/sites/default/files/fight_looped.ogg | CC0 | Boss encounters Tiers 1–5 |
| `boss-omega.ogg` | Cyber Runner Music | ansimuz | https://opengameart.org/content/cyber-runner-music | https://opengameart.org/sites/default/files/cyber_runner.ogg | CC0 | High-tier & Omega Boss encounters Tiers 6–8 |

## Curated CC0 Procedural & Environmental Audio References

The procedural Web Audio API engine in `src/game/AudioSystem.ts` dynamically synthesizes real-time biome audio beds (filters, sub-drones, LFO breathing, resonance) matching these verified CC0 soundscapes:

- **Underground Lab**: Subterranean industrial server hum, pressurized steam relief, transformer resonance. (Freesound CC0 #522476, OpenGameArt Factory Ambiance).
- **Earth Open Field**: High plains wind gusting, distant thunder echoes, meadow fauna. (OpenGameArt Birds and Wind, Freesound CC0 #416529).
- **Rocket Launch Zone**: Cryogenic liquid oxygen vent hissing, heavy mechanical gantries, low-frequency rumble. (OpenGameArt Robotic City, Freesound CC0 #388062).
- **Orbital Stratosphere**: High altitude rarefied solar wind, satellite telemetry transponder pings, cosmic sine harmonics. (OpenGameArt Space Graveyard, Kenney Sci-Fi Audio CC0).
- **Galactic Arena**: Gravitational wave sub-bass (32.7Hz), dark matter spatial expansion sweep, deep void pulsing. (OpenGameArt Deep Space Array).

