# echoSH - The Synesthetic Terminal

_Formerly known as Sirocco_

[![Build Status](https://github.com/stiamprie/sirocco/actions/workflows/ci.yml/badge.svg)](https://github.com/stiamprie/sirocco/actions)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/stiamprie/sirocco/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**echoSH transforms your command-line workflow into an immersive, generative audio experience. Every keystroke, command, and process is transmuted into a unique sonic event, turning the act of coding into a practice of composition.**

---

### Visual Demo

_Preliminary terminal in operation._

![echoSH Demo](assets/echosh-demo.gif)

---

- [Core Concept](#core-concept)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Philosophy](#philosophy)
- [Getting Started (for Developers)](#getting-started-for-developers)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

### Core Concept

In a standard terminal, user interaction is a silent, visual affair. echoSH challenges this paradigm by creating a rich, auditory feedback loop. It's built on the idea that the data flowing through a developer's terminal has an inherent rhythm and texture. By translating this data into sound, we can achieve a deeper, more intuitive connection to our tools and our work.

This is not just a utility; it's an instrument. It's an experiment in synesthesia, exploring the intersection of code, productivity, and generative art.

### Features

- **Real-time Audio Feedback:** Every keystroke generates a unique, pitched sound, providing subtle auditory confirmation of your input.
- **Contextual Command Synthesis:** Commands are analyzed to produce a corresponding soundscape. A successful `npm install` sounds different from a simple `ls`.
- **Generative Sound Engine:** All audio is generated from scratch using the Web Audio API. No external audio files are used.
- **Intuitive Error Sounds:** Errors produce a distinct, dissonant sound for immediate and unambiguous feedback.
- **Persistent Command History:** Recall previous commands with the up and down arrow keys, with history saved across application sessions.
- **Diagnostic Widget:** An optional, minimal overlay displays real-time audio latency statistics for performance tuning.
- **Minimalist UI:** A clean, retro-inspired interface that stays out of your way.

### Tech Stack

- **Framework:** [Electron](https://www.electronjs.org/)
- **UI:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Audio:** [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Philosophy

> Echoes in the shell—
> The power of echoSH—
> Code's new symphony.

This project is grounded in a belief that the tools we use should not only be functional but also engaging and inspiring. In the same way an alchemist seeks to transmute base materials, echoSH seeks to find the hidden harmony within the seemingly mundane flow of data. It encourages a state of heightened awareness, where the developer becomes more attuned to the cause and effect of their digital actions. It is an exercise in discipline and meditation, finding the signal in the noise.

### Getting Started (for Developers)

This project is in its early stages. The following instructions are for setting up a local development environment. An end-user installer is planned for the future.

**Prerequisites**

- Node.js (v18 or later)
- pnpm (or npm/yarn)

**Installation & Launch**

1.  Clone the repository (the URL will need updating if you rename the repo):
    ```sh
    git clone https://github.com/stiamprie/sirocco.git
    ```
2.  Navigate to the project directory (you may want to rename the folder):
    ```sh
    cd sirocco
    ```
3.  Install dependencies:
    ```sh
    pnpm install
    ```
4.  Run the application in development mode:
    ```sh
    pnpm dev
    ```

### Usage

The terminal functions like a standard shell, but with a few special commands:

- `help`: Displays a list of available custom commands.
- `clear`: Clears the output history from the terminal view.
- `test:error`: Triggers the custom error sound for testing.
- `toggle:latency`: Shows or hides the audio latency diagnostic widget.

### Roadmap

This project is in its early stages, with many exciting features planned.

- [ ] **Custom Sound Blueprints:** Allow users to define their own sound palettes in simple JSON files. Map custom sounds to specific commands, events (like errors or success), or even command arguments and flags.
- [ ] **Advanced Synthesis Engine:** Move beyond basic oscillators to include filters (LPF, HPF), envelopes (ADSR), and effects (reverb, delay) for richer, more complex soundscapes.
- [ ] **Deeper Command Analysis:** Parse command flags and arguments for more nuanced and context-aware audio feedback. Imagine `git commit` sounding different from `git push`.
- [ ] **Visual Theming:** Full customization of the terminal's color scheme and typography.
- [ ] **Plugin Architecture:** An API for users to extend echoSH with new commands and corresponding sound generators.
- [ ] **User-friendly Installers:** Provide packaged installers for macOS, Windows, and Linux.

### Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

### License

Distributed under the MIT License. See `LICENSE.md` for more information.
