import { createContext, useContext } from 'react';

// Only the UI is translated. Note names (C D E F G A H) and octave numbers
// always stay in Czech/Latin notation regardless of language.

export type Lang = 'cs' | 'ru';

export interface Dict {
  appTitle: string;
  heroSub: string;

  clefLabel: string;
  clefTreble: string;
  clefBass: string;
  clefBoth: string;

  chooseExercise: string;
  mode1Title: string;
  mode1Desc: string;
  mode2Title: string;
  mode2Desc: string;
  mode3Title: string;
  mode3Desc: string;

  settings: string;
  language: string;
  setMicOctave: string;
  setMicOctaveDesc: string;
  setAutoPlay: string;
  setAutoPlayDesc: string;
  setAutoListen: string;
  setAutoListenDesc: string;
  foot: string;

  back: string;
  playNote: string;
  toggleTheme: string;
  staffAria: string;

  statCorrect: string;
  statStreak: string;
  statTotal: string;
  clefTagTreble: string;
  clefTagBass: string;

  promptMode1: string;
  promptMode2: string;
  promptMode3: string;

  clear: string;
  check: string;
  next: string;

  micHint: string;
  micAllow: string;
  micListen: string;
  micStop: string;
  micListening: string;
  micStopped: string;
  micUnavailable: string;
  micError: (name: string) => string;

  praise: string[];
  correctIs: (label: string) => string;
  almostCorrect: (label: string) => string;

  results: string;
  resultsDesc: string;
  statAccuracy: string;
  statAnswered: string;
  statBest: string;
  statDays: string;
  perNoteTitle: string;
  perModeTitle: string;
  noData: string;
  reset: string;
  resetConfirm: string;

  sessionLabel: string;
  endless: string;
  notesUnit: string;
  perNoteTime: string;
  off: string;
  seeResults: string;
  sessionDone: string;
  playAgain: string;
  home: string;
  timeUp: (label: string) => string;
}

