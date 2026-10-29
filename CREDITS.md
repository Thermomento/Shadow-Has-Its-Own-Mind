# Credits, tools and asset provenance

## Project authorship and AI assistance

This is an individual course project that I directed. I received substantial implementation and documentation support from OpenAI Codex: HTML, CSS, JavaScript, procedural drawings, bilingual text, BFS validation logic and all project documentation were drafted and revised throughout my development workflow. 
I defined the game rules, set project constraints, gathered visual references and provided iterative feedback to guide all changes. This credit acknowledges that not every line of code was handwritten entirely by me.

- Tool: [OpenAI Codex](https://openai.com/codex/).
- The running game makes no AI/API calls and does not require an OpenAI account or key.
- No raster image-generation model was used for the game assets.

## Third-party library

**p5.js 1.11.1**, by the p5.js contributors and The Processing Foundation.

- Project/source: [processing/p5.js](https://github.com/processing/p5.js).
- Website: [p5js.org](https://p5js.org/).
- Library license: GNU Lesser General Public License, version 2.1; see the [library's license file](https://github.com/processing/p5.js/blob/v1.11.1/license.txt).
- Exact loaded file: `https://cdn.jsdelivr.net/npm/p5@1.11.1/lib/p5.min.js`.
- The project loads the unmodified library from jsDelivr; it does not include a locally edited p5.js distribution.

The library is distinct from this project's HTML/CSS/game code. No repository-wide license has been selected on the student's behalf.

## Code and tools

- JavaScript, HTML, CSS and browser Web Animations provide the implementation; p5.js draws the board and figures.
- Node.js built-in modules run the committed verification scripts. No npm dependencies are needed for verification. During documentation preparation, the available runtime reported Node.js v24.22.1.
- Python 3's built-in `http.server` provides the optional local-serving workflow. Python 3.11.1 was available during documentation preparation. Python is not needed by the browser game's logic.
- BFS and Fisher–Yates shuffle were implemented as standard algorithms with Codex assistance. No external tutorial or course-example source file was supplied or copied into this project during the recorded work. If any pre-existing material outside this conversation was used by the student, its credit must be added here.

## Game artwork and fonts

- Figures, shadow, walls, cottage-door goal and moon-mirror goal: procedural p5 drawings created within `sketch.js` with Codex assistance.
- Moon, stars, clouds, hills, branches, forest and lantern: inline SVG paths/shapes in `index.html`, created within the project with Codex assistance.
- Halftone dots, paper layers, frames, button decorations and completion silhouettes: CSS/procedural shapes created within the project with Codex assistance.
- Fonts use local/system fallbacks such as Georgia, Times New Roman, Microsoft YaHei, SimSun, serif and sans-serif. No external font files are bundled.
- No external stock photos, character sprites, audio, video or datasets are included in the runtime assets.

## Visual inspiration (not redistributed assets)


- **Shady Part of Me**, developed by **Douze Dixièmes** and published by **Focus Entertainment**, informed the dark-fairytale silhouette, paper-stage, moonlight and shadow mood. [Official game page](https://www.focus-entmt.com/en/games/shady-part-of-me).
- Other supplied references showed black/gold chess layouts, distressed monochrome editorial pages, redacted documents and glitch/halftone treatment. These reference images are not included in this repository or used as game textures.

The game does not include screenshots, characters, music or source code extracted from *Shady Part of Me*. This is not an official adaptation or an affiliated project.


## Documentation and history

README, PROCESS and this credit file were drafted with Codex from the conversation and source files. 
