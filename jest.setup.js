/**
 * Jest Setup File
 * Выполняется перед запуском тестов
 */

// Мокируем глобальные объекты если необходимо
global.console = {
  ...console,
  // Подавляем некоторые логи в тестах
  warn: jest.fn(),
  error: jest.fn(),
};

// Настройка тайм-аутов
jest.setTimeout(10000);

// Очистка после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});

