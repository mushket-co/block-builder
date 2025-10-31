/**
 * Helper функция для упрощенной инициализации BlockManagementUseCase
 * Инкапсулирует создание репозитория и реестра компонентов
 * 
 * Repository хранит блоки только в памяти - для работы во время сессии
 * Сохранение и загрузка блоков - полностью под вашим контролем через onSave callback
 * 
 * ✅ ЧИСТАЯ АРХИТЕКТУРА: Использует BlockBuilderFactory для создания зависимостей
 */

import { BlockManagementUseCase } from '../core/use-cases/BlockManagementUseCase';
import { BlockBuilderFactory } from '../BlockBuilderFactory';
import { IBlockRepository } from '../core/ports/BlockRepository';
import { IComponentRegistry } from '../core/ports/ComponentRegistry';

export interface ICreateBlockManagementUseCaseOptions {
  repository?: IBlockRepository;        // Опционально: кастомный репозиторий
  componentRegistry?: IComponentRegistry; // Опционально: кастомный реестр
}

/**
 * Создает готовый BlockManagementUseCase с настройками по умолчанию
 * 
 * @param options - Опции инициализации
 * @returns Готовый use-case для работы с блоками
 * 
 * @example
 * ```javascript
 * import { createBlockManagementUseCase } from 'block-builder/vue'
 * 
 * const useCase = createBlockManagementUseCase({
 *   componentRegistry: myCustomRegistry
 * })
 * ```
 */
export function createBlockManagementUseCase(
  options: ICreateBlockManagementUseCaseOptions = {}
): BlockManagementUseCase {
  // ✅ ЧИСТАЯ АРХИТЕКТУРА: Используем Factory для создания зависимостей
  // Это обеспечивает соблюдение Dependency Inversion Principle
  const dependencies = BlockBuilderFactory.createDependencies({
    repository: options.repository,
    componentRegistry: options.componentRegistry,
  });

  return dependencies.useCase;
}
