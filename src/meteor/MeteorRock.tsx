import { useId, useMemo } from "react"
import { buildRock, PALETTES } from "./rocks.ts"

export function MeteorRock({ seed, palette }: { seed: number; palette: number }) {
  const uid = `rk${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const rock = useMemo(() => buildRock(seed), [seed])
  const colors = PALETTES[palette] ?? PALETTES[0]
  if (!colors) return null

  return (
    <svg className="mm-rock-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-body`} cx="32%" cy="30%" r="78%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="38%" stopColor={colors.mid} />
          <stop offset="100%" stopColor={colors.dark} />
        </radialGradient>
        <radialGradient id={`${uid}-crater`} cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor={colors.crater} />
          <stop offset="72%" stopColor={colors.crater} />
          <stop offset="100%" stopColor={colors.craterRim} />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="8%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="28%" stopColor={colors.light} stopOpacity="0.75" />
          <stop offset="62%" stopColor={colors.glow} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.dark} stopOpacity="0.2" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={rock.path} />
        </clipPath>
      </defs>
      <g>
        <g clipPath={`url(#${uid}-clip)`}>
          <path d={rock.path} fill={`url(#${uid}-body)`} />
          {rock.facets.map((facet, index) => (
            <ellipse
              key={`f${index}`}
              cx={facet.cx}
              cy={facet.cy}
              rx={facet.rx}
              ry={facet.ry}
              fill={index % 2 === 0 ? colors.facet : colors.dark}
              opacity={index % 2 === 0 ? 0.22 : 0.16}
              transform={`rotate(${facet.rot.toFixed(1)} ${facet.cx} ${facet.cy})`}
            />
          ))}
          {rock.specks.map((speck, index) => (
            <circle
              key={`s${index}`}
              cx={speck.cx}
              cy={speck.cy}
              r={speck.r}
              fill={speck.light ? colors.light : colors.dark}
              opacity={speck.light ? 0.55 : 0.45}
            />
          ))}
          {rock.craters.map((crater, index) => (
            <g key={`c${index}`} transform={`rotate(${crater.rot.toFixed(1)} ${crater.cx} ${crater.cy})`}>
              <ellipse cx={crater.cx} cy={crater.cy} rx={crater.rx} ry={crater.ry} fill={`url(#${uid}-crater)`} />
              <ellipse
                cx={crater.cx - crater.rx * 0.18}
                cy={crater.cy - crater.ry * 0.2}
                rx={crater.rx * 0.28}
                ry={crater.ry * 0.18}
                fill="#fff"
                opacity="0.18"
              />
            </g>
          ))}
        </g>
        <path d={rock.path} fill="none" stroke={colors.dark} strokeWidth="7" opacity="0.35" />
        <path d={rock.path} fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="3.2" />
      </g>
    </svg>
  )
}
