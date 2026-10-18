/*
 * ANGIOPICTURE — все тексты, даты, ссылки и пути к файлам сайта.
 * Чтобы добавить мероприятие, допишите объект в массив SITE_DATA.events (порядок не важен:
 * карточки сортируются по полю `date`). Пустая ссылка ("") в files.* → строка документа в состоянии «скоро».
 * photoReport открывается в новой вкладке.
 */
window.SITE_DATA = {
  meta: {
    title: "ANGIOPICTURE — План 2027",
    description: "План мероприятий ANGIOPICTURE на 2027 год, коммерческие предложения и программы ближайших конференций."
  },

  brand: {
    name: "ANGIOPICTURE",
    /* Какой логотип показывать: "withYear" — как в присланном файле (ANGIOPICTURE 2026), "noYear" — без года */
    logoVariant: "withYear",
    logos: {
      withYear: { src: "assets/img/logo-angiopicture-2026.svg", width: 2212, height: 267 },
      noYear: { src: "assets/img/logo-angiopicture.svg", width: 1739, height: 267 }
    },
    logoAlt: "ANGIOPICTURE",
    /* куда ведёт клик по логотипу (шапка и футер), открывается в новой вкладке */
    logoHref: "https://angiopicture.ru",
    logoLabel: "ANGIOPICTURE — сайт angiopicture.ru (откроется в новой вкладке)"
  },

  nav: [
    { label: "План 2027", href: "#plan" },
    { label: "Мероприятия", href: "#events" },
    { label: "Контакты", href: "#contacts" }
  ],

  hero: {
    eyebrow: "ANGIOPICTURE",
    title: "План",
    year: "2027",
    lead: "Конференции по рентгенэндоваскулярной, сердечно-сосудистой хирургии и сосудистой онкологии",
    /* кнопка «Смотреть» открывает план во встроенном просмотрщике (js/pdf-viewer.js); без JS — откроет PDF */
    view: { label: "Смотреть", headerLabel: "Смотреть план", title: "План 2027", href: "assets/pdf/angiopicture-plan-2027.pdf", file: "Angiopicture_План_2027.pdf" }
  },

  /* План 2027: данные таблицы «План мероприятий ANGIOPICTURE на 2027 г.» из PDF */
  plan: {
    labels: { place: "Место проведения", format: "Формат", more: "Подробнее" },
    items: [
      {
        dayLabel: "19", monthLabel: "февраля",
        eventId: "rostov-2027",   /* есть карточка ниже → строка плана ведёт к ней */
        lead: "Третья расширенная конференция",
        name: "«Ростовский Ангиоклуб – 2027»",
        place: "Ростов-на-Дону, Radisson Hotel Gorizont Rostov-on-Don",
        format: "Очный"
      },
      {
        dayLabel: "23", monthLabel: "апреля",
        lead: "Пятничные встречи с живой хирургией Angiopicture",
        name: "«Игра в четыре руки»",
        place: "Ростов-на-Дону, ЮОМЦ ФМБА России",
        format: "Гибридный"
      },
      {
        dayLabel: "28–29", monthLabel: "мая",
        lead: "Конференция с международным участием",
        name: "«Angiopicture-2027»",
        place: "Сочи",
        format: "Гибридный"
      },
      {
        dayLabel: "08–09", monthLabel: "октября",
        lead: "Конференция с международным участием",
        name: "«Осенняя актуализация Angiopicture-2027»",
        place: "уточняется",
        format: "Гибридный"
      },
      {
        dayLabel: "17", monthLabel: "декабря",
        lead: "",
        name: "«Рождественские встречи спасателей конечностей Angiopicture-2027»",
        place: "Санкт-Петербург",
        format: "Гибридный"
      }
    ]
  },

  /* Ближайшие мероприятия (с КП, программой и галереей) */
  eventsSection: {
    eyebrow: "Партнёрам и участникам",
    heading: "Ближайшие мероприятия",
    labels: {
      date: "Дата", place: "Место",
      soon: "скоро",
      galleryOpen: "Показать все фото",
      galleryClose: "Собрать стопку",
      galleryHint: "Наведите на стопку или нажмите, чтобы раскрыть",
      galleryHintTouch: "Нажмите на стопку, чтобы раскрыть",
      docs: "Документы",
      external: "Яндекс Диск, откроется в новой вкладке"
    },
    buttons: {
      kp: "Коммерческое предложение",
      program: "Предварительная программа",
      photoReport: "Прошлогодний фотоотчёт"
    }
  },

  events: [
    {
      id: "rostov-2027",
      date: "2027-02-19",
      dateLabel: "19 февраля 2027",
      kicker: "Третья научно-практическая конференция",
      title: "«Ростовский Ангиоклуб–2027»",
      place: "Конференц-зал Конгресс-отеля «Radisson Hotel Gorizont Rostov-on-Don»",
      address: "Ростов-на-Дону, проспект Михаила Нагибина 32Д/2",
      description:
        "Однодневная конференция в очном формате: лекции, круглые столы, секционные заседания, сателлитные симпозиумы, мастер-классы и демонстрация высокотехнологичных вмешательств при трансляционных включениях из операционных РКБ ФГБУЗ ЮОМЦ ФМБА России. Научное руководство — Российское научное общество ангиологов и сосудистых хирургов.",
      facts: [
        { label: "Участников", value: "не менее 200 очно" },
        { label: "Спонсорские пакеты", value: "150 000 – 700 000 руб." },
        { label: "Трансляция", value: "angiopicture.ru и Telegram" }
      ],
      files: {
        kp: "assets/pdf/kp-rostov-angioclub-2027.pdf",
        program: "",
        photoReport: "https://disk.yandex.ru/d/O3nYCus-jJV8iw"
      },
      downloadNames: {
        kp: "Коммерческое предложение — Ростовский Ангиоклуб–2027.pdf"
      },
      galleryTitle: "Фото прошлого Ростовского Ангиоклуба",
      photos: [
        { src: "assets/img/angioclub/rac-01-1200.webp", thumb: "assets/img/angioclub/rac-01-400.webp", w: 1200, h: 800, alt: "Три участницы за стойкой регистрации ANGIOPICTURE" },
        { src: "assets/img/angioclub/rac-02-1200.webp", thumb: "assets/img/angioclub/rac-02-400.webp", w: 1200, h: 675, alt: "Общий вид конференц-зала с экранами и слушателями" },
        { src: "assets/img/angioclub/rac-03-1200.webp", thumb: "assets/img/angioclub/rac-03-400.webp", w: 1200, h: 800, alt: "Участники конференции у стенда партнёра" },
        { src: "assets/img/angioclub/rac-04-1200.webp", thumb: "assets/img/angioclub/rac-04-400.webp", w: 1200, h: 800, alt: "Участники дискуссии на сцене конференции" },
        { src: "assets/img/angioclub/rac-05-1200.webp", thumb: "assets/img/angioclub/rac-05-400.webp", w: 1200, h: 800, alt: "Три врача беседуют в кулуарах конференции" },
        { src: "assets/img/angioclub/rac-06-1200.webp", thumb: "assets/img/angioclub/rac-06-400.webp", w: 1200, h: 800, alt: "Зал конференции: слушатели смотрят трансляцию операции на экране" },
        { src: "assets/img/angioclub/rac-07-1200.webp", thumb: "assets/img/angioclub/rac-07-400.webp", w: 1200, h: 800, alt: "Участник в выставочной зоне показывает большой палец" },
        { src: "assets/img/angioclub/rac-08-1200.webp", thumb: "assets/img/angioclub/rac-08-400.webp", w: 1200, h: 800, alt: "Внимательные слушатели в первых рядах конференц-зала" },
        { src: "assets/img/angioclub/rac-09-1200.webp", thumb: "assets/img/angioclub/rac-09-400.webp", w: 1200, h: 675, alt: "Слушатели в зале во время научной сессии" }
      ]
    },
    {
      id: "spb-2026",
      date: "2026-12-18",
      dateLabel: "18 декабря 2026",
      kicker: "Пятничные встречи Angiopicture с живой хирургией",
      title: "«Рождественские встречи спасателей конечностей Angiopicture-2026»",
      place: "На базе СПб ГБУЗ «Городская больница № 14», конференц-зал",
      address: "Санкт-Петербург, ул. Косинова, 19/9",
      description:
        "Программа с включениями из операционных Городской больницы № 14 и Городской больницы Святого Великомученика Георгия, секциями и докладами ведущих специалистов.",
      facts: [
        { label: "Спонсорские пакеты", value: "300 000 – 700 000 руб." }
      ],
      files: {
        kp: "assets/pdf/kp-spb-2026.pdf",
        program: "assets/pdf/program-spb-2026.pdf",
        photoReport: "https://disk.yandex.ru/d/hJRREOfTnrhJSw"
      },
      downloadNames: {
        kp: "Коммерческое предложение — Рождественские встречи 2026.pdf",
        program: "Предварительная программа — Рождественские встречи 2026.pdf"
      },
      galleryTitle: "Фото конференции в Санкт-Петербурге, 2025",
      photos: [
        { src: "assets/img/spb-2025/spb-01-1200.webp", thumb: "assets/img/spb-2025/spb-01-400.webp", w: 1200, h: 800, alt: "Пятеро участников на фоне новогоднего баннера «Рождественские встречи»" },
        { src: "assets/img/spb-2025/spb-02-1200.webp", thumb: "assets/img/spb-2025/spb-02-400.webp", w: 1200, h: 800, alt: "Президиум за столом на фоне экрана с логотипом ANGIOPICTURE" },
        { src: "assets/img/spb-2025/spb-03-1200.webp", thumb: "assets/img/spb-2025/spb-03-400.webp", w: 1200, h: 800, alt: "Двое участников беседуют на фоне баннера конференции" },
        { src: "assets/img/spb-2025/spb-04-1200.webp", thumb: "assets/img/spb-2025/spb-04-400.webp", w: 1200, h: 800, alt: "Двое участников конференции улыбаются в зрительном зале" },
        { src: "assets/img/spb-2025/spb-05-1200.webp", thumb: "assets/img/spb-2025/spb-05-400.webp", w: 1200, h: 800, alt: "Групповое фото команды врачей и медсестёр" },
        { src: "assets/img/spb-2025/spb-06-1200.webp", thumb: "assets/img/spb-2025/spb-06-400.webp", w: 1200, h: 800, alt: "Беседа у выставочного стенда в холле конференции" },
        { src: "assets/img/spb-2025/spb-07-1200.webp", thumb: "assets/img/spb-2025/spb-07-400.webp", w: 1200, h: 800, alt: "Слушатели в зале с красными креслами" },
        { src: "assets/img/spb-2025/spb-08-1200.webp", thumb: "assets/img/spb-2025/spb-08-400.webp", w: 1200, h: 800, alt: "Групповое фото семи участников конференции" },
        { src: "assets/img/spb-2025/spb-09-1200.webp", thumb: "assets/img/spb-2025/spb-09-400.webp", w: 1200, h: 800, alt: "Слушатели внимательно следят за докладом" }
      ]
    }
  ],

  /* Футер: контакты из PDF */
  footer: {
    heading: "Контакты",
    organizer: "Организатор конференций ООО «АНГИОПИКЧА»",
    address: "Юридический адрес: 344064, г. Ростов-на-Дону, ул. Смелая, дом 28",
    website: { label: "angiopicture.ru", href: "https://angiopicture.ru/" },
    people: [
      { role: "Контактное лицо", name: "Жолковский Александр Владимирович", phone: "+7 903 401 46 85", email: "angiopicture@mail.ru" },
      { role: "Генеральный директор", name: "Ревуцкая Виктория Евгеньевна", phone: "+7 919 888 74 94", email: "angiopicture.koordinator@ya.ru" },
      { role: "Коммерческий директор", name: "Шилов Дмитрий Германович", phone: "+7 918 581 16 82", email: "dmitry.shilov@gmail.com" }
    ],
    copyright: "© ANGIOPICTURE"
  },

  ui: {
    skip: "К содержимому",
    toTop: "Наверх",
    menu: "Меню",
    menuClose: "Закрыть меню",
    /* тексты окна просмотра PDF */
    pdf: {
      download: "Скачать", close: "Закрыть", zoomIn: "Увеличить", zoomOut: "Уменьшить", fit: "По ширине",
      loading: "Загружаем документ…", error: "Не удалось открыть документ в браузере.",
      openTab: "Открыть в новой вкладке", page: "Страница", of: "из"
    },
    lightbox: { close: "Закрыть", prev: "Предыдущее фото", next: "Следующее фото", label: "Просмотр фото", counter: "из" },
    noscript: "Для просмотра сайта включите JavaScript. План 2027 можно скачать здесь:"
  }
};
