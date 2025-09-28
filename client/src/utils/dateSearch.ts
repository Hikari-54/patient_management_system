/**
 * Проверяет, похож ли поисковый запрос на дату
 */
export function isDateLikeSearch(search: string): boolean {
  const searchTrim = search.trim();

  // Проверяем различные паттерны дат
  const datePatterns = [
    /^\d{1,2}$/, // Только день или месяц: 03, 1, 25
    /^\d{4}$/, // Только год: 1986, 2025
    /^\d{1,2}\.\d{1,2}$/, // День и месяц: 03.01, 25.12
    /^\d{1,2}\.\d{4}$/, // Месяц и год: 01.1986, 12.2025
    /^\d{1,2}\.\d{1,2}\.\d{4}$/, // Полная дата: 03.01.1986
  ];

  return datePatterns.some((pattern) => pattern.test(searchTrim));
}

/**
 * Проверяет, соответствует ли дата рождения поисковому запросу
 */
export function matchesDateSearch(dateOfBirth: Date, search: string): boolean {
  try {
    const searchTrim = search.trim();

    const day = dateOfBirth.getDate().toString().padStart(2, '0');
    const month = (dateOfBirth.getMonth() + 1).toString().padStart(2, '0');
    const year = dateOfBirth.getFullYear().toString();

    // Полная дата DD.MM.YYYY
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(searchTrim)) {
      const fullDate = `${day}.${month}.${year}`;
      return fullDate === searchTrim;
    }

    // День и месяц DD.MM
    if (/^\d{1,2}\.\d{1,2}$/.test(searchTrim)) {
      const dayMonth = `${day}.${month}`;
      return dayMonth === searchTrim;
    }

    // Месяц и год MM.YYYY
    if (/^\d{1,2}\.\d{4}$/.test(searchTrim)) {
      const monthYear = `${month}.${year}`;
      return monthYear === searchTrim;
    }

    // Только год YYYY
    if (/^\d{4}$/.test(searchTrim)) {
      return year === searchTrim;
    }

    // Только день или месяц (одна или две цифры)
    if (/^\d{1,2}$/.test(searchTrim)) {
      const searchPadded = searchTrim.padStart(2, '0');
      return day === searchPadded || month === searchPadded;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Форматирует дату в строку DD.MM.YYYY для поиска
 */
export function formatDateForSearch(date: Date): string {
  try {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
}
