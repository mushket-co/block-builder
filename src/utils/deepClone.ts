/**
 * Создает глубокую копию объекта
 * Поддерживает Date, Array, обычные объекты
 */
export function deepClone<T>(obj: T): T {
  // Примитивные типы и null
  if (obj === null || typeof obj !== 'object') {
  return obj;
  }

  // Date
  if (obj instanceof Date) {
  return new Date(obj.getTime()) as unknown as T;
  }

  // Array
  if (Array.isArray(obj)) {
  return obj.map(item => deepClone(item)) as unknown as T;
  }

  // Object
  const clonedObj = {} as T;
  for (const key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    clonedObj[key] = deepClone(obj[key]);
  }
  }

  return clonedObj;
}

