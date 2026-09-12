
"use client";


import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;

type Position = { x: number; y: number };

export default function Home() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const directionRef = useRef(direction);
  directionRef.current = direction;

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some((seg) => seg.x === newFood.x && seg.y === newFood.y)
    );
    return newFood;
  }, []);

  // Écoute des touches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (current.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (current.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (current.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (current.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Boucle de jeu principale
  useEffect(() => {
    if (isGameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead: Position = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Collision avec les bords
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Collision avec soi-même
        if (
          prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Le serpent mange la nourriture
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 1);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // retire la queue si pas de nourriture mangée
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [isGameOver, food, generateFood]);

  const handleRestart = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setFood({ x: 15, y: 10 });
    setIsGameOver(false);
    setScore(0);
  };

          return (
    <main
      className="min-h-screen bg-[#5f574f] flex flex-col items-center justify-center gap-6"
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      <div className="flex items-center gap-6">
        <p className="text-[#fff1e8] text-lg">{String(score).padStart(3, "0")}</p>
        {isGameOver && (
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-[#ff004d] text-white text-xs hover:bg-[#ff2e63] transition-colors"
          >
            REJOUER
          </button>
        )}
      </div>

      {/* Cartouche façon PICO-8 */}
      <div className="bg-[#ff004d] p-3 rounded-sm">
        <div className="flex justify-between px-1 mb-2">
          <p className="text-[#fff1e8] text-[8px]">PICO-8</p>
          <p className="text-[#fff1e8] text-[8px]">WWW.PICO-8.COM</p>
        </div>

        <div
          className="relative bg-black"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Points de grille discrets, façon écran PICO-8 */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            return (
              <div
                key={i}
                className="absolute bg-[#1d2b53]"
                style={{
                  width: 2,
                  height: 2,
                  left: x * CELL_SIZE + CELL_SIZE / 2 - 1,
                  top: y * CELL_SIZE + CELL_SIZE / 2 - 1,
                }}
              />
            );
          })}

          {/* Le serpent en blocs pixel nets */}
          {snake.map((segment, i) => {
            const isHead = i === 0;
            const dx = direction.x;
            const dy = direction.y;

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1,
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  backgroundColor: isHead ? "#00e436" : "#00b430",
                }}
              >
                {isHead && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `rotate(${
                        dx === 1 ? 0 : dx === -1 ? 180 : dy === 1 ? 90 : -90
                      }deg)`,
                    }}
                  >
                    <div className="flex gap-1" style={{ marginLeft: 4 }}>
                      <div className="w-[3px] h-[3px] bg-black" />
                      <div className="w-[3px] h-[3px] bg-black" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pomme pixel (corps rouge + tige verte) */}
          <div
            className="absolute"
            style={{
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              backgroundColor: "#ff004d",
            }}
          >
            <div
              className="absolute bg-[#00e436]"
              style={{ width: 3, height: 3, top: -2, left: "50%", transform: "translateX(-50%)" }}
            />
          </div>

          {isGameOver && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
              <p className="text-[#ff004d] text-xs">GAME OVER</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[#fff1e8]/60 text-[8px]">↑ ↓ ← → POUR JOUER</p>
    </main>
  );
}