export type Achievement = {
  id: string
  title: string
  hint: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", title: "Первый шаг", hint: "Зарегистрируй исследователя." },
  { id: "globe-spin", title: "Вращение мира", hint: "Открой World Explorer." },
  { id: "first-mission", title: "Географ", hint: "Заверши любую гео-миссию." },
  { id: "challenge", title: "Чемпион вызова", hint: "Пройди World Challenge." },
  { id: "silk-road", title: "Шёлковый путь", hint: "Пройди все пять стран Центральной Азии." },
  { id: "collector", title: "Коллекционер", hint: "Собери 8 достопримечательностей." },
  { id: "xp-500", title: "Знаток", hint: "Набери 500 опыта." },
  { id: "xp-1500", title: "Картограф", hint: "Набери 1500 опыта." },
]
