export type CampaignCheck =
  | { type: "continent"; continent: string }
  | { type: "iso"; iso: string }
  | { type: "point"; lat: number; lng: number; radius: number; iso?: string }
  | { type: "river"; lat: number; lng: number; radius: number; isos: string[] }
  | { type: "range"; lat: number; lng: number; radius: number; isos: string[] }

export type CampaignLevel = {
  id: string
  number: number
  title: string
  goal: string
  instruction: string
  hint: string
  success: string
  fact: string
  timeMs: number
  reward: number
  check: CampaignCheck
  fly: { lat: number; lng: number; dist: number }
  nextFly?: { lat: number; lng: number; dist: number }
}

export const GEO_CAMPAIGN: CampaignLevel[] = [
  {
    id: "l1-asia",
    number: 1,
    title: "Азия",
    goal: "Найди материк Азия на глобусе.",
    instruction: "Кликни любую страну Азии. Клик по океану или другому материку не засчитывается.",
    hint: "Самый большой материк. К востоку от Урала, от Аравии до Японии — не Африка и не только Европа.",
    success: "Азия — крупнейший материк. Здесь Кыргызстан, Китай, Индия и многие другие страны.",
    fact: "В Азии живёт больше половины человечества. Она тянется от Босфора до Тихого океана.",
    timeMs: 75_000,
    reward: 120,
    check: { type: "continent", continent: "Asia" },
    fly: { lat: 28, lng: 88, dist: 7.15 },
    nextFly: { lat: 41.3, lng: 74.6, dist: 5.35 },
  },
  {
    id: "l2-kyrgyzstan",
    number: 2,
    title: "Кыргызстан",
    goal: "Найди Кыргызстан в Центральной Азии.",
    instruction: "Кликни страну Кыргызстан. Рядом Казахстан, Китай, Узбекистан и Таджикистан — но это не ответ.",
    hint: "Горная республика к югу от Казахстана и к западу от Китая. Столица — Бишкек.",
    success: "Кыргызстан — страна гор, юрт и Иссык-Куля.",
    fact: "Больше 90% территории Кыргызстана — горы. Страну обрамляет Тянь-Шань.",
    timeMs: 70_000,
    reward: 140,
    check: { type: "iso", iso: "KG" },
    fly: { lat: 41.3, lng: 74.6, dist: 5.2 },
    nextFly: { lat: 46.6, lng: 2.4, dist: 5.4 },
  },
  {
    id: "l3-france",
    number: 3,
    title: "Франция",
    goal: "Найди Францию в Западной Европе.",
    instruction: "Кликни Францию. Рядом Испания, Германия, Италия и Великобритания — это ложные цели.",
    hint: "Шестиугольник Западной Европы: Атлантика на западе, Средиземное море на юге. Столица — Париж.",
    success: "Франция — от Альп до Атлантики, Париж стоит на Сене.",
    fact: "Франция — перекрёсток Западной Европы. Отсюда метр и парижский меридиан.",
    timeMs: 65_000,
    reward: 150,
    check: { type: "iso", iso: "FR" },
    fly: { lat: 46.6, lng: 2.4, dist: 5.15 },
    nextFly: { lat: 26.8, lng: 30.8, dist: 5.35 },
  },
  {
    id: "l4-egypt-capital",
    number: 4,
    title: "Египет · столица",
    goal: "Найди страну Каира — столицы Египта.",
    instruction: "Кликни Египет на глобусе. Каир стоит на Ниле на северо-востоке Африки.",
    hint: "Северо-восток Африки, где Нил впадает в Средиземное море. Не Саудовская Аравия и не Судан.",
    success: "Каир — столица Египта, на Ниле чуть южнее дельты.",
    fact: "Каир — крупнейший город Африки и ворота к пирамидам Гизы.",
    timeMs: 70_000,
    reward: 160,
    check: { type: "iso", iso: "EG" },
    fly: { lat: 26.8, lng: 30.8, dist: 5.05 },
    nextFly: { lat: 15.6, lng: 32.6, dist: 5.5 },
  },
  {
    id: "l5-nile",
    number: 5,
    title: "Нил",
    goal: "Найди долину Нила.",
    instruction: "Кликни вдоль Нила в Египте или Судане — длинная река течёт с юга на север в Средиземное море.",
    hint: "Тонкая зелёная лента через Сахару. Кликни Египет или Судан около 15–30° с.ш., ~32° в.д.",
    success: "Нил — великая река Африки. Египет — дар Нила.",
    fact: "Нил течёт на север от экваториальных озёр и Голубого Нила Эфиопии к дельте у Каира.",
    timeMs: 80_000,
    reward: 180,
    check: { type: "river", lat: 18.5, lng: 32.4, radius: 9.5, isos: ["EG", "SD", "SS", "ET", "UG"] },
    fly: { lat: 15.6, lng: 32.6, dist: 5.45 },
    nextFly: { lat: 42.1, lng: 78.2, dist: 4.7 },
  },
  {
    id: "l6-tian-shan",
    number: 6,
    title: "Тянь-Шань",
    goal: "Найди горы Тянь-Шань.",
    instruction: "Кликни Тянь-Шань — хребты Кыргызстана и границы с Китаем, не Гималаи.",
    hint: "Севернее Гималаев, около 42° с.ш. 78° в.д. Кыргызстан / запад Китая / юго-восток Казахстана.",
    success: "Тянь-Шань — Небесные горы. Пик Победы стоит на границе Кыргызстана и Китая.",
    fact: "Тянь-Шань — отдельная система от Гималаев. Иссык-Куль лежит в его северной котловине.",
    timeMs: 75_000,
    reward: 190,
    check: { type: "range", lat: 42.0, lng: 78.5, radius: 5.5, isos: ["KG", "KZ", "CN"] },
    fly: { lat: 42.1, lng: 78.2, dist: 4.55 },
    nextFly: { lat: 42.45, lng: 77.25, dist: 3.85 },
  },
  {
    id: "l7-issyk-kul",
    number: 7,
    title: "Иссык-Куль · координаты",
    goal: "Найди Иссык-Куль по координатам 42.45° с.ш., 77.25° в.д.",
    instruction: "Кликни котловину озера к востоку от Бишкека, внутри Кыргызстана. Важна точность — не каждый клик по горам подходит.",
    hint: "К востоку от Бишкека, севернее хребта Тянь-Шаня. Около 42.4° с.ш. 77.2° в.д.",
    success: "Иссык-Куль — высокогорное солоноватое озеро, которое почти не замерзает.",
    fact: "Иссык-Куль лежит на высоте 1609 м. Глубина до 668 м. По берегам шёл Шёлковый путь.",
    timeMs: 80_000,
    reward: 220,
    check: { type: "point", lat: 42.45, lng: 77.25, radius: 2.35, iso: "KG" },
    fly: { lat: 42.45, lng: 77.25, dist: 3.7 },
  },
]

export function campaignById(id: string) {
  return GEO_CAMPAIGN.find((l) => l.id === id) ?? null
}
