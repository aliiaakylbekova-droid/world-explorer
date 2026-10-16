export type LatLngTuple = [number, number]

export type Camera = {
  center: LatLngTuple
  zoom: number
}

export type Reveal =
  | { kind: "marker"; at: LatLngTuple; label: string; camera: Camera }
  | { kind: "line"; points: readonly LatLngTuple[]; label: string; camera: Camera }
  | { kind: "frame"; camera: Camera }

export type Question = {
  id: number
  category: string
  difficulty: "easy" | "medium" | "hard"
  question: string
  options: readonly [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  explanation: string
  camera: Camera
  focusCountry?: "Kyrgyzstan" | "Kazakhstan"
  reveal: Reveal
}

const world: Camera = { center: [18, 12], zoom: 2 }

export const QUESTIONS: readonly Question[] = [
  {
    id: 1,
    category: "Материки и океаны",
    difficulty: "easy",
    question: "Какой океан самый большой на Земле?",
    options: [
      "Тихий океан",
      "Атлантический океан",
      "Индийский океан",
      "Северный Ледовитый океан",
    ],
    correctAnswer: 0,
    explanation:
      "Тихий океан — самый большой океан Земли. Он занимает около трети поверхности планеты и по площади больше всей суши.",
    camera: world,
    reveal: {
      kind: "marker",
      at: [0, -160],
      label: "Тихий океан",
      camera: { center: [-8, -150], zoom: 3 },
    },
  },
  {
    id: 2,
    category: "Материки и океаны",
    difficulty: "easy",
    question: "Какой материк самый большой по площади?",
    options: ["Евразия", "Африка", "Северная Америка", "Антарктида"],
    correctAnswer: 0,
    explanation:
      "Евразия — самый большой материк. На нём расположены Европа и Азия, и по площади она больше Африки.",
    camera: world,
    reveal: {
      kind: "frame",
      camera: { center: [48, 78], zoom: 3 },
    },
  },
  {
    id: 3,
    category: "Страны и столицы",
    difficulty: "easy",
    question: "Как называется столица Кыргызстана?",
    options: ["Бишкек", "Ош", "Алматы", "Ташкент"],
    correctAnswer: 0,
    explanation:
      "Столица Кыргызстана — Бишкек. Город лежит в Чуйской долине на севере страны. Ош — крупный город на юге, но не столица.",
    camera: { center: [41.2, 74.6], zoom: 6 },
    focusCountry: "Kyrgyzstan",
    reveal: {
      kind: "marker",
      at: [42.8766, 74.6037],
      label: "Бишкек",
      camera: { center: [42.8766, 74.6037], zoom: 8 },
    },
  },
  {
    id: 4,
    category: "Экватор и полушария",
    difficulty: "easy",
    question: "Какая линия делит Землю на Северное и Южное полушария?",
    options: ["Экватор", "Гринвичский меридиан", "Северный тропик", "Южный полярный круг"],
    correctAnswer: 0,
    explanation:
      "Экватор проходит на широте 0° и делит Землю на Северное и Южное полушария. Гринвичский меридиан делит её на Западное и Восточное.",
    camera: world,
    reveal: {
      kind: "line",
      points: [
        [0, -179.9],
        [0, 179.9],
      ],
      label: "Экватор, 0°",
      camera: { center: [0, 15], zoom: 2 },
    },
  },
  {
    id: 5,
    category: "Реки и озёра",
    difficulty: "easy",
    question: "Какая река — самая длинная в Африке?",
    options: ["Нил", "Конго", "Нигер", "Замбези"],
    correctAnswer: 0,
    explanation:
      "Нил — самая длинная река Африки. Он течёт с юга на север и впадает в Средиземное море. Конго полноводнее, но короче Нила.",
    camera: { center: [8, 22], zoom: 3 },
    reveal: {
      kind: "line",
      points: [
        [0.431, 33.203],
        [4.859, 31.582],
        [9.533, 31.656],
        [15.501, 32.56],
        [17.678, 33.97],
        [19.537, 33.322],
        [19.169, 30.474],
        [21.8, 31.35],
        [24.088, 32.9],
        [25.687, 32.64],
        [30.044, 31.236],
        [31.46, 30.37],
      ],
      label: "Нил",
      camera: { center: [16, 32], zoom: 4 },
    },
  },
  {
    id: 6,
    category: "Координаты",
    difficulty: "medium",
    question: "Какие координаты у точки пересечения экватора и нулевого меридиана?",
    options: ["0° ш., 0° д.", "0° ш., 180° д.", "90° с. ш., 0° д.", "23,5° ю. ш., 0° д."],
    correctAnswer: 0,
    explanation:
      "Широта экватора — 0°, долгота нулевого меридиана — тоже 0°. Их пересечение лежит в Гвинейском заливе у берегов Африки.",
    camera: world,
    reveal: {
      kind: "marker",
      at: [0, 0],
      label: "0° ш., 0° д.",
      camera: { center: [0, 0], zoom: 5 },
    },
  },
  {
    id: 7,
    category: "Реки и озёра",
    difficulty: "medium",
    question: "Какое озеро — самое глубокое в мире?",
    options: ["Байкал", "Виктория", "Танганьика", "Каспийское море"],
    correctAnswer: 0,
    explanation:
      "Байкал — самое глубокое озеро мира: максимальная глубина 1642 м. Оно на юге Восточной Сибири. Каспийское море больше по площади, но мельче.",
    camera: { center: [55, 95], zoom: 3 },
    reveal: {
      kind: "line",
      points: [
        [51.72, 103.85],
        [52.8, 106.9],
        [53.55, 108.2],
        [54.7, 108.95],
        [55.65, 109.55],
      ],
      label: "Байкал",
      camera: { center: [53.6, 108], zoom: 5 },
    },
  },
  {
    id: 8,
    category: "Горы и равнины",
    difficulty: "medium",
    question: "Какая горная система — самая высокая на Земле?",
    options: ["Гималаи", "Анды", "Альпы", "Кордильеры"],
    correctAnswer: 0,
    explanation:
      "Гималаи — высочайшая горная система Земли. Здесь находится Джомолунгма (Эверест) высотой 8848 м. Анды длиннее, но ниже.",
    camera: { center: [32, 90], zoom: 3 },
    reveal: {
      kind: "marker",
      at: [27.9881, 86.925],
      label: "Джомолунгма, Гималаи",
      camera: { center: [28.1, 86.9], zoom: 6 },
    },
  },
  {
    id: 9,
    category: "Климатические пояса",
    difficulty: "medium",
    question: "В каком климатическом поясе лежит большая часть Амазонской низменности?",
    options: ["Экваториальный", "Субэкваториальный", "Тропический", "Умеренный"],
    correctAnswer: 0,
    explanation:
      "Большая часть Амазонской низменности лежит в экваториальном поясе: весь год жарко и очень влажно, поэтому здесь влажные экваториальные леса.",
    camera: { center: [-8, -62], zoom: 3 },
    reveal: {
      kind: "line",
      points: [
        [-3.749, -73.253],
        [-4.252, -69.938],
        [-3.368, -64.711],
        [-3.119, -60.021],
        [-2.628, -56.736],
        [-2.443, -54.708],
        [-1.523, -52.582],
        [0.034, -51.066],
      ],
      label: "Амазонка",
      camera: { center: [-3, -62], zoom: 4 },
    },
  },
  {
    id: 10,
    category: "Пустыни",
    difficulty: "medium",
    question: "Какая пустыня — самая большая жаркая пустыня мира?",
    options: ["Сахара", "Гоби", "Калахари", "Каракумы"],
    correctAnswer: 0,
    explanation:
      "Сахара — крупнейшая жаркая пустыня мира, она занимает север Африки. Самая большая пустыня вообще — Антарктическая, но она холодная.",
    camera: { center: [6, 18], zoom: 3 },
    reveal: {
      kind: "marker",
      at: [23, 10],
      label: "Сахара",
      camera: { center: [23, 10], zoom: 4 },
    },
  },
  {
    id: 11,
    category: "Природные зоны",
    difficulty: "hard",
    question: "Какая природная зона занимает большую часть полуострова Ямал?",
    options: ["Тундра", "Тайга", "Степь", "Арктические пустыни"],
    correctAnswer: 0,
    explanation:
      "Большая часть Ямала занята тундрой: многолетняя мерзлота, короткое лето, мхи, лишайники и низкие кустарники. Тайга начинается южнее.",
    camera: { center: [68.5, 70], zoom: 4 },
    reveal: {
      kind: "marker",
      at: [70.4, 69.2],
      label: "Ямал, тундра",
      camera: { center: [70.2, 69.5], zoom: 5 },
    },
  },
  {
    id: 12,
    category: "Страны и столицы",
    difficulty: "hard",
    question: "Какой город является столицей Казахстана?",
    options: ["Астана", "Алматы", "Ташкент", "Бишкек"],
    correctAnswer: 0,
    explanation:
      "Столица Казахстана — Астана. В 1997 году столицу перенесли из Алматы. В 2019–2022 годах город назывался Нур-Султан, затем имя Астана вернули.",
    camera: { center: [48.5, 67], zoom: 4 },
    focusCountry: "Kazakhstan",
    reveal: {
      kind: "marker",
      at: [51.1282, 71.4306],
      label: "Астана",
      camera: { center: [51.13, 71.43], zoom: 6 },
    },
  },
  {
    id: 13,
    category: "Кыргызстан и Центральная Азия",
    difficulty: "hard",
    question: "Какое озеро Кыргызстана почти не замерзает зимой?",
    options: ["Иссык-Куль", "Сон-Кёль", "Чатыр-Кёль", "Сары-Челек"],
    correctAnswer: 0,
    explanation:
      "Иссык-Куль — большое солоноватое озеро на Тянь-Шане. Из-за солёности и глубины оно почти не замерзает. Сон-Кёль, Чатыр-Кёль и Сары-Челек зимой покрываются льдом.",
    camera: { center: [41.5, 75.8], zoom: 6 },
    focusCountry: "Kyrgyzstan",
    reveal: {
      kind: "line",
      points: [
        [42.43, 76.19],
        [42.42, 77.25],
        [42.55, 78.2],
      ],
      label: "Иссык-Куль",
      camera: { center: [42.45, 77.2], zoom: 8 },
    },
  },
  {
    id: 14,
    category: "Реки и равнины",
    difficulty: "hard",
    question: "По какой равнине протекает Волга?",
    options: [
      "Восточно-Европейская равнина",
      "Западно-Сибирская равнина",
      "Среднесибирское плоскогорье",
      "Великая Китайская равнина",
    ],
    correctAnswer: 0,
    explanation:
      "Волга течёт по Восточно-Европейской равнине и впадает в Каспийское море. Это самая длинная река Европы — около 3530 км. По Западно-Сибирской равнине течёт Обь.",
    camera: { center: [56, 42], zoom: 4 },
    reveal: {
      kind: "line",
      points: [
        [57.251, 32.468],
        [56.859, 35.922],
        [57.626, 39.884],
        [56.327, 44.002],
        [55.788, 49.122],
        [53.195, 50.106],
        [51.533, 46.034],
        [48.708, 44.514],
        [46.35, 48.04],
        [45.72, 47.85],
      ],
      label: "Волга",
      camera: { center: [53, 45], zoom: 4 },
    },
  },
  {
    id: 15,
    category: "Кыргызстан и Центральная Азия",
    difficulty: "hard",
    question: "В какой горной системе находится пик Победы — высшая точка Кыргызстана?",
    options: ["Тянь-Шань", "Памир", "Алтай", "Гималаи"],
    correctAnswer: 0,
    explanation:
      "Пик Победы (7439 м) — высшая точка Кыргызстана. Он стоит в Тянь-Шане на границе с Китаем. Памир лежит западнее, в основном в Таджикистане.",
    camera: { center: [42, 72], zoom: 4 },
    reveal: {
      kind: "marker",
      at: [42.0375, 80.1294],
      label: "Пик Победы, Тянь-Шань",
      camera: { center: [42.04, 80.13], zoom: 7 },
    },
  },
]

function assertQuiz(items: readonly Question[]) {
  if (items.length !== 15) throw new Error("Quiz must contain 15 questions")
  const ids = new Set<number>()
  const mix = { easy: 0, medium: 0, hard: 0 }
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Duplicate question id ${item.id}`)
    ids.add(item.id)
    if (item.options.length !== 4) throw new Error(`Question ${item.id} needs 4 options`)
    if (new Set(item.options).size !== 4) throw new Error(`Question ${item.id} has repeated options`)
    if (item.correctAnswer < 0 || item.correctAnswer > 3) {
      throw new Error(`Question ${item.id} has an invalid correctAnswer`)
    }
    mix[item.difficulty] += 1
  }
  if (mix.easy !== 5 || mix.medium !== 5 || mix.hard !== 5) {
    throw new Error("Quiz needs 5 easy, 5 medium and 5 hard questions")
  }
}

assertQuiz(QUESTIONS)
