"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import {
  MLCEngine,
  CreateMLCEngine,
  InitProgressReport,
} from "@mlc-ai/web-llm";

interface Pattern {
  pattern: boolean[][];
  description: string;
}

interface PatternAssistantProps {
  onPatternSelect: (pattern: Pattern) => void;
}

// Predefined patterns for when AI is unavailable
const FALLBACK_PATTERNS = [
  {
    name: "Random Oscillator",
    pattern: [
      [false, false, false, false, false],
      [false, false, true, false, false],
      [false, true, true, true, false],
      [false, false, true, false, false],
      [false, false, false, false, false],
    ],
    description: "A simple cross-shaped oscillator",
  },
  {
    name: "Small Glider",
    pattern: [
      [false, true, false],
      [false, false, true],
      [true, true, true],
    ],
    description: "A glider pattern that moves diagonally across the grid",
  },
  {
    name: "Spaceship",
    pattern: [
      [false, true, true, true, true],
      [true, false, false, false, true],
      [false, false, false, false, true],
      [true, false, false, true, false],
    ],
    description: "A lightweight spaceship that moves horizontally",
  },
  {
    name: "Pentadecathlon",
    pattern: [
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
      ],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
    ],
    description: "A 15-period oscillator that looks like a row of cells",
  },
  {
    name: "Gosper Glider Gun",
    pattern: [
      [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
      ],
      [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
      ],
      [
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      [
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        true,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    ],
    description: "A pattern that continuously generates gliders",
  },
];

// More complex patterns for random generation
const COMPLEX_PATTERNS = [
  // Random grid with a density of 25%
  (rows: number, cols: number): boolean[][] =>
    Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => Math.random() < 0.25)
      ),

  // Symmetric pattern generator
  (rows: number, cols: number): boolean[][] => {
    const grid = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(false));

    // Generate a random pattern in one quadrant
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);

    // Fill one quadrant with random cells
    for (let i = 0; i < centerRow; i++) {
      for (let j = 0; j < centerCol; j++) {
        if (Math.random() < 0.3) {
          // Add cell and its mirror images
          grid[i][j] = true;
          grid[rows - 1 - i][j] = true;
          grid[i][cols - 1 - j] = true;
          grid[rows - 1 - i][cols - 1 - j] = true;
        }
      }
    }

    return grid;
  },

  // Random oscillator generator
  (rows: number, cols: number): boolean[][] => {
    const grid = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(false));

    // Add a few random small oscillators
    const oscillators = [
      // Blinker
      [[true, true, true]],
      // Toad
      [
        [false, true, true, true],
        [true, true, true, false],
      ],
      // Beacon
      [
        [true, true, false, false],
        [true, true, false, false],
        [false, false, true, true],
        [false, false, true, true],
      ],
    ];

    // Place random oscillators
    const numOscillators = Math.floor(Math.random() * 5) + 2;

    for (let i = 0; i < numOscillators; i++) {
      const oscillator =
        oscillators[Math.floor(Math.random() * oscillators.length)];
      const height = oscillator.length;
      const width = oscillator[0].length;

      // Find a random position with enough space
      const maxRow = rows - height;
      const maxCol = cols - width;

      if (maxRow > 0 && maxCol > 0) {
        const startRow = Math.floor(Math.random() * maxRow);
        const startCol = Math.floor(Math.random() * maxCol);

        // Place the oscillator
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            grid[startRow + r][startCol + c] =
              oscillator[r][c] || grid[startRow + r][startCol + c];
          }
        }
      }
    }

    return grid;
  },
];

