"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Toggle } from "./ui/toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ZoomIn, ZoomOut, MinusCircle, PlusCircle } from "lucide-react";

// Base cell size in pixels
const BASE_CELL_SIZE = 15;
// Default grid dimensions
const DEFAULT_ROWS = 30;
const DEFAULT_COLS = 50;

// Common patterns
const PATTERNS = {
  Glider: {
    pattern: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
    description: "A glider that moves diagonally",
  },
  Blinker: {
    pattern: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    description: "Oscillates between horizontal and vertical",
  },
  Toad: {
    pattern: [
      [0, 0, 0, 0],
      [0, 1, 1, 1],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    description: "A 2-period oscillator",
  },
  Beacon: {
    pattern: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
    description: "Another 2-period oscillator",
  },
  Pulsar: {
    pattern: [
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    ],
    description: "A 3-period oscillator with high symmetry",
  },
  "Gosper Glider Gun": {
    pattern: [
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
      ],
      [
        1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    ],
    description: "Continuously generates gliders",
  },
};

export default function GameOfLife() {
  // Responsive grid dimensions
  const [dimensions, setDimensions] = useState({
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
  });

  // Game state
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(300); // milliseconds between updates
  const runningRef = useRef(running);
  const speedRef = useRef(speed);

  // Scrolling and viewport
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [viewportOffsets, setViewportOffsets] = useState({ top: 0, left: 0 });

  // Zoom functionality
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE);
  const zoomLevelRef = useRef(zoomLevel);

  // Options
  const [showGrid, setShowGrid] = useState(true);
  const [wrapEdges, setWrapEdges] = useState(true);

  // Resize timeout ref for debouncing
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when state changes
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  // Calculate cell size based on zoom level
  useEffect(() => {
    setCellSize(BASE_CELL_SIZE * zoomLevel);
  }, [zoomLevel]);

  // Zoom in/out handlers
  const zoomIn = useCallback(() => {
    // Save current scroll position and center point before zooming
    const container = containerRef.current;
    if (!container) return;

    // Calculate the center point of the current view
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    const centerX = scrollLeft + viewportWidth / 2;
    const centerY = scrollTop + viewportHeight / 2;

    // Capture current zoom level for calculation
    const currentZoom = zoomLevelRef.current;
    const newZoom = Math.min(currentZoom + 0.25, 3);

    // Increase zoom level
    setZoomLevel(newZoom);

    // After state update, adjust scroll position to maintain center point
    setTimeout(() => {
      if (container) {
        const scaleFactor = newZoom / currentZoom;
        const newCenterX = centerX * scaleFactor;
        const newCenterY = centerY * scaleFactor;

        container.scrollLeft = newCenterX - container.clientWidth / 2;
        container.scrollTop = newCenterY - container.clientHeight / 2;
      }
    }, 10);
  }, []);

  const zoomOut = useCallback(() => {
    // Save current scroll position and center point before zooming
    const container = containerRef.current;
    if (!container) return;

    // Calculate the center point of the current view
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    const centerX = scrollLeft + viewportWidth / 2;
    const centerY = scrollTop + viewportHeight / 2;

    // Capture current zoom level for calculation
    const currentZoom = zoomLevelRef.current;
    const newZoom = Math.max(currentZoom - 0.25, 0.5);

    // Decrease zoom level
    setZoomLevel(newZoom);

    // After state update, adjust scroll position to maintain center point
    setTimeout(() => {
      if (container) {
        const scaleFactor = newZoom / currentZoom;
        const newCenterX = centerX * scaleFactor;
        const newCenterY = centerY * scaleFactor;

        container.scrollLeft = newCenterX - container.clientWidth / 2;
        container.scrollTop = newCenterY - container.clientHeight / 2;
      }
    }, 10);
  }, []);

  // Reset zoom to default
  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Initialize empty grid
  const resetGrid = useCallback(() => {
    const newGrid = Array(dimensions.rows)
      .fill(null)
      .map(() => Array(dimensions.cols).fill(false));
    setGrid(newGrid);
    setGeneration(0);
  }, [dimensions]);

  // Initialize random grid
  const randomGrid = useCallback(() => {
    const newGrid = Array(dimensions.rows)
      .fill(null)
      .map(() =>
        Array(dimensions.cols)
          .fill(null)
          .map(() => Math.random() > 0.7)
      );
    setGrid(newGrid);
    setGeneration(0);
  }, [dimensions]);

  // Place pattern at position
  const placePattern = useCallback(
    (pattern: boolean[][], rowStart: number, colStart: number) => {
      setGrid((g) => {
        const newGrid = g.map((row) => [...row]);

        // Place the pattern centered on the specified position
        pattern.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const targetRow = rowStart + rowIndex;
            const targetCol = colStart + colIndex;

            // Only place cells that are within the grid
            if (
              targetRow >= 0 &&
              targetRow < dimensions.rows &&
              targetCol >= 0 &&
              targetCol < dimensions.cols
            ) {
              newGrid[targetRow][targetCol] = Boolean(cell);
            }
          });
        });

        return newGrid;
      });

      // If auto-scroll is enabled, center the grid on the new pattern
      if (autoScroll && containerRef.current) {
        const centerRow = rowStart + Math.floor(pattern.length / 2);
        const centerCol = colStart + Math.floor(pattern[0].length / 2);

        // Calculate center position in pixels
        const centerX = centerCol * cellSize;
        const centerY = centerRow * cellSize;

        // Calculate scroll position to center the pattern
        const gridWidth = containerRef.current.clientWidth;
        const gridHeight = containerRef.current.clientHeight;

        // Scroll to center on the pattern
        containerRef.current.scrollLeft = centerX - gridWidth / 2;
        containerRef.current.scrollTop = centerY - gridHeight / 2;
      }
    },
    [dimensions, autoScroll, cellSize]
  );

  // Create pattern from template
  const createPattern = useCallback(
    (patternName: string) => {
      const pattern = PATTERNS[patternName as keyof typeof PATTERNS];
      if (!pattern) return;

      // Convert the pattern from 0/1 to boolean
      const boolPattern = pattern.pattern.map((row) =>
        row.map((cell) => Boolean(cell))
      );

      // Place in center of the visible grid
      const rowStart =
        Math.floor(dimensions.rows / 2) - Math.floor(boolPattern.length / 2);
      const colStart =
        Math.floor(dimensions.cols / 2) - Math.floor(boolPattern[0].length / 2);

      placePattern(boolPattern, rowStart, colStart);
      setGeneration(0);
    },
    [dimensions, placePattern]
  );

  // Find active region (area with live cells)
  const findActiveRegion = useCallback(() => {
    let minRow = dimensions.rows;
    let maxRow = 0;
    let minCol = dimensions.cols;
    let maxCol = 0;
    let hasLiveCells = false;

    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          hasLiveCells = true;
          minRow = Math.min(minRow, rowIndex);
          maxRow = Math.max(maxRow, rowIndex);
          minCol = Math.min(minCol, colIndex);
          maxCol = Math.max(maxCol, colIndex);
        }
      });
    });

    if (!hasLiveCells) {
      return null;
    }

    return {
      minRow,
      maxRow,
      minCol,
      maxCol,
      centerRow: Math.floor((minRow + maxRow) / 2),
      centerCol: Math.floor((minCol + maxCol) / 2),
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1,
    };
  }, [grid, dimensions]);

  // Auto-scroll to keep active cells in view
  const autoScrollGrid = useCallback(() => {
    if (!autoScroll || !gridRef.current || !containerRef.current) return;

    const activeRegion = findActiveRegion();
    if (!activeRegion) return;

    // Calculate center position in pixels
    const centerX = activeRegion.centerCol * cellSize;
    const centerY = activeRegion.centerRow * cellSize;

    // Calculate scroll position to center active region
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Smooth scroll to center the active region
    containerRef.current.scrollTo({
      left: centerX - containerWidth / 2,
      top: centerY - containerHeight / 2,
      behavior: "smooth",
    });
  }, [autoScroll, findActiveRegion, cellSize]);

  // Run game of life simulation
  const runOneGeneration = useCallback(
    (g: boolean[][]) => {
      return g.map((row, i) =>
        row.map((cell, j) => {
          // Count live neighbors
          let neighbors = 0;
          const directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
          ];

          for (const [dx, dy] of directions) {
            let newI = i + dx;
            let newJ = j + dy;

            // Handle edge wrapping if enabled
            if (wrapEdges) {
              newI = (newI + dimensions.rows) % dimensions.rows;
              newJ = (newJ + dimensions.cols) % dimensions.cols;
            }

            // Count live neighbor if in bounds
            if (
              newI >= 0 &&
              newI < dimensions.rows &&
              newJ >= 0 &&
              newJ < dimensions.cols &&
              g[newI][newJ]
            ) {
              neighbors++;
            }
          }

          // Apply Conway's Game of Life rules
          if (cell) {
            // Live cell survives if it has 2 or 3 live neighbors
            return neighbors === 2 || neighbors === 3;
          } else {
            // Dead cell becomes alive if it has exactly 3 live neighbors
            return neighbors === 3;
          }
        })
      );
    },
    [dimensions, wrapEdges]
  );

  // Update grid based on Conway's Game of Life rules
  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid((g) => {
      const newGrid = runOneGeneration(g);
      return newGrid;
    });

    setGeneration((g) => g + 1);

    // Auto-scroll to active cells if enabled (with slight delay to ensure render is complete)
    setTimeout(autoScrollGrid, 10);

    // Schedule next update based on speed
    const timeoutId = setTimeout(runSimulation, speedRef.current);
    return () => clearTimeout(timeoutId);
  }, [runOneGeneration, autoScrollGrid]);

  // Step forward one generation
  const stepForward = useCallback(() => {
    if (running) {
      setRunning(false);
      setTimeout(() => {
        setGrid(runOneGeneration);
        setGeneration((g) => g + 1);
      }, 10);
    } else {
      setGrid(runOneGeneration);
      setGeneration((g) => g + 1);
    }
  }, [running, runOneGeneration]);

  // Handle window resize to make the grid responsive
  useEffect(() => {
    const handleResize = () => {
      // Clear any existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Debounce the resize to avoid too many calculations
      resizeTimeoutRef.current = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Get current zoom level from ref for calculations
        const currentZoomLevel = zoomLevelRef.current;
        const currentCellSize = BASE_CELL_SIZE * currentZoomLevel;

        // Calculate number of rows and columns based on window size
        const maxCols = Math.floor((width * 0.9) / currentCellSize);
        const maxRows = Math.floor(((height - 200) * 0.9) / currentCellSize);

        // Use responsive dimensions but with minimum values
        setDimensions({
          rows: Math.max(10, maxRows),
          cols: Math.max(20, maxCols),
        });
      }, 250); // 250ms debounce
    };

    // Set initial dimensions and listen for resize events
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array - this effect should only run once

  // Initialize grid on mount and when dimensions change
  useEffect(() => {
    resetGrid();
  }, [dimensions, resetGrid]);

  // Start/stop simulation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (running) {
      timeoutId = setTimeout(runSimulation, speedRef.current);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [running, runSimulation]);

  // Toggle cell state when clicked
  const toggleCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (running) return; // Disable editing while simulation is running

      setGrid((grid) => {
        const newGrid = [...grid];
        newGrid[rowIndex] = [...newGrid[rowIndex]];
        newGrid[rowIndex][colIndex] = !newGrid[rowIndex][colIndex];
        return newGrid;
      });
    },
    [running]
  );

  // Handle wheel events for zooming
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      // Check if Control key is pressed for zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        if (e.deltaY < 0) {
          // Zoom in
          zoomIn();
        } else {
          // Zoom out
          zoomOut();
        }
      }
    },
    [zoomIn, zoomOut]
  );

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Conway's Game of Life</CardTitle>
        <CardDescription className="text-center">
          A cellular automaton devised by mathematician John Conway
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        {/* Zoom controls */}
        <div className="flex items-center gap-2 self-end mb-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={zoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="text-xs font-medium">
            {Math.round(zoomLevel * 100)}%
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={zoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="text-xs h-7 px-2"
          >
            Reset
          </Button>
        </div>

        {/* Game grid */}
        <div
          ref={containerRef}
          className="w-full overflow-auto border rounded-md border-gray-300 dark:border-gray-700"
          style={{ maxHeight: "60vh" }}
          onWheel={handleWheel}
        >
          <div
            ref={gridRef}
            className="border-gray-300 dark:border-gray-700 rounded-md"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dimensions.cols}, ${cellSize}px)`,
              width: `${dimensions.cols * cellSize}px`,
              height: `${dimensions.rows * cellSize}px`,
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => toggleCell(rowIndex, colIndex)}
                  className={`
                    ${cell ? "bg-primary" : "bg-background"} 
                    ${
                      showGrid
                        ? "border border-gray-200 dark:border-gray-800"
                        : ""
                    }
                    transition-colors duration-100
                  `}
                  style={{
                    width: cellSize,
                    height: cellSize,
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Game stats */}
        <div className="text-sm mb-2 flex items-center gap-4">
          <span>Generation: {generation}</span>
          <span>
            Grid: {dimensions.rows}x{dimensions.cols}
          </span>
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-0">
        {/* Game controls */}
        <div className="flex flex-wrap gap-2 justify-center w-full">
          <Button
            variant={running ? "destructive" : "default"}
            onClick={() => setRunning(!running)}
          >
            {running ? "Stop" : "Start"}
          </Button>

          <Button variant="outline" onClick={resetGrid}>
            Clear
          </Button>

          <Button variant="outline" onClick={randomGrid}>
            Random
          </Button>

          <Button variant="outline" onClick={stepForward}>
            Step
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Patterns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Common Patterns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(PATTERNS).map(([name, { description }]) => (
                <DropdownMenuItem
                  key={name}
                  onClick={() => createPattern(name)}
                >
                  <div>
                    <div>{name}</div>
                    <div className="text-xs text-muted-foreground">
                      {description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-4 justify-center w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <Slider
              className="w-36"
              min={50}
              max={1000}
              step={50}
              value={[speed]}
              onValueChange={(values) => setSpeed(values[0])}
            />
            <span className="text-xs">{speed}ms</span>
          </div>

          <Toggle
            pressed={showGrid}
            onPressedChange={setShowGrid}
            aria-label="Toggle grid lines"
            variant="outline"
          >
            Show Grid
          </Toggle>

          <Toggle
            pressed={wrapEdges}
            onPressedChange={setWrapEdges}
            aria-label="Toggle edge wrapping"
            variant="outline"
          >
            Wrap Edges
          </Toggle>

          <Toggle
            pressed={autoScroll}
            onPressedChange={setAutoScroll}
            aria-label="Toggle auto-scroll"
            variant="outline"
          >
            Auto-Scroll
          </Toggle>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl text-center">
          <p className="mb-1">
            <strong>How to Play:</strong>
          </p>
          <ul className="list-disc list-inside">
            <li>
              Click on cells to toggle them alive/dead when simulation is
              stopped
            </li>
            <li>Press "Start" to begin the simulation, "Stop" to pause it</li>
            <li>"Step" advances one generation at a time</li>
            <li>"Random" creates a random pattern, "Clear" resets the grid</li>
            <li>
              "Patterns" menu lets you select common Game of Life patterns
            </li>
            <li>
              Use Ctrl+Scroll or the zoom buttons to zoom in/out of the grid
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}
