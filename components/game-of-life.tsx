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
import { PATTERNS } from "@/patterns";

// Base cell size in pixels
const BASE_CELL_SIZE = 15;

// Sparse grid representation for infinite grid
type CellKey = string;
type SparseGrid = Set<CellKey>;

// Viewport type definition with computed properties
type Viewport = {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  readonly rows: number;
  readonly cols: number;
};

// Helper to convert row,col to a unique string key
const getCellKey = (row: number, col: number): CellKey => `${row},${col}`;
// Helper to parse cell key back to coordinates
const parseCellKey = (key: CellKey): { row: number; col: number } => {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
};

export default function GameOfLife() {
  // Viewport dimensions (visible area)
  const [viewport, setViewport] = useState<Viewport>({
    minRow: -20, // Make vertical range larger for a more square aspect ratio
    maxRow: 20,
    minCol: -20,
    maxCol: 20,
    // Computed properties
    get rows() {
      return this.maxRow - this.minRow + 1;
    },
    get cols() {
      return this.maxCol - this.minCol + 1;
    },
  });

  // Game state - use sparse representation for infinite grid
  const [sparseGrid, setSparseGrid] = useState<SparseGrid>(new Set());
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(300); // milliseconds between updates
  const runningRef = useRef(running);
  const speedRef = useRef(speed);
  // Add a ref to track generation without causing rerender
  const generationRef = useRef(generation);

  // For compatibility, maintain a converted 2D array view of the visible grid
  const [renderedGrid, setRenderedGrid] = useState<boolean[][]>([]);

  // Grid state history for stabilization detection
  const [stabilized, setStabilized] = useState(false);
  const gridHistoryRef = useRef<string[]>([]);
  const historyLengthRef = useRef(10); // Store last N states to detect oscillators
  const [stabilizationInfo, setStabilizationInfo] = useState<{
    period: number;
    generation: number;
  } | null>(null);
  const currentPatternRef = useRef<string | null>(null);
  const [progressInfo, setProgressInfo] = useState<string | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<boolean | null>(null);

  // Add interaction mode and panning state
  const [interactionMode, setInteractionMode] = useState<"draw" | "pan">(
    "draw"
  );
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );

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
  const [smoothScroll, setSmoothScroll] = useState(true);

  // Animation frame ID for smooth scrolling
  const scrollAnimationRef = useRef<number | undefined>(undefined);
  const lastScrollTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resize timeout ref for debouncing
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the speed change handler to prevent recreation on every render
  const handleSpeedChange = useCallback((values: number[]) => {
    setSpeed(values[0]);
  }, []);

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

  // Add an effect to sync generation state with ref
  useEffect(() => {
    generationRef.current = generation;
  }, [generation]);

  // Calculate cell size based on zoom level
  useEffect(() => {
    setCellSize(BASE_CELL_SIZE * zoomLevel);
  }, [zoomLevel]);

  // Update the rendered 2D grid from the sparse representation
  const updateRenderedGrid = useCallback(() => {
    const newGrid: boolean[][] = Array(viewport.rows)
      .fill(null)
      .map(() => Array(viewport.cols).fill(false));

    // Convert sparse grid to 2D grid for rendering
    sparseGrid.forEach((key) => {
      const { row, col } = parseCellKey(key);
      // Only include cells within the viewport
      if (
        row >= viewport.minRow &&
        row <= viewport.maxRow &&
        col >= viewport.minCol &&
        col <= viewport.maxCol
      ) {
        const viewportRow = row - viewport.minRow;
        const viewportCol = col - viewport.minCol;
        newGrid[viewportRow][viewportCol] = true;
      }
    });

    setRenderedGrid(newGrid);
  }, [sparseGrid, viewport]);

  // Update rendered grid when sparse grid or viewport changes
  useEffect(() => {
    updateRenderedGrid();
  }, [sparseGrid, viewport, updateRenderedGrid]);

  // Draw the grid on canvas
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check if grid is initialized properly
    if (!renderedGrid || renderedGrid.length === 0) return;

    // Get the device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;

    // Get the display size of the canvas
    const displayWidth = viewport.cols * cellSize;
    const displayHeight = viewport.rows * cellSize;

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
      if (cellSize >= 3) {
        // Draw vertical lines
        for (let i = 0; i <= viewport.cols; i++) {
          const x = i * cellSize;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, displayHeight);
          ctx.stroke();
        }

        // Draw horizontal lines
        for (let i = 0; i <= viewport.rows; i++) {
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

    if (cellSize > 5) {
      // Only apply trail effect if cells are large enough
      cellOffset = cellSize * 0.05;
      cellWidth = cellSize * 0.95;
      cellHeight = cellSize * 0.95;
    } else if (showGrid && cellSize > 3) {
      // Adjust for grid lines only if we're showing grid and cells are big enough
      cellWidth = cellSize - 1;
      cellHeight = cellSize - 1;
    }

    // Batch drawing of cells for performance - using rendered grid
    for (let rowIndex = 0; rowIndex < viewport.rows; rowIndex++) {
      // Safety check for row existence
      if (!renderedGrid[rowIndex]) continue;

      for (let colIndex = 0; colIndex < viewport.cols; colIndex++) {
        // Safety check for cell existence
        if (renderedGrid[rowIndex][colIndex]) {
          const x = colIndex * cellSize + cellOffset;
          const y = rowIndex * cellSize + cellOffset;

          // If cells are very small, ensure they're at least 1 pixel
          const finalWidth = Math.max(cellWidth, 1);
          const finalHeight = Math.max(cellHeight, 1);

          ctx.fillRect(x, y, finalWidth, finalHeight);
        }
      }
    }

    // Draw coordinate axes for reference (at 0,0)
    if (showGrid && cellSize >= 5) {
      const originRow = -viewport.minRow;
      const originCol = -viewport.minCol;

      // Only draw if origin is within viewport
      if (
        originRow >= 0 &&
        originRow < viewport.rows &&
        originCol >= 0 &&
        originCol < viewport.cols
      ) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Red for x-axis
        ctx.lineWidth = 1;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, originRow * cellSize);
        ctx.lineTo(displayWidth, originRow * cellSize);
        ctx.stroke();

        // Y-axis
        ctx.strokeStyle = "rgba(0, 0, 255, 0.5)"; // Blue for y-axis
        ctx.beginPath();
        ctx.moveTo(originCol * cellSize, 0);
        ctx.lineTo(originCol * cellSize, displayHeight);
        ctx.stroke();

        // Origin point
        ctx.fillStyle = "rgba(128, 0, 128, 0.5)"; // Purple for origin
        ctx.beginPath();
        ctx.arc(originCol * cellSize, originRow * cellSize, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [renderedGrid, viewport, cellSize, showGrid, zoomLevel]);

  // Update the canvas when relevant states change - avoid using drawGrid in dependencies
  useEffect(() => {
    // Use requestAnimationFrame to prevent render loop issues
    const animationId = requestAnimationFrame(() => {
      drawGrid();
    });
    return () => cancelAnimationFrame(animationId);
  }, [renderedGrid, viewport, cellSize, showGrid, zoomLevel, drawGrid]);

  // Find active region (area with live cells)
  const findActiveRegion = useCallback(() => {
    if (sparseGrid.size === 0) {
      return null;
    }

    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    // Find bounds of all live cells
    sparseGrid.forEach((key) => {
      const { row, col } = parseCellKey(key);
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
    });

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
  }, [sparseGrid]);

  // Reset viewport to a balanced view centered on (0,0)
  const resetViewport = useCallback(() => {
    // Determine a good size based on container if available
    let size = 20; // Default size
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const containerAspect = containerWidth / containerHeight;

      // Base size on the smaller dimension
      const baseCellCount = Math.floor(
        Math.min(containerWidth, containerHeight) / cellSize
      );
      size = Math.max(15, Math.floor(baseCellCount / 2));

      // Adjust for aspect ratio
      setViewport({
        minRow: -size,
        maxRow: size,
        minCol: -Math.round(size * containerAspect),
        maxCol: Math.round(size * containerAspect),
        get rows() {
          return this.maxRow - this.minRow + 1;
        },
        get cols() {
          return this.maxCol - this.minCol + 1;
        },
      });
    } else {
      // Fallback to square viewport if no container
      setViewport({
        minRow: -size,
        maxRow: size,
        minCol: -size,
        maxCol: size,
        get rows() {
          return this.maxRow - this.minRow + 1;
        },
        get cols() {
          return this.maxCol - this.minCol + 1;
        },
      });
    }
  }, [cellSize]);

  // Initialize viewport when component mounts or when cell size changes
  useEffect(() => {
    resetViewport();
  }, [resetViewport]);

  // Adjust viewport to show the active cells plus a buffer zone
  const adjustViewport = useCallback(() => {
    const activeRegion = findActiveRegion();
    if (!activeRegion) return;

    // Add buffer zone around active cells
    const bufferSize = Math.max(
      10,
      Math.floor(Math.max(activeRegion.width, activeRegion.height) * 0.2)
    );

    // Calculate balanced dimensions that match the container aspect ratio
    let width = activeRegion.width + 2 * bufferSize;
    let height = activeRegion.height + 2 * bufferSize;

    // If container exists, try to match its aspect ratio
    if (containerRef.current) {
      const containerAspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;

      // Ensure dimensions are balanced with the container
      if (width / height < containerAspect) {
        // Too tall, make wider
        width = Math.ceil(height * containerAspect);
      } else if (width / height > containerAspect) {
        // Too wide, make taller
        height = Math.ceil(width / containerAspect);
      }
    }

    // Calculate new viewport bounds
    const centerRow = activeRegion.centerRow;
    const centerCol = activeRegion.centerCol;
    const halfHeight = Math.ceil(height / 2);
    const halfWidth = Math.ceil(width / 2);

    setViewport({
      minRow: centerRow - halfHeight,
      maxRow: centerRow + halfHeight,
      minCol: centerCol - halfWidth,
      maxCol: centerCol + halfWidth,
      get rows() {
        return this.maxRow - this.minRow + 1;
      },
      get cols() {
        return this.maxCol - this.minCol + 1;
      },
    });
  }, [findActiveRegion]);

  // Update auto-scroll to use smooth scrolling with adjusted viewport
  const autoScrollGrid = useCallback(() => {
    if (!autoScroll) return;

    // To avoid circular dependencies, only call adjustViewport
    // outside of the simulation loop
    if (!running) {
      adjustViewport();
    }
  }, [autoScroll, adjustViewport, running]);

  // Initialize empty grid
  const resetGrid = useCallback(() => {
    setSparseGrid(new Set());
    setGeneration(0);
    gridHistoryRef.current = [];
    setStabilized(false);
    setStabilizationInfo(null);
    // Reset viewport when clearing grid
    resetViewport();
  }, [resetViewport]);

  // Initialize random grid
  const randomGrid = useCallback(() => {
    const newSparseGrid = new Set<CellKey>();

    // Add random live cells within the viewport
    for (let row = viewport.minRow; row <= viewport.maxRow; row++) {
      for (let col = viewport.minCol; col <= viewport.maxCol; col++) {
        if (Math.random() > 0.7) {
          newSparseGrid.add(getCellKey(row, col));
        }
      }
    }

    setSparseGrid(newSparseGrid);
    setGeneration(0);
    gridHistoryRef.current = [];
    setStabilized(false);
    setStabilizationInfo(null);
  }, [viewport]);

  // Place pattern at position
  const placePattern = useCallback(
    (pattern: boolean[][], rowStart: number, colStart: number) => {
      setSparseGrid((currentGrid) => {
        const newGrid = new Set(currentGrid);

        // Place the pattern at the specified position
        pattern.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const absoluteRow = rowStart + rowIndex;
            const absoluteCol = colStart + colIndex;

            const key = getCellKey(absoluteRow, absoluteCol);
            if (cell) {
              newGrid.add(key);
            } else {
              newGrid.delete(key);
            }
          });
        });

        return newGrid;
      });

      // Adjust viewport to include new pattern plus buffer
      setTimeout(() => {
        adjustViewport();
      }, 10);
    },
    [adjustViewport]
  );

  // Create pattern from template
  const createPattern = useCallback(
    (patternName: string) => {
      const pattern = PATTERNS[patternName as keyof typeof PATTERNS];
      if (!pattern) return;

      // Save the current pattern name
      currentPatternRef.current = patternName;

      // Set progress info for special patterns
      if (patternName === "Acorn") {
        setProgressInfo("Acorn pattern evolves for ~5206 generations");
      } else {
        setProgressInfo(null);
      }

      // Convert the pattern from 0/1 to boolean
      const boolPattern = pattern.pattern.map((row) =>
        row.map((cell) => Boolean(cell))
      );

      // Place in center of the coordinate system (origin 0,0)
      const rowStart = -Math.floor(boolPattern.length / 2);
      const colStart = -Math.floor(boolPattern[0].length / 2);

      // Reset before placing new pattern
      setSparseGrid(new Set());
      setGeneration(0);
      gridHistoryRef.current = [];
      setStabilized(false);
      setStabilizationInfo(null);

      // For Acorn pattern, adjust history length
      if (patternName === "Acorn") {
        historyLengthRef.current = 120;
      } else {
        historyLengthRef.current = 10;
      }

      // Place the pattern and adjust viewport
      placePattern(boolPattern, rowStart, colStart);
    },
    [placePattern]
  );

  // Run game of life simulation on sparse infinite grid
  const runOneGeneration = useCallback((grid: SparseGrid) => {
    // For each live cell, we need to check:
    // 1. If it survives (has 2 or 3 neighbors)
    // 2. Which dead neighbors have exactly 3 neighbors (will be born)

    const newGrid = new Set<CellKey>();
    const cellsToCheck = new Set<CellKey>(); // Live cells and their neighbors

    // First, add all live cells and their neighbors to cellsToCheck
    grid.forEach((key) => {
      const { row, col } = parseCellKey(key);

      // Add the live cell itself
      cellsToCheck.add(key);

      // Add all 8 neighbors
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            cellsToCheck.add(getCellKey(row + dr, col + dc));
          }
        }
      }
    });

    // Check each cell and apply rules
    cellsToCheck.forEach((key) => {
      const { row, col } = parseCellKey(key);
      const isAlive = grid.has(key);

      // Count live neighbors
      let liveNeighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            const neighborKey = getCellKey(row + dr, col + dc);
            if (grid.has(neighborKey)) {
              liveNeighbors++;
            }
          }
        }
      }

      // Apply Conway's Game of Life rules
      if (isAlive) {
        // Live cell survives if it has 2 or 3 live neighbors
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          newGrid.add(key);
        }
      } else {
        // Dead cell becomes alive if it has exactly 3 live neighbors
        if (liveNeighbors === 3) {
          newGrid.add(key);
        }
      }
    });

    return newGrid;
  }, []);

  // For Acorn pattern, we need to be smarter about detecting stabilization
  const checkStabilization = useCallback(
    (newGrid: SparseGrid, currentGeneration: number) => {
      // For Acorn, don't check for stabilization until we're close to the expected generations
      if (currentPatternRef.current === "Acorn" && currentGeneration < 5000) {
        // Only start keeping history after 4900 generations to save memory
        if (currentGeneration > 4900) {
          // Just start recording history, but don't check for stabilization yet
          const activeRegion = findActiveRegion();
          if (activeRegion) {
            const fingerprint = createActiveRegionFingerprint(
              newGrid,
              activeRegion
            );
            const history = gridHistoryRef.current;
            history.push(fingerprint);
            if (history.length > historyLengthRef.current) {
              history.shift();
            }
          }
        }
        return false;
      }

      // For large patterns like Acorn, checking the entire grid can be expensive
      // We can optimize by creating a hash of the active region
      const activeRegion = findActiveRegion();
      if (!activeRegion) return false;

      const fingerprint = createActiveRegionFingerprint(newGrid, activeRegion);

      // Look for this fingerprint in history
      const history = gridHistoryRef.current;
      const repeatIndex = history.indexOf(fingerprint);

      if (repeatIndex !== -1) {
        const period = history.length - repeatIndex;
        console.log(
          `Pattern stabilized at generation ${currentGeneration} with period ${period}`
        );
        setStabilizationInfo({
          period: period,
          generation: currentGeneration,
        });
        setStabilized(true);
        return true;
      }

      // Add to history
      history.push(fingerprint);
      if (history.length > historyLengthRef.current) {
        history.shift();
      }

      return false;
    },
    [findActiveRegion]
  );

  // Helper function to create a fingerprint of the active region
  const createActiveRegionFingerprint = useCallback(
    (grid: SparseGrid, activeRegion: any) => {
      // Count total live cells and calculate a simple hash based on their distribution
      let liveCells = 0;
      let topLeftHash = 0;
      let topRightHash = 0;
      let bottomLeftHash = 0;
      let bottomRightHash = 0;

      grid.forEach((key) => {
        const { row, col } = parseCellKey(key);

        // Check if cell is in active region
        if (
          row >= activeRegion.minRow &&
          row <= activeRegion.maxRow &&
          col >= activeRegion.minCol &&
          col <= activeRegion.maxCol
        ) {
          liveCells++;
          // Calculate which quadrant of the active region this cell is in
          const relativeR = row - activeRegion.minRow;
          const relativeC = col - activeRegion.minCol;
          const midpointR = activeRegion.height / 2;
          const midpointC = activeRegion.width / 2;

          if (relativeR < midpointR && relativeC < midpointC) topLeftHash++;
          else if (relativeR < midpointR && relativeC >= midpointC)
            topRightHash++;
          else if (relativeR >= midpointR && relativeC < midpointC)
            bottomLeftHash++;
          else bottomRightHash++;
        }
      });

      // Create a compact fingerprint of the pattern
      return `${activeRegion.width}x${activeRegion.height}:${liveCells}:${topLeftHash}:${topRightHash}:${bottomLeftHash}:${bottomRightHash}`;
    },
    []
  );

  // Update grid based on Conway's Game of Life rules (single implementation)
  useEffect(() => {
    // Only run when the component is running
    if (!running) return;

    let timeoutId: NodeJS.Timeout | null = null;

    // Create a local function to avoid stale closure issues
    const runOneStep = () => {
      if (!runningRef.current) return;

      let shouldStop = false;
      let nextGeneration = 0;

      // Run one generation
      setSparseGrid((currentSparseGrid) => {
        const newGrid = runOneGeneration(currentSparseGrid);
        nextGeneration = generationRef.current + 1;

        // Check for stabilization
        if (currentSparseGrid.size < 5000) {
          // For smaller patterns, use full grid comparison
          const gridStr = JSON.stringify(Array.from(newGrid).sort());
          const history = gridHistoryRef.current;

          const repeatIndex = history.indexOf(gridStr);
          if (repeatIndex !== -1) {
            const period = history.length - repeatIndex;
            setStabilizationInfo({
              period: period,
              generation: nextGeneration,
            });
            setStabilized(true);
            shouldStop = true;
          }

          history.push(gridStr);
          if (history.length > historyLengthRef.current) {
            history.shift();
          }
        } else {
          // For larger grids, use the optimized stabilization check
          shouldStop = checkStabilization(newGrid, nextGeneration);
        }

        return newGrid;
      });

      setGeneration((g) => {
        const gen = g + 1;
        // For Acorn pattern, display progress information
        if (currentPatternRef.current === "Acorn" && gen % 100 === 0) {
          const progressPercent = Math.min(Math.floor((gen / 5206) * 100), 99);
          setProgressInfo(
            `Acorn evolution: ${progressPercent}% (generation ${gen} of ~5206)`
          );
        }
        return gen;
      });

      // Auto-adjust viewport if enabled - carefully avoiding infinite loops
      if (autoScroll) {
        // Use a manual setTimeout for this to avoid infinite loops
        const autoScrollTimeoutId = setTimeout(() => {
          // Find active region without using autoScrollGrid to prevent circular dependencies
          const activeRegion = findActiveRegion();
          if (activeRegion) {
            // Calculate new viewport settings
            const bufferSize = Math.max(
              10,
              Math.floor(
                Math.max(activeRegion.width, activeRegion.height) * 0.2
              )
            );

            let width = activeRegion.width + 2 * bufferSize;
            let height = activeRegion.height + 2 * bufferSize;

            // If container exists, try to match its aspect ratio
            if (containerRef.current) {
              const containerAspect =
                containerRef.current.clientWidth /
                containerRef.current.clientHeight;

              // Balance dimensions with container
              if (width / height < containerAspect) {
                width = Math.ceil(height * containerAspect);
              } else if (width / height > containerAspect) {
                height = Math.ceil(width / containerAspect);
              }
            }

            const centerRow = activeRegion.centerRow;
            const centerCol = activeRegion.centerCol;
            const halfHeight = Math.ceil(height / 2);
            const halfWidth = Math.ceil(width / 2);

            // Set viewport directly
            setViewport({
              minRow: centerRow - halfHeight,
              maxRow: centerRow + halfHeight,
              minCol: centerCol - halfWidth,
              maxCol: centerCol + halfWidth,
              get rows() {
                return this.maxRow - this.minRow + 1;
              },
              get cols() {
                return this.maxCol - this.minCol + 1;
              },
            });
          }
        }, 10);

        // Clean up auto scroll timeout if component unmounts
        return () => clearTimeout(autoScrollTimeoutId);
      }

      // Stop if stabilized
      if (shouldStop) {
        runningRef.current = false;
        setRunning(false);
        return;
      }

      // Schedule next update
      timeoutId = setTimeout(runOneStep, speedRef.current);
    };

    // Start the loop
    timeoutId = setTimeout(runOneStep, 0);

    // Clean up function to ensure timeout is cleared when component unmounts or dependencies change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [
    running,
    runOneGeneration,
    autoScroll,
    findActiveRegion,
    checkStabilization,
  ]);

  // Step forward one generation
  const stepForward = useCallback(() => {
    if (running) {
      setRunning(false);
      setTimeout(() => {
        setSparseGrid((grid) => runOneGeneration(grid));
        setGeneration((g) => g + 1);
      }, 10);
    } else {
      setSparseGrid((grid) => runOneGeneration(grid));
      setGeneration((g) => g + 1);
    }
  }, [running, runOneGeneration]);

  // Toggle cell state when clicked - convert from viewport to global coordinates
  const toggleCell = useCallback(
    (
      viewportRowIndex: number,
      viewportColIndex: number,
      forceValue?: boolean
    ) => {
      if (running) return; // Disable editing while simulation is running

      // Convert viewport coordinates to global coordinates
      const globalRow = viewport.minRow + viewportRowIndex;
      const globalCol = viewport.minCol + viewportColIndex;
      const cellKey = getCellKey(globalRow, globalCol);

      setSparseGrid((grid) => {
        const newGrid = new Set(grid);
        const currentState = grid.has(cellKey);
        const newState = forceValue !== undefined ? forceValue : !currentState;

        if (newState) {
          newGrid.add(cellKey);
        } else {
          newGrid.delete(cellKey);
        }

        return newGrid;
      });
    },
    [running, viewport]
  );

  // Handle mouse interactions with canvas
  const getCellCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const viewportColIndex = Math.floor(x / cellSize);
      const viewportRowIndex = Math.floor(y / cellSize);

      // Ensure coordinates are within bounds
      if (
        viewportRowIndex >= 0 &&
        viewportRowIndex < viewport.rows &&
        viewportColIndex >= 0 &&
        viewportColIndex < viewport.cols
      ) {
        return { viewportRowIndex, viewportColIndex };
      }

      return null;
    },
    [cellSize, viewport]
  );

  // Handle canvas mouse events for both drawing and panning
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (running) return;

      if (interactionMode === "draw") {
        // Drawing mode - toggle cells
        const coords = getCellCoordinates(e.clientX, e.clientY);
        if (!coords) return;

        const { viewportRowIndex, viewportColIndex } = coords;
        setIsDragging(true);
        const newValue = !renderedGrid[viewportRowIndex][viewportColIndex];
        setDragValue(newValue);
        toggleCell(viewportRowIndex, viewportColIndex);
      } else {
        // Panning mode - move viewport
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    },
    [running, renderedGrid, getCellCoordinates, toggleCell, interactionMode]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (running) return;

      if (interactionMode === "draw" && isDragging && dragValue !== null) {
        // Drawing mode - toggle cells while dragging
        const coords = getCellCoordinates(e.clientX, e.clientY);
        if (!coords) return;

        const { viewportRowIndex, viewportColIndex } = coords;
        toggleCell(viewportRowIndex, viewportColIndex, dragValue);
      } else if (interactionMode === "pan" && isPanning && panStart) {
        // Panning mode - update viewport position
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;

        // Calculate cell movement (negative because we move viewport opposite to drag)
        const colDelta = -Math.round(dx / cellSize);
        const rowDelta = -Math.round(dy / cellSize);

        // Only update if we've moved at least one cell
        if (colDelta !== 0 || rowDelta !== 0) {
          setViewport((prev) => ({
            minRow: prev.minRow + rowDelta,
            maxRow: prev.maxRow + rowDelta,
            minCol: prev.minCol + colDelta,
            maxCol: prev.maxCol + colDelta,
            get rows() {
              return this.maxRow - this.minRow + 1;
            },
            get cols() {
              return this.maxCol - this.minCol + 1;
            },
          }));

          // Reset pan start to current position
          setPanStart({ x: e.clientX, y: e.clientY });
        }
      }
    },
    [
      running,
      interactionMode,
      isDragging,
      dragValue,
      isPanning,
      panStart,
      getCellCoordinates,
      toggleCell,
      cellSize,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragValue(null);
    setIsPanning(false);
    setPanStart(null);
  }, []);

  // Add mouseup event listener to handle dragging outside the grid
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

  // Handle keyboard shortcuts for mode switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to toggle between draw and pan modes
      if (e.code === "Space") {
        setInteractionMode((prev) => (prev === "draw" ? "pan" : "draw"));
        e.preventDefault();
      }

      // Escape to cancel any current action
      if (e.code === "Escape") {
        setIsDragging(false);
        setDragValue(null);
        setIsPanning(false);
        setPanStart(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle wheel events for zooming
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      // Check if Control key is pressed for zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        if (e.deltaY < 0) {
          // Zoom in
          setZoomLevel((prevZoom) => Math.min(prevZoom + 0.25, 3));
        } else {
          // Zoom out
          setZoomLevel((prevZoom) => Math.max(prevZoom - 0.25, 0.6));
        }
      } else if (!e.ctrlKey && !e.metaKey && interactionMode === "pan") {
        // When in pan mode, wheel to move vertically, shift+wheel to move horizontally
        e.preventDefault();

        const verticalCells = e.deltaY > 0 ? 3 : -3;
        const horizontalCells = e.shiftKey ? (e.deltaY > 0 ? 3 : -3) : 0;

        setViewport((prev) => ({
          minRow: prev.minRow + verticalCells,
          maxRow: prev.maxRow + verticalCells,
          minCol: prev.minCol + horizontalCells,
          maxCol: prev.maxCol + horizontalCells,
          get rows() {
            return this.maxRow - this.minRow + 1;
          },
          get cols() {
            return this.maxCol - this.minCol + 1;
          },
        }));
      }
    },
    [interactionMode]
  );

  // Effect to handle dimensions change and place Acorn if it was pending
  useEffect(() => {
    // Check if we were trying to place Acorn (this could be improved with a proper state flag)
    if (viewport.rows >= 100 && viewport.cols >= 100) {
      const acornPattern = PATTERNS["Acorn"];
      if (acornPattern) {
        // Small delay to ensure grid is initialized
        const timeoutId = setTimeout(() => {
          const boolPattern = acornPattern.pattern.map((row) =>
            row.map((cell) => Boolean(cell))
          );

          const rowStart = -Math.floor(boolPattern.length / 2);
          const colStart = -Math.floor(boolPattern[0].length / 2);

          resetGrid();
          placePattern(boolPattern, rowStart, colStart);
          setGeneration(0);
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [viewport, resetGrid, placePattern]);

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">
          Conway&apos;s Game of Life
        </CardTitle>
        <CardDescription className="text-center">
          A cellular automaton devised by mathematician John Conway
          {stabilizationInfo && (
            <span className="block mt-1 text-xs font-semibold text-green-600">
              Pattern stabilized at generation {stabilizationInfo.generation}
              {stabilizationInfo.period > 1
                ? ` with period ${stabilizationInfo.period}`
                : " (static)"}
            </span>
          )}
          {!stabilizationInfo && progressInfo && (
            <span className="block mt-1 text-xs font-semibold text-blue-600">
              {progressInfo}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        {/* Zoom and interaction mode controls */}
        <div className="flex items-center gap-2 self-end mb-1">
          <div className="flex items-center mr-4">
            <Toggle
              pressed={interactionMode === "draw"}
              onPressedChange={() =>
                setInteractionMode(interactionMode === "draw" ? "pan" : "draw")
              }
              aria-label="Toggle interaction mode"
              variant="outline"
              className={`mr-2 ${
                interactionMode === "draw"
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-green-100 dark:bg-green-900"
              }`}
            >
              {interactionMode === "draw" ? "Draw Mode" : "Pan Mode"}
            </Toggle>
            <span className="text-xs text-gray-500">
              {interactionMode === "draw"
                ? "Click to toggle cells"
                : "Drag to move viewport"}{" "}
              (Space to switch)
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() =>
              setZoomLevel((prevZoom) => Math.max(prevZoom - 0.25, 0.6))
            }
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
            onClick={() =>
              setZoomLevel((prevZoom) => Math.min(prevZoom + 0.25, 3))
            }
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Pattern Assistant */}
        <PatternAssistant
          onPatternSelect={({ pattern }) => {
            // Place the pattern in the center of the coordinate system
            const rowStart = -Math.floor(pattern.length / 2);
            const colStart = -Math.floor(pattern[0].length / 2);

            resetGrid();
            placePattern(pattern, rowStart, colStart);
            setGeneration(0);
          }}
        />

        {/* Game grid */}
        <div
          ref={containerRef}
          className="w-full overflow-auto border rounded-md border-gray-300 dark:border-gray-700"
          style={{
            maxHeight: "60vh",
            aspectRatio: "1 / 1", // Make container more square
          }}
          onWheel={handleWheel}
        >
          <div
            ref={gridRef}
            className="border-gray-300 dark:border-gray-700 rounded-md"
            style={{
              width: `${viewport.cols * cellSize}px`,
              height: `${viewport.rows * cellSize}px`,
              position: "relative",
            }}
          >
            <canvas
              ref={canvasRef}
              width={viewport.cols * cellSize}
              height={viewport.rows * cellSize}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`${
                interactionMode === "draw" ? "cursor-cell" : "cursor-grab"
              } ${isPanning ? "cursor-grabbing" : ""}`}
            />
          </div>
        </div>

        {/* Game stats */}
        <div className="text-sm mb-2 flex items-center gap-4 flex-wrap justify-center">
          <span>Generation: {generation}</span>
          <span>
            Viewport: {viewport.rows}x{viewport.cols}
          </span>
          <span>Live Cells: {sparseGrid.size}</span>
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          <span className="text-xs text-gray-500">
            Range: ({viewport.minRow},{viewport.minCol}) to ({viewport.maxRow},
            {viewport.maxCol})
          </span>
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

          <Button
            variant="outline"
            onClick={resetViewport}
            disabled={sparseGrid.size === 0}
          >
            Reset View
          </Button>
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-4 justify-center w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpeed((s) => Math.max(s - 50, 50))}
                disabled={speed <= 50}
              >
                Faster
              </Button>
              <span className="text-xs w-16 text-center">{speed}ms</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpeed((s) => Math.min(s + 50, 1000))}
                disabled={speed >= 1000}
              >
                Slower
              </Button>
            </div>
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
            pressed={autoScroll}
            onPressedChange={setAutoScroll}
            aria-label="Toggle auto-scroll"
            variant="outline"
          >
            Auto-Adjust View
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
            <strong>Playing on an Infinite Grid:</strong>
          </p>
          <ul className="list-disc list-inside">
            <li>
              The grid is now truly infinite - patterns can expand without
              boundaries and you can explore in any direction
            </li>
            <li>
              Switch between <strong>Draw Mode</strong> and{" "}
              <strong>Pan Mode</strong> using the toggle or press{" "}
              <strong>Space</strong>
            </li>
            <li>
              Click and drag to draw patterns in Draw Mode; drag to move around
              in Pan Mode
            </li>
            <li>
              Use mouse wheel in Pan Mode to scroll vertically (add Shift to
              scroll horizontally)
            </li>
            <li>Use "Reset View" to focus on active cells</li>
            <li>Red and blue lines show the X and Y axes (coordinate 0,0)</li>
            <li>
              <strong>Tip:</strong> Use mouse wheel with Ctrl/Cmd key to zoom in
              and out
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}
