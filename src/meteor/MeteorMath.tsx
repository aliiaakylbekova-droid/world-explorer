import { CosmicSky } from "./CosmicSky.tsx"
import { MenuScreen } from "./MenuScreen.tsx"
import { MeteorField } from "./MeteorField.tsx"
import { PlayHud } from "./PlayHud.tsx"
import { ResultsScreen } from "./ResultsScreen.tsx"
import { useMeteorGame } from "./useMeteorGame.ts"
import "./meteor.css"

export function MeteorMath({ onOpenExplorer }: { onOpenExplorer: () => void }) {
  const game = useMeteorGame()
  const flash =
    game.status === "success" ? "is-success" : game.feedback === "wrong" ? "is-wrong" : game.status === "miss" ? "is-miss" : ""

  return (
    <div className={`mm ${game.phase === "play" ? "is-playing" : ""} ${flash}`.trim()} data-phase={game.phase}>
      <CosmicSky />
      <MeteorField
        meteors={game.meteors}
        focusId={game.phase === "play" ? game.focusId : null}
        prompt={game.prompt}
        status={game.status}
        feedback={game.feedback}
        wrongTries={game.wrongTries}
      />
      <div className="mm-flash" aria-hidden="true" />
      {game.phase === "menu" ? (
        <MenuScreen
          settings={game.settings}
          onTime={game.setTime}
          onDifficulty={game.setDifficulty}
          onCount={game.setCount}
          onStart={game.start}
          onOpenExplorer={onOpenExplorer}
        />
      ) : null}
      {game.phase === "play" ? (
        <PlayHud
          score={game.score}
          count={game.settings.count}
          currentNumber={game.currentNumber}
          finished={game.correct + game.missed}
          status={game.status}
          feedback={game.feedback}
          entry={game.entry}
          remainingMs={game.remainingMs}
          limitMs={game.limitMs}
          onDigit={game.typeDigit}
          onBackspace={game.backspace}
          onSubmit={game.submit}
          onStop={game.stop}
        />
      ) : null}
      {game.phase === "results" ? (
        <ResultsScreen
          ending={game.ending}
          score={game.score}
          correct={game.correct}
          missed={game.missed}
          wrongTries={game.wrongTries}
          accuracy={game.accuracy}
          onReplay={game.replay}
          onMenu={game.menu}
        />
      ) : null}
    </div>
  )
}
