You are a senior frontend engineer.

Build a modern AI dashboard for PPT generation using:

- Next.js (App Router)
- Tailwind CSS
- ShadCN UI
- Framer Motion

Design should match:
- user's system theme mode
- Centered input box
- Minimal UI (like ChatGPT / Genspark)
- Smooth animations

Build a PPT Generator Dashboard.

Core features:

1. Input Box (centered)
   - Placeholder: "Describe your presentation..."
   - Accepts long prompts

2. Generate Button

3. Scrollable Output Section
   - Appears after submission
   - Shows:
     - Loading animation
     - Then generated slides preview
     - Each slide as a card

4. API Integration
   - Call backend endpoint: /api/generate
   - Backend will call Gamma API

5. UI Layout

Top:
- Title: "Sidekick PPT"

Middle:
- Input box
- Generate button

Bottom:
- Scrollable results container

Style guidelines:

- Background: based on user's theme mode
- Cards: rounded-xl, soft shadows
- Input: glassmorphism style
- Buttons: glowing hover effect
- Smooth scroll for output

Animations:
- Fade-in slides
- Skeleton loader before response

You MUST strictly follow the font system defined below.

DO NOT:
- Substitute fonts
- Suggest alternatives
- Auto-replace unavailable fonts
- Use system defaults like Arial, Inter, Roboto, etc.

If a font is unavailable:
- Explicitly state it
- Still write code using the correct font family

Font consistency is critical.
primary font: 
Font Family: "Helvetica Neue"
Font Weight: 500 (Medium)
Usage: Entire frontend UI

- ALL UI text must use Helvetica Neue 
- Includes:
  - Headings
  - Input fields
  - Buttons
  - Labels
  - Navigation
  - Cards

- Do NOT mix weights unless explicitly specified
- Default weight = 500

When generating:

1. Frontend Code:
   - MUST use "Helvetica Neue"
   - MUST set font-weight: 500

2. PPT Content / JSON:
   - MUST specify font as "Calibri"

3. NEVER output:
   - Inter
   - Arial
   - Roboto
   - System UI
   - Any fallback suggestions in logic

4. If a library forces a font:
   - Override it explicitly