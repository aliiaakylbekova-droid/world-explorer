import type { Feature, FeatureCollection, Geometry } from "geojson"
import focusCountries from "../data/focus-countries.json" with { type: "json" }

type CountryProps = { name: string }

const collection = focusCountries as FeatureCollection<Geometry, CountryProps>

const byName = new Map(collection.features.map((item) => [item.properties.name, item]))

/** Natural Earth 110m outlines (via world-atlas) for countries the quiz can shade honestly. */
export function countryFeature(name: string): Feature<Geometry, CountryProps> | null {
  return byName.get(name) ?? null
}
