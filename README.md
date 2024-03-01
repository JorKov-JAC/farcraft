# Farcraft
An RTS created as my final project for my Game Development course and has since been developed further. Created from scratch using TypeScript. Approximately 3.5k lines of raw code in 3.5 days.

## Design
The project required an initial design document which can be found [here](DesignDocument.md).

## Features
- A custom save system which is capable of automatically serializing most objects and properly restores object references and prototypes. Everything from unit health to animations and events are saved perfectly.
- A custom UI system which propogates mouse events and properly handles dynamic screen ratios and resolutions.
- A sound system using the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

# Attribution
See [assets/attribution.txt](assets/attribution.txt).

# Building
- Run `npm i` followed by `npx tsc`. Results are output into `/out`.
- Copy `index.html` and the `/assets` directory into `/out`'s parent directory when deploying.
