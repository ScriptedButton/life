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
import { ZoomIn, ZoomOut } from "lucide-react";
import { PatternAssistant } from "./pattern-assistant";

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

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<boolean | null>(null);

  // Scrolling and viewport
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Zoom functionality
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE);
  const zoomLevelRef = useRef(zoomLevel);

  // Options
  const [showGrid, setShowGrid] = useState(true);
  const [wrapEdges, setWrapEdges] = useState(true);
  const [trailEffect, setTrailEffect] = useState(true);
  const [smoothScroll, setSmoothScroll] = useState(true);

  // Animation frame ID for smooth scrolling
  const scrollAnimationRef = useRef<number | undefined>(undefined);
  const lastScrollTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Draw the grid on canvas
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check if grid is initialized properly
    if (!grid || grid.length === 0) return;

    // Get the device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;

    // Get the display size of the canvas
    const displayWidth = dimensions.cols * cellSize;
    const displayHeight = dimensions.rows * cellSize;

    // Set the canvas size with pixel ratio adjustment
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Set the CSS size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Scale the context
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw background
    ctx.fillStyle =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim() || "#ffffff";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw grid lines if grid is enabled
    if (showGrid) {
      // Adjust line width based on zoom level for better visibility
      const lineWidth = zoomLevel < 0.75 ? 0.5 : 1;
      ctx.strokeStyle =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--border")
          .trim() || "#e5e7eb";
      ctx.lineWidth = lineWidth;

      // Only draw grid lines if cell size is large enough to show them clearly
      // This prevents the grid from becoming a solid blob at very low zoom levels
      if (cellSize >= 3) {
        // Draw vertical lines
        for (let i = 0; i <= dimensions.cols; i++) {
          const x = i * cellSize;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, displayHeight);
          ctx.stroke();
        }

        // Draw horizontal lines
        for (let i = 0; i <= dimensions.rows; i++) {
          const y = i * cellSize;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(displayWidth, y);
          ctx.stroke();
        }
      }
    }

    // Draw cells
    const primaryColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() || "#3b82f6";
    ctx.fillStyle = primaryColor;

    // Calculate cell size adjustments based on zoom level
    let cellOffset = 0;
    let cellWidth = cellSize;
    let cellHeight = cellSize;

    if (trailEffect && cellSize > 5) {
      // Only apply trail effect if cells are large enough
      cellOffset = cellSize * 0.05;
      cellWidth = cellSize * 0.95;
      cellHeight = cellSize * 0.95;
    } else if (showGrid && cellSize > 3) {
      // Adjust for grid lines only if we're showing grid and cells are big enough
      cellWidth = cellSize - 1;
      cellHeight = cellSize - 1;
    }

    // Batch drawing of cells for performance
    for (let rowIndex = 0; rowIndex < dimensions.rows; rowIndex++) {
      // Safety check for row existence
      if (!grid[rowIndex]) continue;

      for (let colIndex = 0; colIndex < dimensions.cols; colIndex++) {
        // Safety check for cell existence
        if (grid[rowIndex][colIndex]) {
          const x = colIndex * cellSize + cellOffset;
          const y = rowIndex * cellSize + cellOffset;

          // If cells are very small, ensure they're at least 1 pixel
          const finalWidth = Math.max(cellWidth, 1);
          const finalHeight = Math.max(cellHeight, 1);

          ctx.fillRect(x, y, finalWidth, finalHeight);
        }
      }
    }
  }, [
    grid,
    dimensions.rows,
    dimensions.cols,
    cellSize,
    showGrid,
    trailEffect,
    zoomLevel,
  ]);

  // Update the canvas when relevant states change - avoid using drawGrid in dependencies
  useEffect(() => {
    // Use requestAnimationFrame to prevent render loop issues
    const animationId = requestAnimationFrame(() => {
      drawGrid();
    });
    return () => cancelAnimationFrame(animationId);
  }, [
    grid,
    dimensions.rows,
    dimensions.cols,
    cellSize,
    showGrid,
    trailEffect,
    zoomLevel,
    drawGrid,
  ]);

  // Initialize grid on mount and when dimensions change
  useEffect(() => {
    // Create a temporary grid for initialization
    const newGrid = Array(dimensions.rows)
      .fill(null)
      .map(() => Array(dimensions.cols).fill(false));

    // Set the grid immediately
    setGrid(newGrid);
    setGeneration(0);

    // Force a redraw after grid initialization - don't use drawGrid directly in deps
    const timeout = setTimeout(() => {
      if (canvasRef.current) {
        // Use requestAnimationFrame to prevent render loop issues
        requestAnimationFrame(() => {
          // Call drawGrid directly to ensure the grid is visible on initial load
          drawGrid();
        });
      }
    }, 50); // Longer delay to ensure state updates are complete

    return () => clearTimeout(timeout);
  }, [dimensions, cellSize]);

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
    // Adjust minimum zoom level to 0.6 for better visibility
    const newZoom = Math.max(currentZoom - 0.25, 0.6);

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

  // Enhanced auto-scroll with smooth animation
  const smoothScrollTo = useCallback(
    (targetX: number, targetY: number) => {
      if (!containerRef.current || !smoothScroll) {
        if (containerRef.current) {
          containerRef.current.scrollLeft = targetX;
          containerRef.current.scrollTop = targetY;
        }
        return;
      }

      const container = containerRef.current;
      const startX = container.scrollLeft;
      const startY = container.scrollTop;
      const distanceX = targetX - startX;
      const distanceY = targetY - startY;
      const startTime = performance.now();
      const duration = 500; // Animation duration in ms

      // Cancel any existing animation
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }

      // Save target for potential interruption
      lastScrollTargetRef.current = { x: targetX, y: targetY };

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic function
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
        const easeProgress = easeOut(progress);

        container.scrollLeft = startX + distanceX * easeProgress;
        container.scrollTop = startY + distanceY * easeProgress;

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animate);
        }
      };

      scrollAnimationRef.current = requestAnimationFrame(animate);
    },
    [smoothScroll]
  );

  // Update auto-scroll to use smooth scrolling
  const autoScrollGrid = useCallback(() => {
    if (!autoScroll || !gridRef.current || !containerRef.current) return;

    const activeRegion = findActiveRegion();
    if (!activeRegion) return;

    const centerX = activeRegion.centerCol * cellSize;
    const centerY = activeRegion.centerRow * cellSize;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    smoothScrollTo(centerX - containerWidth / 2, centerY - containerHeight / 2);
  }, [autoScroll, findActiveRegion, cellSize, smoothScrollTo]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, []);

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
        setGrid((g) => runOneGeneration(g));
        setGeneration((g) => g + 1);
      }, 10);
    } else {
      setGrid((g) => runOneGeneration(g));
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
    (rowIndex: number, colIndex: number, forceValue?: boolean) => {
      if (running) return; // Disable editing while simulation is running

      setGrid((grid) => {
        const newGrid = [...grid];
        newGrid[rowIndex] = [...newGrid[rowIndex]];
        newGrid[rowIndex][colIndex] =
          forceValue !== undefined ? forceValue : !newGrid[rowIndex][colIndex];
        return newGrid;
      });
    },
    [running]
  );

  // Handle mouse interactions with canvas
  const getCellCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const colIndex = Math.floor(x / cellSize);
      const rowIndex = Math.floor(y / cellSize);

      // Ensure coordinates are within bounds
      if (
        rowIndex >= 0 &&
        rowIndex < dimensions.rows &&
        colIndex >= 0 &&
        colIndex < dimensions.cols
      ) {
        return { rowIndex, colIndex };
      }

      return null;
    },
    [cellSize, dimensions.rows, dimensions.cols]
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (running) return;

      const coords = getCellCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      const { rowIndex, colIndex } = coords;
      setIsDragging(true);
      const newValue = !grid[rowIndex][colIndex];
      setDragValue(newValue);
      toggleCell(rowIndex, colIndex);
    },
    [running, grid, getCellCoordinates, toggleCell]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging || dragValue === null || running) return;

      const coords = getCellCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      const { rowIndex, colIndex } = coords;
      toggleCell(rowIndex, colIndex, dragValue);
    },
    [isDragging, dragValue, running, getCellCoordinates, toggleCell]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragValue(null);
  }, []);

  // Add mouseup event listener to handle dragging outside the grid
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

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
        <CardTitle className="text-center">
          Conway&apos;s Game of Life
        </CardTitle>
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
            disabled={zoomLevel <= 0.6}
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

        {/* Pattern Assistant */}
        <PatternAssistant
          onPatternSelect={({ pattern }) => {
            // Place the pattern in the center of the visible grid
            const rowStart =
              Math.floor(dimensions.rows / 2) - Math.floor(pattern.length / 2);
            const colStart =
              Math.floor(dimensions.cols / 2) -
              Math.floor(pattern[0].length / 2);

            placePattern(pattern, rowStart, colStart);
            setGeneration(0);
          }}
        />

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
              width: `${dimensions.cols * cellSize}px`,
              height: `${dimensions.rows * cellSize}px`,
              position: "relative",
            }}
          >
            <canvas
              ref={canvasRef}
              width={dimensions.cols * cellSize}
              height={dimensions.rows * cellSize}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-pointer"
            />
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

          <Toggle
            pressed={trailEffect}
            onPressedChange={setTrailEffect}
            aria-label="Toggle trail effect"
            variant="outline"
          >
            Trail Effect
          </Toggle>

          <Toggle
            pressed={smoothScroll}
            onPressedChange={setSmoothScroll}
            aria-label="Toggle smooth scroll"
            variant="outline"
          >
            Smooth Scroll
          </Toggle>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl text-center">
          <p className="mb-1">
            <strong>How to Play:</strong>
          </p>
          <ul className="list-disc list-inside">
            <li>Click and drag to draw patterns when simulation is stopped</li>
            <li>
              Press &quot;Start&quot; to begin the simulation, &quot;Stop&quot;
              to pause it
            </li>
            <li>&quot;Step&quot; advances one generation at a time</li>
            <li>
              &quot;Random&quot; creates a random pattern, &quot;Clear&quot;
              resets the grid
            </li>
            <li>
              &quot;Patterns&quot; menu lets you select common Game of Life
              patterns
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
