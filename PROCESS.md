# PROCESS: The Shadow Has Its Own Mind

## Initial idea

The idea for this project came from my previous experience working on a light-and-shadow puzzle game prototype. For this assignment, I wanted to continue exploring the relationship between a character and their shadow through a small interactive experience that I could finish and explain.

I chose a 7 × 5 grid. The player moves the character with the arrow keys or WASD and switches the shadow's mapping mode with Space. The shadow cannot move independently; its position is always calculated from the character's position:

- Mode A: `(6-x, y)`, a left–right reflection.
- Mode B: `(x, 4-y)`, a top–bottom reflection.

My aim was to create a game suited to short play sessions, in which players move, observe and switch modes to bring the character and shadow to their respective goals simultaneously.

## From a movement demonstration to a complete puzzle

The first version contained only the grid, character movement and boundary restrictions. The shadow and mode switching were added next. This version responded to input, but the player did not yet have a clear task.

After reviewing the assignment requirements, I realised that being able to move did not, by itself, create a complete game experience. Walls, two goals, completion feedback and a reset function were therefore added in separate stages, forming a clearer loop:

**Observe the goals → try a move or switch → receive feedback → adjust the route → complete the puzzle.**

One important code decision was to check the entire candidate state before applying either a move or a mode switch. An action takes effect only if both the character and shadow positions are legal. If either would hit a wall or leave the board, the original position and mode are preserved, and the feedback identifies which subject was blocked.

This makes a failed action informative, helping the player decide what to try next instead of simply making a key press appear unresponsive.

## Puzzle design and variation

I first developed a fixed puzzle and used breadth-first search (BFS) to check that it was solvable and required the player to switch modes during the route.

I then felt that a fixed puzzle could lose its appeal after being completed once, so I requested variation between puzzles. Initially, only the walls changed randomly. I later noticed that the starting positions and goals were still fixed, so these were randomised as well.

The current generator checks that:

- The character, shadow and two goals occupy four different cells at the start, none of which contains a wall.
- The goal pair follows the shadow mapping rules.
- The puzzle is solvable.
- It cannot be completed without switching modes.
- It cannot be completed by switching only once at the start or only once at the character's destination.

These checks establish that the basic rules are satisfied, but they do not prove that every puzzle is equally enjoyable. Actual playtesting remains important alongside programmatic verification.

## Visual and feedback changes

The early visuals were simple, and the shadow looked more like another dark game piece. I considered introducing four-directional light sources to make the relationship resemble a physical shadow, but ultimately kept the original reflection formulas to avoid changing the core interaction.

The visual direction gradually moved towards halftone textures, silhouettes and a dark fairytale atmosphere. The character gained a hood, a face and small boots. The shadow retained a related silhouette while gaining pointed details, an offset impression and a dark patch beneath it, connecting the two subjects while distinguishing them.

The goals also changed from a simple ring and square into a cottage door and a moon mirror, while retaining labels and a legend. The interface gained mode instructions, collision feedback, a completion animation, and buttons to reset, generate a new puzzle and continue to the next puzzle. I also added English/Chinese switching so players could choose the language they found easier to understand.

These changes focused on recognition and feedback without changing the original mapping rules.

### Desktop layout and final UI refinements

After viewing the game in a maximised desktop browser, I noticed that the large header and width-based board scaling pushed the lower controls off screen. I supplied screenshots and requested a layout that would show the board, instructions and actions together without scrolling in a typical desktop window.

The desktop header was made more compact, and the board size was constrained by both viewport width and height while preserving its 7:5 proportions. The instructions stayed alongside the board. Smaller windows retain scrolling rather than hiding content. This aimed to support a single-screen overview; it does not establish that every screen size or browser zoom level has been tested.

I then requested larger, more visible Reset puzzle and New puzzle buttons with different colours. The first warm-red and teal version looked too strong against the subdued scene. After reviewing another screenshot, I asked for lower-saturation translucent backgrounds, inset borders and side accents similar to the mode bar. Small star ornaments were initially added to the buttons, but I asked to remove them while keeping the other details. The final buttons therefore retain their larger click areas and distinct warm/cool accents without the stars.

These iterations were based on my own screenshot reviews, separate from the other-person playtest feedback below. They changed visual hierarchy and presentation, not the mapping formulas, level generation or collision rules. The latest author-supplied running-page screenshot is included in the README as `docs/screenshot.png`; it shows the illustrated goals, compact desktop layout and final button treatment. The earlier screenshot is retained as a development record.

## Actual playtesting and design decision

I invited other people to try the game. The following points summarise their feedback; they are not verbatim quotations:

1. They described it as an enjoyable small game for passing the time.
2. They felt the difficulty was moderate: it was interesting without requiring excessive mental effort.
3. They suggested that future versions could introduce more rules or a larger map to give the game more room to develop.

This feedback supported the project's direction as a short, casual puzzle experience. Based on it, I decided to retain the current map size and two mapping modes rather than add more complex rules at this stage. The priority is to make one small interaction complete and understandable, rather than expand the project's scope by adding features.

More rules and a larger map remain possible extensions, but they would require renewed checks of solvability, instructions and the effort needed to understand the game. No new rules have been implemented in response to these suggestions so far.

This record contains the players' overall evaluations. It does not invent specific actions, hesitation points or mistakes. The trial date, devices used, and whether the rules were explained before play still need to be added from the actual circumstances.

## Use of AI tools

During development, I used OpenAI Codex to help write and revise HTML, CSS and JavaScript, explain the mapping logic, write BFS verification code, and organise bilingual text and development records. AI provided substantial implementation assistance. I proposed the rules, controlled the scope of each stage, supplied references and feedback, and directed the revisions.

One suggestion I kept was to use BFS to validate puzzles rather than judge whether random layouts were playable by appearance alone.

One suggestion I changed was the restrained design of the goals. As the interface developed, I felt that the goals lacked a sense of story, so I requested that the ring and square be replaced with a cottage door and a moon mirror.

The characters, goals and decorations were drawn with p5.js, SVG and CSS, with Codex assistance. The atmosphere was informed by the reference images I supplied, including the fairytale silhouette style of *Shady Part of Me*. Images, characters and code from that game were not directly used as project assets.

This English process document was translated and saved with Codex assistance from the Chinese draft discussed in the development conversation.

## Verification and future direction

Development included code checks for mapping results, rejected collisions, mode switching, victory detection, reset, puzzle changes and language switching, as well as batch verification of random puzzles. Automated checks and actual playtesting provide different kinds of evidence: the former checks rule correctness, while the latter helps assess whether the experience is enjoyable and appropriately challenging.

For now, I want to retain a small but complete scope. A larger map or additional rules could be explored later, but they should be introduced gradually and assessed through further verification and playtesting to determine whether they actually improve the experience.
