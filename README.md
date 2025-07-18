# EchoSH - The Synesthetic Terminal

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com) 
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**EchoSH is a command-line interface that transforms your digital workflow into an immersive, generative audio experience. Every keystroke, command, and error is transmuted into a unique sonic event, turning the act of coding into a practice of composition.**

---

* [Core Concept](#core-concept)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Philosophy](#philosophy)
* [Getting Started](#getting-started)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)

---

### Core Concept

In a standard terminal, user interaction is a silent, visual affair. EchoSH challenges this paradigm by creating a rich, auditory feedback loop. It's built on the idea that the data flowing through a developer's terminal has an inherent rhythm and texture. By translating this data into sound, we can achieve a deeper, more intuitive connection to our tools and our work.

This is not just a utility; it's an instrument. It's an experiment in synesthesia, exploring the intersection of code, productivity, and generative art.

### Features

* **Real-time Audio Feedback:** Every keystroke generates a unique, pitched sound, providing subtle auditory confirmation of your input.
* **Contextual Command Synthesis:** Commands are analyzed to produce a corresponding soundscape. A successful `npm install` sounds different from a simple `ls`.
* **Generative Sound Engine:** All audio is generated from scratch using the Web Audio API. No external audio files are used.
* **Intuitive Error Sounds:** Errors produce a distinct, dissonant sound for immediate and unambiguous feedback.
* **Persistent Command History:** Recall previous commands with the up and down arrow keys, with history saved across application sessions.
* **Diagnostic Widget:** An optional, minimal overlay displays real-time audio latency statistics for performance tuning.
* **Minimalist UI:** A clean, retro-inspired interface that stays out of your way.

### Tech Stack

* **Framework:** [Electron](https://www.electronjs.org/)
* **UI:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Audio:** [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Philosophy

This project is grounded in a belief that the tools we use should not only be functional but also engaging and inspiring. In the same way an alchemist seeks to transmute base materials, EchoSH seeks to find the hidden harmony within the seemingly mundane flow of data. It encourages a state of heightened awareness, where the developer becomes more attuned to the cause and effect of their digital actions. It is an exercise in discipline and meditation, finding the signal in the noise.

### Getting Started

To get a local copy up and running, follow these simple steps.

**Prerequisites**

* Node.js (v18 or later)
* pnpm (or npm/yarn)

**Installation & Launch**

1.  Clone the repository:
    ```sh
    git clone [https://github.com/stiamprie/echosh.git](https://github.com/stiamprie/echosh.git)
    ```
2.  Navigate to the project directory:
    ```sh
    cd echosh
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

* `help`: Displays a list of available custom commands.
* `clear`: Clears the output history from the terminal view.
* `test:error`: Triggers the custom error sound for testing.
* `toggle:latency`: Shows or hides the audio latency diagnostic widget.

### Roadmap

This project is in its early stages. Future plans include:

* [ ] **Advanced Sound Synthesis:** Incorporating more complex oscillators, filters, and effects.
* [ ] **Audio Theming:** Allowing users to select or create different "sound palettes."
* [ ] **Advanced Command Parsing:** Deeper analysis of commands and their arguments for more nuanced audio generation.
* [ ] **Plugin Architecture:** Enabling users to write their own commands and corresponding sound generators.
* [ ] **Visual Theming:** Customizing the colors and fonts of the terminal UI.

### Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

### License

Distributed under the MIT License. See `LICENSE` for more information.
