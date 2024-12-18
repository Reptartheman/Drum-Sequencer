# Drum-Sequencer
This is the Drum-Sequencer portion of my future completed app, BeatSketch.

Overview

This project is a browser-based drum sequencer that allows users to create and play rhythmic patterns in a loop-based timeline. Users can interact with the sequencer by highlighting steps on a timeline, and the application visually represents the currently playing step in real-time. The sequencer uses Tone.js for audio scheduling and playback.

# Features

# Current Features

Step Sequencer:

Users can interact with a grid-based step sequencer to activate or deactivate steps.

Each step corresponds to a beat in the timeline, and multiple steps can be played simultaneously.

Real-Time Visualization:

The timeline visually highlights the current playing step to help users follow the pattern.

Audio Playback:

Uses Tone.js to play predefined drum sounds in sync with the visual timeline.

Loop Playback:

The sequencer plays patterns in a continuous loop, allowing users to create repetitive beats.

# Planned Features

Frontend: Add an event listener to each beat on the transport timeline, and when the user clicks on that beat, it will play from that part of the pattern.

Backend Support:

Add a backend system where users can:

Save their patterns.

Create user profiles with usernames.

Additional Kit Selection:

Allow users to choose from multiple drum kits to diversify their sound options.

Recording:

Implement a feature to record and save played patterns.

Allow users to export recordings in common audio formats like MP3 or WAV.

Advanced Step Manipulation:

Add functionality to control the velocity (volume) and pitch of individual steps.

Enable swing timing adjustments for a groovier playback.

File Structure

app.js: The main JavaScript file containing the sequencer logic.

index.html: The HTML structure for the drum sequencer UI.

styles.css: The styles defining the visual appearance of the sequencer.

assets/: Folder containing audio files for drum sounds.

Setup

Prerequisites

A modern web browser with JavaScript enabled.

Internet connection (for Tone.js if using a CDN).

Instructions

Clone the repository:

git clone https://github.com/username/drum-sequencer.git
cd drum-sequencer

Open index.html in your browser to launch the sequencer.

Customize as needed by editing the provided JavaScript, HTML, and CSS files.

How to Use

Open the application in a web browser.

Click on timeline steps to toggle them on or off.

Press the play button to start the sequencer.

Watch the visual timeline as it highlights the currently playing step.

Adjust settings (e.g., tempo, patterns) as needed.

Contributions

Contributions to this project are welcome! To contribute:

Fork the repository.

Create a new branch for your feature:

git checkout -b feature-name

Commit your changes and push them to your fork.

Open a pull request to the main repository.

License

This project is licensed under the MIT License. See the LICENSE file for details.
