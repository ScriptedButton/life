export const FALLBACK_PATTERNS = [
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
export const COMPLEX_PATTERNS = [
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

// Common patterns
export const PATTERNS = {
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
    Acorn: {
        pattern: [
            [0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [1, 1, 0, 0, 1, 1, 1],
        ],
        description: "A methuselah that takes 5206 generations to stabilize",
    },
};
