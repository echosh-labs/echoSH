# TODO

A high-level list of tasks and features for the project.

## Core Functionality & Architecture

- [ ] Implement full plugin architecture (`EventBus`, `PluginManager`, `ITransmutationPlugin`).
- [ ] Refactor existing audio logic into an `AudioTransmuterPlugin`.
- [ ] Implement the `StoryGeneratorPlugin` with a basic narrative engine.
- [ ] **Narrative Engine Enhancement:** Evolve the `StoryGeneratorPlugin` beyond simple rule-based fragments.
    - [ ] Explore using a state machine to track longer-term context (e.g., a "debugging" state vs. a "refactoring" state).
    - [ ] Track patterns in command history to generate more cohesive sagas.
    - [ ] Consider integrating a small, local LLM for true narrative transmutation.
- [ ] **Deeper Command Analysis:** Parse command flags and arguments for more nuanced feedback in all plugins (e.g., `git commit` sounds different from `git push`).

## Features
- [ ] **Custom Sound Blueprints:** Allow users to define sound palettes via JSON files.
- [ ] **Advanced Synthesis Engine:** Add filters (LPF, HPF), envelopes (ADSR), and effects (reverb, delay).
- [ ] **Visual Theming:** Allow full customization of the terminal's color scheme and typography.

## Distribution & DX
- [ ] **User-friendly Installers:** Create packaged installers for macOS, Windows, and Linux.