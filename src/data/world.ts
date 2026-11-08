export type ContinentId =
  | "asia"
  | "europe"
  | "africa"
  | "north-america"
  | "south-america"
  | "oceania"
  | "antarctica"

export type LandmarkKind =
  | "tower"
  | "pyramid"
  | "statue"
  | "dome"
  | "wall"
  | "mountain"
  | "lake"
  | "pagoda"
  | "arch"
  | "fire"
  | "yurt"

export type LandmarkDef = {
  id: string
  name: string
  kind: LandmarkKind
  fact: string
}

export type Country = {
  id: string
  name: string
  continent: ContinentId
  capital: string
  lat: number
  lng: number
  flag: string
  colors: readonly [string, string, string]
  about: string
  landmarks: LandmarkDef[]
}

export const CONTINENTS: { id: ContinentId; name: string; lat: number; lng: number; zoom: number }[] = [
  { id: "asia", name: "Азия", lat: 34, lng: 85, zoom: 1.6 },
  { id: "europe", name: "Европа", lat: 50, lng: 15, zoom: 1.85 },
  { id: "africa", name: "Африка", lat: 2, lng: 20, zoom: 1.55 },
  { id: "north-america", name: "Северная Америка", lat: 45, lng: -100, zoom: 1.45 },
  { id: "south-america", name: "Южная Америка", lat: -15, lng: -58, zoom: 1.55 },
  { id: "oceania", name: "Австралия и Океания", lat: -25, lng: 135, zoom: 1.7 },
  { id: "antarctica", name: "Антарктида", lat: -78, lng: 0, zoom: 1.4 },
]

