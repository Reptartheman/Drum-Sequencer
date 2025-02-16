![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Built with Tone.js](https://img.shields.io/badge/Built%20with-Tone.js-yellow)

<p text-align="center">
  <img src="path/to/your/logo.png" alt="BeatSketch Logo" width="200"/>
</p>

# BeatSketch - Drums


# BeatSketch - Drums
This is the Drum-Sequencer portion of my future app, BeatSketch.

Overview

This project is a browser-based drum sequencer that allows users to create and play rhythmic patterns in a loop-based sequencer. Users can interact with the sequencer by highlighting steps inside the drum-grid, and the application visually represents the currently playing step in real-time. The sequencer uses Tone.js for audio scheduling and playback. Wired-Elements for the 'Clear Sketch' modal. All other design elements are created by Jeff using Excalidraw and the Figma plugin 'Roughly' which is built on top of RoughJS.

# Current Features

## Transport Bar:

The transport bar provides comprehensive playback control:

- **Tempo Control**: 
  - Slider for continuous adjustment
  - Precision buttons for exact BPM settings
- **Playback Controls**:
  - Play/Pause (spacebar or button). Will play or pause from the current position on the timeline.
  - Stop (resets to beat 1)
- **Edit Modes**:
  - Draw Mode: Pencil cursor for adding notes (press the 'D' key)
  - Erase Mode: Eraser cursor for removing notes (press the 'E' key)
  - Shift-drag for both modes to allows you to add a grouping of notes without having to click each one individually.
- **Clear Sketch**:
  - Safety prompt before clearing
  - MIDI export option for saving work


## Metronome and Timeline:

- **Metronome active**
  - When the metronome is active, the 'Click' button will fill with an orange hand drawn background and will play a soft 'beep boop' sound. The first beat of each measure is accented.

- **Timeline blocks**
  - The timeline blocks represent your beats in a measure. Beats 1.1 through 1.4 are the first four beats of measure 1. The same patterns follows suit for measure 2.
  - Depending on what beat you are on in the sequence, the corresponding beat will have a light-blue hand drawn background. When you pause the sequence, the block will pause on that beat and pick up from that beat in the measure.


## Sequencer Grid
  - **Drum Stack** 
    - The drum stack on the left side has four drums from top to bottom...
      - Hi Hat: press 'H' on your keyboard to play it.
      - Rim: press 'R' on your keyboard to play it.
      - Snare: press 'S' on your keyboard to play it.
      - Kick: press 'Z' on your keyboard to play it.
    
    - Each subdivision (the rectangles within each beat) will be filled with the corresponding color found in the background of it's track name.

# Planned Features

  - Add an event listener to each beat on the timeline, and when the user clicks on that beat, it will play from that part of the pattern.
  - Built in presets for quick sketches.
  - Short video lessons.
  - A button to add more measures.
  - A menu to select a different drum-kit.
  - Allow user to save their patterns.
  - Create user profiles with usernames.
  - Add, chords and bass track to allow users to sketch more robust ideas.
  - Allow the user to record their idea with their MIDI device or QWERTY keyboard.
  - Velocity controls.
  - Enable swing/humanization.


# How to Use

Open the application in a web browser.

Click on timeline steps to toggle them on or off.

Press the play button to start the sequencer.

Watch the visual timeline as it highlights the currently playing step.

Adjust settings (e.g., tempo, patterns) as needed.

## Contributions
  - I am looking for a small team of like-minded developers to make this app come to life. Please get in touch if you are interested in joining me on the BeatSketch journey!



License

This project is licensed under the MIT License. See the LICENSE file for details.
