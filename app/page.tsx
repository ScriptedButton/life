import GameOfLife from "@/components/game-of-life";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gradient-to-b from-background to-muted/20">
      <header className="mb-6 w-full max-w-screen-lg">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Conway's Game of Life
        </h1>
      </header>

      <main className="flex-1 w-full max-w-screen-lg overflow-x-auto">
        <GameOfLife />
      </main>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Conway's Game of Life implemented with NextJS and ShadCN UI</p>
        <p className="mt-1">
          <a
            href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Learn more about Conway's Game of Life
          </a>
        </p>
      </footer>
    </div>
  );
}
