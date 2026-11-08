import { en } from "./en"
import { ru, type Dict } from "./ru"

export type Locale = "ru" | "en"

const catalogs: Record<Locale, Dict> = { ru, en }

let locale: Locale = "ru"

export function setLocale(next: Locale) {
  locale = next
}

export function getLocale(): Locale {
  return locale
}

export function t(): Dict {
  return catalogs[locale]
}
