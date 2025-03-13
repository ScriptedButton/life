# Conway's Game of Life

A responsive and interactive implementation of Conway's Game of Life built with Next.js and ShadCN UI components.

![Conway's Game of Life](https://upload.wikimedia.org/wikipedia/commons/e/e5/Gospers_glider_gun.gif)

## About

Conway's Game of Life is a cellular automaton devised by mathematician John Conway in 1970. It's a zero-player game, meaning its evolution is determined by its initial state, requiring no further input.

This implementation includes a modern, responsive UI with various features to explore and interact with the simulation.

## Features

- **Interactive Grid**: Click cells to toggle them alive/dead when the simulation is paused
- **Responsive Design**: Automatically adjusts grid size based on screen dimensions
- **Simulation Controls**:
  - Start/stop the simulation
  - Step through one generation at a time
  - Adjust simulation speed
  - Clear the grid or generate random patterns
- **Zoom Functionality**: Zoom in/out of the grid without affecting page zoom
  - Use Ctrl+Scroll (or Cmd+Scroll on Mac)
  - Click the zoom buttons
  - Scale from 50% to 300%
- **Auto-Scrolling**: Keeps active patterns centered during simulation
- **Common Patterns**: Library of classic Game of Life patterns to explore:
  - Glider
  - Blinker
  - Toad
  - Beacon
  - Pulsar
  - Gosper Glider Gun
- **Grid Customization**:
  - Toggle grid lines
  - Toggle edge wrapping (cells wrap around the edges of the grid)

## Technologies Used

- **Next.js**: React framework for the frontend
- **TypeScript**: For type-safe code
- **ShadCN UI**: Component library for the UI
- **Tailwind CSS**: For styling
- **React Hooks**: For state management

## Getting Started

### Prerequisites

- Node.js (>= 18.x)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ScriptedButton/life
   cd life
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Play

1. **Starting with a Pattern**:

   - Click the "Patterns" button to select a pre-defined pattern
   - Or click cells to create your own pattern
   - Or click "Random" to generate a random pattern

2. **Running the Simulation**:

   - Click "Start" to begin the simulation
   - Use the speed slider to adjust the simulation speed
   - Click "Stop" to pause

3. **Controls**:

   - "Step" advances one generation at a time
   - "Clear" resets the grid
   - "Random" creates a random pattern

4. **Viewing Options**:

   - Toggle "Show Grid" to show/hide grid lines
   - Toggle "Wrap Edges" to enable/disable edge wrapping
   - Toggle "Auto-Scroll" to follow active patterns

5. **Zooming**:
   - Use the zoom controls or Ctrl+Scroll to zoom in/out
   - The grid zooms independently of the page

## Conway's Game of Life Rules

The universe of the Game of Life is an infinite, two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, live or dead. Every cell interacts with its eight neighbors. At each step in time, the following transitions occur:

1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
2. Any live cell with two or three live neighbors lives on to the next generation.
3. Any live cell with more than three live neighbors dies, as if by overpopulation.
4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- John Conway for creating the Game of Life
- The ShadCN UI team for the wonderful component library
- The Next.js team for the incredible React framework
