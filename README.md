# METEOR MATH

A fullscreen cosmic arithmetic game. Meteors, planets, and stars are drawn in 3D with React Three Fiber. The geography quiz is still available at `#/explorer`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47231](http://127.0.0.1:47231). The dev server listens on `0.0.0.0:47231`.

## How to play

1. Choose seconds per problem: 15, 30, 45, 60, or a custom value from 1 to 600. The default is 30.
2. Press **START GAME**, then **LAUNCH**.
3. A meteor flies to the center. Solve the addition, subtraction, multiplication, or division problem before the timer hits `00:00`.
4. Press Enter or **SUBMIT**. A wrong answer can be retried until time runs out. A correct answer breaks the meteor into particles and raises the score by 100.
5. At zero, the meteor explodes, **TIME'S UP!** appears, and you lose a life. Three lives, then **GAME OVER**. **PLAY AGAIN** resets the run.

The timer glows calmly, blinks at 10 seconds, and turns red with an alarm for the last 5 seconds. Division stays whole, subtraction stays non-negative, and the same problem is never asked twice in a row. Difficulty rises as you solve more.

## Production build

```bash
npm run build
```

Vite writes the site to `dist`.