export const COUNTRIES: Country[] = [
  {
    id: "KG",
    name: "Кыргызстан",
    continent: "asia",
    capital: "Бишкек",
    lat: 41.2,
    lng: 74.6,
    flag: "🇰🇬",
    colors: ["#e8112d", "#ffd200", "#e8112d"],
    about:
      "Горная страна Тянь-Шаня. Столица — Бишкек. Здесь лежат озеро Иссык-Куль и пик Победы, высшая точка страны.",
    landmarks: [
      { id: "burana", name: "Башня Бурана", kind: "tower", fact: "XI век. Минарет древнего Баласагуна на Чуйской долине." },
      { id: "issyk", name: "Иссык-Куль", kind: "lake", fact: "Одно из крупнейших высокогорных озёр мира, почти не замерзает." },
      { id: "pobeda", name: "Пик Победы", kind: "mountain", fact: "7439 м, высшая точка Кыргызстана на границе с Китаем." },
      { id: "yurt-kg", name: "Юрта кочевников", kind: "yurt", fact: "Боз үй — традиционный дом кыргызских кочевников." },
    ],
  },
  {
    id: "KZ",
    name: "Казахстан",
    continent: "asia",
    capital: "Астана",
    lat: 48.0,
    lng: 67.0,
    flag: "🇰🇿",
    colors: ["#00afca", "#ffd200", "#00afca"],
    about: "Самая большая страна Центральной Азии. Столицу перенесли из Алматы в Астану в 1997 году.",
    landmarks: [
      { id: "baiterek", name: "Байтерек", kind: "tower", fact: "Символ Астаны: древо жизни с золотым яйцом на вершине." },
      { id: "khanshatyr", name: "Хан Шатыр", kind: "dome", fact: "Гигантский шатёр в столице, один из крупнейших в мире." },
    ],
  },
  {
    id: "UZ",
    name: "Узбекистан",
    continent: "asia",
    capital: "Ташкент",
    lat: 41.3,
    lng: 64.6,
    flag: "🇺🇿",
    colors: ["#1eb53a", "#0099b5", "#ce1126"],
    about: "Сердце Шёлкового пути: Самарканд, Бухара и Хива хранят медресе, купола и минареты.",
    landmarks: [
      { id: "registan", name: "Регистан", kind: "dome", fact: "Ансамбль медресе в Самарканде — визитная карточка Узбекистана." },
      { id: "kalyan", name: "Минарет Калян", kind: "tower", fact: "Бухара, XII век. Высокий минарет из жжёного кирпича." },
    ],
  },
  {
    id: "TJ",
    name: "Таджикистан",
    continent: "asia",
    capital: "Душанбе",
    lat: 38.9,
    lng: 71.0,
    flag: "🇹🇯",
    colors: ["#cc0000", "#ffffff", "#006600"],
    about: "Страна Памира. Более 90% территории — горы. Высшая точка — пик Исмоила Сомони.",
    landmarks: [
      { id: "somoni", name: "Пик Исмоила Сомони", kind: "mountain", fact: "7495 м, высочайшая вершина Памира." },
      { id: "pamir", name: "Памирский тракт", kind: "arch", fact: "Одна из самых высокогорных дорог мира." },
    ],
  },
  {
    id: "TM",
    name: "Туркменистан",
    continent: "asia",
    capital: "Ашхабад",
    lat: 38.9,
    lng: 59.5,
    flag: "🇹🇲",
    colors: ["#00843d", "#ffffff", "#d22630"],
    about: "Пустыня Каракумы, мраморный Ашхабад и горящий газовый кратер Дарваза.",
    landmarks: [
      { id: "darvaza", name: "Дарваза", kind: "fire", fact: "«Врата ада» — горящий газовый кратер в Каракумах." },
      { id: "ashgabat", name: "Монумент независимости", kind: "tower", fact: "Беломраморный Ашхабад и золотые купола столицы." },
    ],
  },
  {
    id: "FR",
    name: "Франция",
    continent: "europe",
    capital: "Париж",
    lat: 46.6,
    lng: 2.2,
    flag: "🇫🇷",
    colors: ["#0055a4", "#ffffff", "#ef4135"],
    about: "Страна в Западной Европе. Столица — Париж, символ — Эйфелева башня.",
    landmarks: [
      { id: "eiffel", name: "Эйфелева башня", kind: "tower", fact: "324 м. Построена к Всемирной выставке 1889 года." },
      { id: "arc", name: "Триумфальная арка", kind: "arch", fact: "Стоит на площади Шарля де Голля в Париже." },
    ],
  },
  {
    id: "EG",
    name: "Египет",
    continent: "africa",
    capital: "Каир",
    lat: 26.8,
    lng: 30.8,
    flag: "🇪🇬",
    colors: ["#ce1126", "#ffffff", "#000000"],
    about: "Долина Нила и пустыня Сахара. Древние пирамиды Гизы — одно из чудес света.",
    landmarks: [
      { id: "giza", name: "Пирамиды Гизы", kind: "pyramid", fact: "Пирамида Хеопса — единственное сохранившееся чудо древнего мира." },
      { id: "sphinx", name: "Большой Сфинкс", kind: "statue", fact: "Лев с головой фараона у подножия пирамид." },
    ],
  },
  {
    id: "CN",
    name: "Китай",
    continent: "asia",
    capital: "Пекин",
    lat: 35.9,
    lng: 104.2,
    flag: "🇨🇳",
    colors: ["#de2910", "#ffde00", "#de2910"],
    about: "Самая населённая страна мира на протяжении веков. Великая Китайская стена тянется через север страны.",
    landmarks: [
      { id: "wall", name: "Великая Китайская стена", kind: "wall", fact: "Тысячи километров укреплений против кочевников севера." },
      { id: "pagoda", name: "Пагода", kind: "pagoda", fact: "Многоярусные храмовые башни — классика китайской архитектуры." },
    ],
  },
  {
    id: "IN",
    name: "Индия",
    continent: "asia",
    capital: "Нью-Дели",
    lat: 21.0,
    lng: 78.0,
    flag: "🇮🇳",
    colors: ["#ff9933", "#ffffff", "#138808"],
    about: "Полуостров Индостан, Гималаи на севере. Тадж-Махал в Агре — мавзолей из белого мрамора.",
    landmarks: [
      { id: "taj", name: "Тадж-Махал", kind: "dome", fact: "Построен императором Шах-Джаханом в память о Мумтаз-Махал." },
      { id: "himalaya", name: "Гималаи", kind: "mountain", fact: "Высочайшая горная система Земли, здесь Джомолунгма." },
    ],
  },
  {
    id: "US",
    name: "США",
    continent: "north-america",
    capital: "Вашингтон",
    lat: 39.8,
    lng: -98.5,
    flag: "🇺🇸",
    colors: ["#3c3b6e", "#ffffff", "#b22234"],
    about: "Федерация из 50 штатов. Столица — Вашингтон, а статуя Свободы встречает в Нью-Йорке.",
    landmarks: [
      { id: "liberty", name: "Статуя Свободы", kind: "statue", fact: "Дар Франции 1886 года, стоит на острове Liberty Island." },
      { id: "canyon", name: "Гранд-Каньон", kind: "mountain", fact: "Ущелье реки Колорадо в Аризоне глубиной более 1,5 км." },
    ],
  },
  {
    id: "RU",
    name: "Россия",
    continent: "europe",
    capital: "Москва",
    lat: 60,
    lng: 90,
    flag: "🇷🇺",
    colors: ["#ffffff", "#0039a6", "#d52b1e"],
    about: "Самая большая страна мира. Байкал — самое глубокое озеро планеты.",
    landmarks: [
      { id: "basil", name: "Храм Василия Блаженного", kind: "dome", fact: "Собор на Красной площади с разноцветными куполами." },
      { id: "baikal", name: "Байкал", kind: "lake", fact: "Максимальная глубина 1642 м, юг Восточной Сибири." },
    ],
  },
  {
    id: "JP",
    name: "Япония",
    continent: "asia",
    capital: "Токио",
    lat: 36.2,
    lng: 138.2,
    flag: "🇯🇵",
    colors: ["#ffffff", "#bc002d", "#ffffff"],
    about: "Архипелаг у восточной Азии. Фудзи — священная вершина и символ страны.",
    landmarks: [
      { id: "fuji", name: "Фудзи", kind: "mountain", fact: "3776 м, стратовулкан на острове Хонсю." },
      { id: "torii", name: "Тории", kind: "arch", fact: "Священные ворота синтоистских святилищ." },
    ],
  },
  {
    id: "IT",
    name: "Италия",
    continent: "europe",
    capital: "Рим",
    lat: 42.8,
    lng: 12.6,
    flag: "🇮🇹",
    colors: ["#009246", "#ffffff", "#ce2b37"],
    about: "Апеннинский полуостров. Колизей в Риме — арена Древнего Рима.",
    landmarks: [{ id: "colosseum", name: "Колизей", kind: "arch", fact: "Амфитеатр Флавиев, I век н. э." }],
  },
  {
    id: "BR",
    name: "Бразилия",
    continent: "south-america",
    capital: "Бразилиа",
    lat: -14.2,
    lng: -51.9,
    flag: "🇧🇷",
    colors: ["#009c3b", "#ffdf00", "#002776"],
    about: "Крупнейшая страна Южной Америки. Амазонка несёт воды через влажный экваториальный лес.",
    landmarks: [{ id: "amazon", name: "Амазонка", kind: "lake", fact: "Самая полноводная река Земли." }],
  },
  {
    id: "GB",
    name: "Великобритания",
    continent: "europe",
    capital: "Лондон",
    lat: 54.0,
    lng: -2.0,
    flag: "🇬🇧",
    colors: ["#012169", "#ffffff", "#c8102e"],
    about: "Островное государство. Биг-Бен — часовая башня Вестминстерского дворца.",
    landmarks: [{ id: "bigben", name: "Биг-Бен", kind: "tower", fact: "Часы и колокол башни Елизаветы в Лондоне." }],
  },
  {
    id: "DE",
    name: "Германия",
    continent: "europe",
    capital: "Берлин",
    lat: 51.2,
    lng: 10.4,
    flag: "🇩🇪",
    colors: ["#000000", "#dd0000", "#ffce00"],
    about: "Страна в центре Европы. Бранденбургские ворота — символ Берлина.",
    landmarks: [{ id: "brandenburg", name: "Бранденбургские ворота", kind: "arch", fact: "Неоклассическая арка 1791 года." }],
  },
  {
    id: "TR",
    name: "Турция",
    continent: "asia",
    capital: "Анкара",
    lat: 39.0,
    lng: 35.2,
    flag: "🇹🇷",
    colors: ["#e30a17", "#ffffff", "#e30a17"],
    about: "Мост между Европой и Азией. Айя-София в Стамбуле меняла судьбу империй.",
    landmarks: [{ id: "hagia", name: "Айя-София", kind: "dome", fact: "Купол VI века в историческом центре Стамбула." }],
  },
  {
    id: "AU",
    name: "Австралия",
    continent: "oceania",
    capital: "Канберра",
    lat: -25.3,
    lng: 133.8,
    flag: "🇦🇺",
    colors: ["#012169", "#ffffff", "#e4002b"],
    about: "Материк-государство. Сиднейский оперный театр стоит в гавани Сиднея.",
    landmarks: [{ id: "opera", name: "Сиднейская опера", kind: "dome", fact: "Белые «паруса» на берегу гавани." }],
  },
  {
    id: "ZA",
    name: "ЮАР",
    continent: "africa",
    capital: "Претория",
    lat: -30.6,
    lng: 22.9,
    flag: "🇿🇦",
    colors: ["#007a4d", "#ffb612", "#de3831"],
    about: "На юге Африки. Столицы три: Претория, Кейптаун и Блумфонтейн.",
    landmarks: [{ id: "table", name: "Столовая гора", kind: "mountain", fact: "Плоская вершина над Кейптауном." }],
  },
  {
    id: "AQ",
    name: "Антарктида",
    continent: "antarctica",
    capital: "—",
    lat: -80,
    lng: 0,
    flag: "🇦🇶",
    colors: ["#ffffff", "#3e7cff", "#ffffff"],
    about: "Ледяной материк. Нет постоянного населения и столицы — только научные станции.",
    landmarks: [{ id: "ice", name: "Ледяной щит", kind: "mountain", fact: "Крупнейший запас пресной воды на Земле." }],
  },
]

export const COUNTRY_BY_ID = new Map(COUNTRIES.map((c) => [c.id, c]))

export function countriesOn(continent: ContinentId) {
  return COUNTRIES.filter((c) => c.continent === continent)
}

export function nearestCountry(lat: number, lng: number) {
  let best = COUNTRIES[0]
  let bestD = Infinity
  for (const country of COUNTRIES) {
    const dLat = country.lat - lat
    const dLng = country.lng - lng
    const d = dLat * dLat + dLng * dLng
    if (d < bestD) {
      bestD = d
      best = country
    }
  }
  return best
}