export function PatternAssistant({ onPatternSelect }: PatternAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmEngine, setLlmEngine] = useState<MLCEngine | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [aiMode, setAiMode] = useState<boolean>(false);
  const [tryAgainCount, setTryAgainCount] = useState(0);

  // New state for displaying generation process
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [generatedPattern, setGeneratedPattern] = useState<Pattern | null>(
    null
  );

  // Streaming state
  const [streamedResponse, setStreamedResponse] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Log helper function
  const addLog = useCallback((message: string) => {
    setGenerationLogs((prev) => [...prev, message]);
  }, []);

  // Clear logs helper function
  const clearLogs = useCallback(() => {
    setGenerationLogs([]);
    setGeneratedPattern(null);
    setStreamedResponse("");
  }, []);

  // Helper to count live cells
  const countLiveCells = (pattern: boolean[][]) => {
    return pattern.reduce(
      (total, row) => total + row.filter((cell) => cell).length,
      0
    );
  };

  // Generate a pattern using built-in rules based on the prompt
  const generatePatternWithRules = useCallback(() => {
    setLoading(true);
    if (generationLogs.length === 0) {
      clearLogs();
      addLog(`🔍 Starting rule-based generation with prompt: "${prompt}"`);
    }

    try {
      // Get average dimensions for the pattern
      const rows = 20;
      const cols = 20;
      addLog(`📐 Using grid size: ${rows}x${cols}`);

      let pattern: boolean[][];
      let description = "";
      let generatorUsed = "";

      // Basic keyword matching to determine pattern type
      const promptLower = prompt.toLowerCase();
      addLog("🔤 Analyzing keywords in prompt...");

      if (
        promptLower.includes("oscillator") ||
        promptLower.includes("oscillating")
      ) {
        addLog("🔑 Keyword match: oscillator/oscillating");
        addLog("🧩 Using random oscillator generator");
        generatorUsed = "Random Oscillator Generator";
        pattern = COMPLEX_PATTERNS[2](rows, cols);
        description = "A pattern with multiple oscillating structures";
      } else if (
        promptLower.includes("symmetric") ||
        promptLower.includes("symmetry")
      ) {
        addLog("🔑 Keyword match: symmetric/symmetry");
        addLog("🧩 Using symmetric pattern generator");
        generatorUsed = "Symmetric Pattern Generator";
        pattern = COMPLEX_PATTERNS[1](rows, cols);
        description = "A symmetric pattern with mirrored quadrants";
      } else if (
        promptLower.includes("random") ||
        promptLower.includes("chaos")
      ) {
        addLog("🔑 Keyword match: random/chaos");
        addLog("🧩 Using random density generator");
        generatorUsed = "Random Density Generator";
        pattern = COMPLEX_PATTERNS[0](rows, cols);
        description = "A random pattern with unpredictable behavior";
      } else if (
        promptLower.includes("glider") ||
        promptLower.includes("spaceship") ||
        promptLower.includes("moving")
      ) {
        addLog("🔑 Keyword match: glider/spaceship/moving");
        addLog("🧩 Using Gosper Glider Gun pattern");
        generatorUsed = "Gosper Glider Gun";
        // If they want gliders or movement, use the glider gun pattern
        pattern = FALLBACK_PATTERNS[4].pattern;
        description = "A glider gun that continuously creates moving patterns";
      } else {
        // Use one of the complex generators with a twist based on prompt length
        const generatorIndex = prompt.length % COMPLEX_PATTERNS.length;
        addLog(
          `🔢 No specific keywords, using generator based on prompt length: Index ${generatorIndex}`
        );
        generatorUsed = `Complex Generator ${generatorIndex}`;
        pattern = COMPLEX_PATTERNS[generatorIndex](rows, cols);
        description = `A pattern generated based on your request: "${prompt}"`;
      }

      addLog(
        `📊 Pattern statistics: ${countLiveCells(pattern)} live cells out of ${
          rows * cols
        } total cells`
      );
      addLog(`📝 Description: ${description}`);

      // Calculate some pattern statistics
      const liveCount = countLiveCells(pattern);
      const density = ((liveCount / (rows * cols)) * 100).toFixed(1);

      addLog(
        `📈 Generation complete - ${generatorUsed} - ${liveCount} live cells (${density}% density)`
      );

      const result = { pattern, description };
      setGeneratedPattern(result);
      onPatternSelect(result);
    } catch (error) {
      console.error("Rule-based generation error:", error);
      addLog(
        `❌ Generation error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      // Fallback to a simple predefined pattern
      const fallbackIndex = Math.floor(Math.random() * 3);
      addLog(
        `🔄 Falling back to predefined pattern: ${FALLBACK_PATTERNS[fallbackIndex].name}`
      );
      selectFallbackPattern(fallbackIndex);
    } finally {
      setLoading(false);
    }
  }, [prompt, onPatternSelect, generationLogs.length, addLog, clearLogs]);

  // Parse LLM output into a valid Game of Life pattern
  const parsePatternFromText = useCallback(
    (text: string): Pattern | null => {
      try {
        addLog("🔍 Parsing AI response to extract pattern");

        // Look for a pattern definition in the response
        const patternRegex = /```([\s\S]*?)```/;
        const match = text.match(patternRegex);

        if (!match) {
          addLog("⚠️ No pattern found in AI response");
          throw new Error("No pattern found in response");
        }

        const patternText = match[1].trim();
        addLog(
          `📝 Raw pattern text:\n${patternText.slice(0, 150)}${
            patternText.length > 150 ? "..." : ""
          }`
        );

        // Check if the pattern text contains at least some X's or O's
        if (
          !patternText.includes("X") &&
          !patternText.includes("O") &&
          !patternText.includes("1")
        ) {
          addLog("⚠️ Pattern doesn't contain any live cells (X, O, or 1)");
          throw new Error("Invalid pattern format - no live cells found");
        }

        const lines = patternText
          .split("\n")
          .filter((line) => line.trim().length > 0);

        if (lines.length < 2) {
          addLog("⚠️ Pattern has too few rows (needs at least 2)");
          throw new Error("Invalid pattern format - too few rows");
        }

        // Convert the text pattern to a boolean grid
        // Assuming 'X' or 'O' or '1' represent live cells, and '.' or '0' or spaces represent dead cells
        const pattern: boolean[][] = lines.map((line) =>
          [...line.trim()].map((char) =>
            ["X", "O", "1"].includes(char.toUpperCase())
          )
        );

        // Additional validation - ensure the pattern is not too small or degenerate
        if (pattern.length < 2 || pattern[0].length < 2) {
          addLog("⚠️ Pattern dimensions too small");
          throw new Error("Pattern must be at least 2x2");
        }

        addLog(
          `🧩 Converted to ${pattern.length}x${
            pattern[0]?.length || 0
          } boolean grid`
        );

        // Extract description if available
        let description = "AI-generated pattern";
        const descRegex = /Description:\s*(.*)/i;
        const descMatch = text.match(descRegex);
        if (descMatch) {
          description = descMatch[1].trim();
          addLog(`📄 Found description: "${description}"`);
        }

        const result = { pattern, description };
        setGeneratedPattern(result);
        return result;
      } catch (err) {
        console.error("Failed to parse pattern:", err);
        addLog(
          `❌ Parse error: ${err instanceof Error ? err.message : String(err)}`
        );
        return null;
      }
    },
    [addLog]
  );

  // Initialize WebLLM engine when AI mode is activated
  const initializeAI = useCallback(async () => {
    if (initializing || llmEngine) return;

    setInitializing(true);
    setProgressMessage("Starting initialization...");
    clearLogs();
    addLog("🔄 Initializing AI model for pattern generation");

    try {
      // Use specific model with explicit configuration
      const engine = await CreateMLCEngine(
        "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
        {
          initProgressCallback: (report: InitProgressReport) => {
            setProgressMessage(
              `${report.text} (${Math.round(report.progress * 100)}%)`
            );
            addLog(`📦 ${report.text} (${Math.round(report.progress * 100)}%)`);
          },
          // Include model_list as any to avoid type error
        }
      );

      setLlmEngine(engine);
      setError(null);
      setAiMode(true);
      addLog("✅ AI model initialized successfully");
    } catch (err) {
      console.error("Failed to initialize WebLLM:", err);
      setError(
        "AI mode couldn't be activated. Using built-in patterns instead."
      );
      setAiMode(false);
      addLog(
        "❌ AI initialization failed: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setInitializing(false);
    }
  }, [llmEngine, addLog, clearLogs]);

  // Generate a pattern using AI with streaming
  const generatePatternWithAI = useCallback(async () => {
    if (!llmEngine) {
      setError(
        "AI model not initialized yet. Using built-in pattern generator instead."
      );
      addLog("⚠️ AI model not initialized, falling back to built-in generator");
      generatePatternWithRules();
      return;
    }

    setLoading(true);
    setError(null);
    clearLogs();
    setStreamedResponse("");
    setIsStreaming(true);
    addLog(`🤖 Starting AI generation with prompt: "${prompt}"`);

    try {
      // System prompt with proper escaping
      const systemPrompt = `You are an expert in Conway's Game of Life. 
Generate a pattern in Conway's Game of Life based on user requests.
You MUST follow these rules:
1. Use a grid where 'X' represents a live cell and '.' represents a dead cell.
2. The grid must be at least 5x5 in size but no larger than 20x20.
3. Each row must be the same length, padded with '.' if needed.
4. Wrap the entire pattern in triple backticks.
5. Include a brief description of what the pattern does below the pattern.

EXAMPLE OUTPUT:
\`\`\`
.....
..X..
..X..
..X..
.....
\`\`\`
Description: A simple blinker pattern that oscillates between horizontal and vertical orientations.

EXAMPLE 2 (Glider):
\`\`\`
.....
.X...
..X..
XXX..
.....
\`\`\`
Description: A glider pattern that moves diagonally across the grid.`;

      addLog("📤 Sending prompt to AI model with streaming enabled...");

      try {
        if (llmEngine && llmEngine.chat && llmEngine.chat.completions) {
          const response = await llmEngine.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            repetition_penalty: 1.3,
            stream: true,
          } as any);

          let fullResponse = "";

          // Process streaming response
          for await (const chunk of response as any) {
            const newContent = chunk.choices?.[0]?.delta?.content || "";
            fullResponse += newContent;

            // Update UI with streamed content
            setStreamedResponse(fullResponse);

            if (newContent && newContent.trim()) {
              if (newContent.length < 50) {
                addLog(`📥 Streaming: ${newContent}`);
              } else if (fullResponse.length % 100 < 20) {
                addLog(`📥 Streaming... (${fullResponse.length} chars so far)`);
              }
            }
          }

          addLog("📥 Streaming complete");

          // Process final result
          const patternResult = parsePatternFromText(fullResponse);

          if (patternResult) {
            addLog("✅ Successfully created pattern from AI response");
            onPatternSelect(patternResult);
          } else {
            setError(
              "Could not create pattern from AI response. Using built-in generator instead."
            );
            addLog("🔄 Falling back to rule-based generator");
            generatePatternWithRules();
          }
        } else {
          throw new Error("LLM engine not properly initialized");
        }
      } catch (streamErr) {
        console.error("Streaming error:", streamErr);
        addLog(
          `❌ Streaming error: ${
            streamErr instanceof Error ? streamErr.message : String(streamErr)
          }`
        );
        throw streamErr;
      }
    } catch (err) {
      console.error("Pattern generation error:", err);
      setError(
        "AI generation failed. Using built-in pattern generator instead."
      );
      addLog(
        `❌ AI generation error: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      addLog("🔄 Falling back to rule-based generator");
      generatePatternWithRules();
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  }, [
    llmEngine,
    prompt,
    onPatternSelect,
    addLog,
    clearLogs,
    generatePatternWithRules,
    parsePatternFromText,
  ]);

  // Generate pattern (either with AI or rules)
  const generatePattern = useCallback(() => {
    clearLogs();
    if (aiMode && llmEngine) {
      generatePatternWithAI();
    } else {
      generatePatternWithRules();
    }
  }, [
    aiMode,
    llmEngine,
    generatePatternWithAI,
    generatePatternWithRules,
    clearLogs,
  ]);

  // Select from the predefined patterns
  const selectFallbackPattern = useCallback(
    (index: number) => {
      clearLogs();
      const pattern = FALLBACK_PATTERNS[index];
      addLog(`📋 Selected predefined pattern: ${pattern.name}`);
      addLog(`📝 Description: ${pattern.description}`);

      const liveCount = countLiveCells(pattern.pattern);
      const totalCells = pattern.pattern.length * pattern.pattern[0].length;
      const density = ((liveCount / totalCells) * 100).toFixed(1);
      addLog(
        `📊 Pattern statistics: ${liveCount} live cells out of ${totalCells} total cells (${density}% density)`
      );

      setGeneratedPattern({
        pattern: pattern.pattern,
        description: pattern.description,
      });
      onPatternSelect({
        pattern: pattern.pattern,
        description: pattern.description,
      });
    },
    [addLog, clearLogs, onPatternSelect]
  );

  // Simple pattern preview renderer
  const PatternPreview = ({
    pattern,
    maxSize = 15,
  }: {
    pattern: boolean[][];
    maxSize?: number;
  }) => {
    if (!pattern || pattern.length === 0) return null;

    // If the pattern is too large, sample it
    let displayPattern = pattern;
    if (
      pattern.length > maxSize ||
      (pattern[0] && pattern[0].length > maxSize)
    ) {
      // Sample the pattern to fit maxSize
      const rowStep = Math.max(1, Math.floor(pattern.length / maxSize));
      const colStep = Math.max(1, Math.floor(pattern[0].length / maxSize));

      displayPattern = [];
      for (let i = 0; i < pattern.length; i += rowStep) {
        if (displayPattern.length >= maxSize) break;
        const row: boolean[] = [];
        for (let j = 0; j < pattern[i].length; j += colStep) {
          if (row.length >= maxSize) break;
          row.push(pattern[i][j]);
        }
        displayPattern.push(row);
      }
    }

    return (
      <div className="pattern-preview border border-gray-200 p-1 mt-2 overflow-hidden">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${displayPattern[0].length}, 1fr)`,
            gap: "1px",
          }}
        >
          {displayPattern.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-2 h-2 ${cell ? "bg-black" : "bg-gray-100"}`}
              />
            ))
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          {pattern.length}x{pattern[0]?.length || 0} pattern
          {(pattern.length > maxSize ||
            (pattern[0] && pattern[0].length > maxSize)) &&
            " (scaled down)"}
        </div>
      </div>
    );
  };

  // Live streaming preview component
  const StreamingPreview = () => {
    if (!isStreaming || !streamedResponse) return null;

    // Extract pattern if we have a complete one
    const patternRegex = /```([\s\S]*?)```/;
    const match = streamedResponse.match(patternRegex);

    if (!match) {
      return (
        <div className="mt-2 mb-2">
          <p className="text-xs font-medium">Streaming output:</p>
          <div
            className="mt-1 p-2 bg-gray-100 rounded font-mono text-xs overflow-hidden whitespace-pre-wrap"
            style={{ maxHeight: "100px", overflowY: "auto" }}
          >
            {streamedResponse || "Waiting for model output..."}
          </div>
        </div>
      );
    }

    // If we found a pattern, try to visualize it
    try {
      const patternText = match[1].trim();
      const lines = patternText
        .split("\n")
        .filter((line) => line.trim().length > 0);

      if (lines.length === 0) return null;

      // Check if the pattern looks valid (contains X's)
      const hasLiveCells =
        patternText.includes("X") ||
        patternText.includes("O") ||
        patternText.includes("1");

      // Convert to a basic preview
      return (
        <div className="mt-2 mb-2">
          <p className="text-xs font-medium">
            {hasLiveCells
              ? "Pattern emerging:"
              : "Waiting for valid pattern..."}
          </p>
          <div
            className="pattern-preview-live bg-gray-100 p-2 rounded mt-1 font-mono text-xs whitespace-pre overflow-auto"
            style={{ maxHeight: "150px" }}
          >
            {lines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
          {!hasLiveCells && (
            <p className="text-xs text-amber-600 mt-1">
              No live cells detected yet. Waiting for X's to appear...
            </p>
          )}
        </div>
      );
    } catch (err) {
      return (
        <div className="mt-2 mb-2">
          <p className="text-xs font-medium">Streaming output:</p>
          <div
            className="mt-1 p-2 bg-gray-100 rounded font-mono text-xs overflow-hidden whitespace-pre-wrap"
            style={{ maxHeight: "100px", overflowY: "auto" }}
          >
            {streamedResponse}
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {initializing ? (
          <div className="text-center py-2">
            <p className="text-sm mb-2">Initializing AI model...</p>
            <p className="text-xs text-muted-foreground">{progressMessage}</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                placeholder={
                  aiMode
                    ? "Describe the pattern you want to create..."
                    : "Enter keywords like 'oscillator', 'glider', 'symmetric'..."
                }
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPrompt(e.target.value)
                }
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={generatePattern}
                disabled={!prompt.trim() || loading}
              >
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Predefined Patterns:</p>
                {!aiMode && !initializing && tryAgainCount < 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      initializeAI();
                      setTryAgainCount(tryAgainCount + 1);
                    }}
                    disabled={initializing}
                  >
                    Try AI Mode
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {FALLBACK_PATTERNS.slice(0, 5).map((pattern, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => selectFallbackPattern(index)}
                  >
                    {pattern.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Live Streaming Output */}
            {isStreaming && <StreamingPreview />}

            {/* Generation Debug Panel */}
            <div className="text-sm border rounded-md p-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="font-medium">Generation Process</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  {showDebug ? "Hide Details" : "Show Details"}
                </Button>
              </div>

              {generatedPattern && (
                <div className="mt-2">
                  <p className="text-xs font-medium">
                    Generated Pattern Preview:
                  </p>
                  <PatternPreview pattern={generatedPattern.pattern} />
                </div>
              )}

              {showDebug && (
                <div className="mt-2 max-h-40 overflow-y-auto bg-gray-100 p-2 rounded text-xs font-mono">
                  {generationLogs.length > 0 ? (
                    generationLogs.map((log, index) => (
                      <div key={index} className="pb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <p>
                      No generation logs yet. Generate a pattern to see the
                      process.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              <p className="font-medium mb-1">How it works:</p>
              <p>
                {aiMode
                  ? "AI Mode: Describe any Game of Life pattern in natural language and let the AI create it in real-time."
                  : "Built-in Generator: Enter keywords like 'oscillator', 'symmetric', or 'glider' to generate patterns."}
              </p>
              <p className="mt-1">
                Or select from predefined patterns to start playing immediately.
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