export const translations: Record<Lang, Dict> = {
  cs: {
    appTitle: 'Čtu noty',
    heroSub: 'Procvičuj čtení not na klavír 🎶',

    clefLabel: 'Klíč',
    clefTreble: 'Houslový',
    clefBass: 'Basový',
    clefBoth: 'Oba',

    chooseExercise: 'Vyber cvičení',
    mode1Title: 'Poznej notu',
    mode1Desc: 'Vyber správný název ze čtyř možností',
    mode2Title: 'Napiš notu',
    mode2Desc: 'Zadej název a oktávu, třeba G1',
    mode3Title: 'Zahraj notu',
    mode3Desc: 'Zahraj notu na klavír — poslechnu si ji',

    settings: 'Nastavení',
    language: 'Jazyk',
    setMicOctave: 'Kontrolovat oktávu u mikrofonu',
    setMicOctaveDesc: 'Když je vypnuto, stačí správný název noty',
    setAutoPlay: 'Přehrát notu po odpovědi',
    setAutoPlayDesc: 'Uslyšíš, jak nota zní',
    setAutoListen: 'Automaticky poslouchat',
    setAutoListenDesc: 'V režimu Zahraj notu se mikrofon u každé noty zapne sám',
    foot: 'Noty: C D E F G A H  •  H = anglické B, B = béčko (Bb)',

    back: 'Zpět',
    playNote: 'Přehrát notu',
    toggleTheme: 'Přepnout režim',
    staffAria: 'Nota na notové osnově',

    statCorrect: 'Správně',
    statStreak: 'Série',
    statTotal: 'Celkem',
    clefTagTreble: 'houslový klíč',
    clefTagBass: 'basový klíč',

    promptMode1: 'Jaká je to nota?',
    promptMode2: 'Napiš název noty a oktávu',
    promptMode3: 'Zahraj tuto notu na klavír',

    clear: 'Smazat',
    check: 'Zkontrolovat',
    next: 'Další nota ›',

    micHint: 'Klikni na „Poslouchat“ a zahraj notu',
    micAllow: 'Povol prosím mikrofon…',
    micListen: '🎤 Poslouchat',
    micStop: '⏸ Zastavit',
    micListening: 'Poslouchám… zahraj notu 🎧',
    micStopped: 'Zastaveno',
    micUnavailable: 'Mikrofon tu není dostupný 😕',
    micError: (name) => `Nepovedlo se zapnout mikrofon (${name})`,

    praise: ['Super! 🎉', 'Výborně! ⭐', 'Správně! 🌟', 'Bravo! 🎶', 'Paráda! 💜', 'Jupí! 🎈'],
    correctIs: (label) => `Je to ${label}`,
    almostCorrect: (label) => `Skoro! Správně je ${label}`,

    results: 'Výsledky',
    resultsDesc: 'Přehled tvého cvičení',
    statAccuracy: 'Úspěšnost',
    statAnswered: 'Odpovědí',
    statBest: 'Nejdelší série',
    statDays: 'Dní cvičení',
    perNoteTitle: 'Podle noty',
    perModeTitle: 'Podle cvičení',
    noData: 'Zatím žádná data — začni hrát! 🎹',
    reset: 'Vymazat výsledky',
    resetConfirm: 'Opravdu vymazat?',

    sessionLabel: 'Počet not',
    endless: 'Volně',
    notesUnit: 'not',
    perNoteTime: 'Čas na notu',
    off: 'Vyp.',
    seeResults: 'Výsledky ›',
    sessionDone: 'Hotovo! 🎉',
    playAgain: 'Hrát znovu',
    home: 'Domů',
    timeUp: (label) => `Čas vypršel! Správně je ${label}`,
  },

  ru: {
    appTitle: 'Читаю ноты',
    heroSub: 'Учимся читать ноты на пианино 🎶',

    clefLabel: 'Ключ',
    clefTreble: 'Скрипичный',
    clefBass: 'Басовый',
    clefBoth: 'Оба',

    chooseExercise: 'Выбери упражнение',
    mode1Title: 'Угадай ноту',
    mode1Desc: 'Выбери правильное название из четырёх',
    mode2Title: 'Напиши ноту',
    mode2Desc: 'Введи название и октаву, например G1',
    mode3Title: 'Сыграй ноту',
    mode3Desc: 'Сыграй ноту на пианино — я её послушаю',

    settings: 'Настройки',
    language: 'Язык',
    setMicOctave: 'Проверять октаву у микрофона',
    setMicOctaveDesc: 'Если выключено, достаточно правильного названия ноты',
    setAutoPlay: 'Проигрывать ноту после ответа',
    setAutoPlayDesc: 'Услышишь, как звучит нота',
    setAutoListen: 'Слушать автоматически',
    setAutoListenDesc: 'В режиме «Сыграй ноту» микрофон включается сам для каждой ноты',
    foot: 'Ноты: C D E F G A H  •  H — это си (англ. B), B — это си-бемоль (Bb)',

    back: 'Назад',
    playNote: 'Проиграть ноту',
    toggleTheme: 'Переключить режим',
    staffAria: 'Нота на нотном стане',

    statCorrect: 'Верно',
    statStreak: 'Серия',
    statTotal: 'Всего',
    clefTagTreble: 'скрипичный ключ',
    clefTagBass: 'басовый ключ',

    promptMode1: 'Какая это нота?',
    promptMode2: 'Введи название ноты и октаву',
    promptMode3: 'Сыграй эту ноту на пианино',

    clear: 'Стереть',
    check: 'Проверить',
    next: 'Дальше ›',

    micHint: 'Нажми «Слушать» и сыграй ноту',
    micAllow: 'Разреши, пожалуйста, микрофон…',
    micListen: '🎤 Слушать',
    micStop: '⏸ Стоп',
    micListening: 'Слушаю… сыграй ноту 🎧',
    micStopped: 'Остановлено',
    micUnavailable: 'Микрофон здесь недоступен 😕',
    micError: (name) => `Не получилось включить микрофон (${name})`,

    praise: ['Супер! 🎉', 'Отлично! ⭐', 'Верно! 🌟', 'Браво! 🎶', 'Класс! 💜', 'Ура! 🎈'],
    correctIs: (label) => `Это ${label}`,
    almostCorrect: (label) => `Почти! Правильно — ${label}`,

    results: 'Результаты',
    resultsDesc: 'Обзор твоих занятий',
    statAccuracy: 'Точность',
    statAnswered: 'Ответов',
    statBest: 'Лучшая серия',
    statDays: 'Дней занятий',
    perNoteTitle: 'По нотам',
    perModeTitle: 'По упражнениям',
    noData: 'Пока нет данных — начни играть! 🎹',
    reset: 'Сбросить результаты',
    resetConfirm: 'Точно сбросить?',

    sessionLabel: 'Сколько нот',
    endless: 'Свободно',
    notesUnit: 'нот',
    perNoteTime: 'Время на ноту',
    off: 'Выкл.',
    seeResults: 'Итоги ›',
    sessionDone: 'Готово! 🎉',
    playAgain: 'Играть снова',
    home: 'Домой',
    timeUp: (label) => `Время вышло! Правильно — ${label}`,
  },
};

export const LANG_NAMES: Record<Lang, string> = {
  cs: 'Čeština',
  ru: 'Русский',
};

export const LangContext = createContext<Dict>(translations.cs);
export const useT = (): Dict => useContext(LangContext);
