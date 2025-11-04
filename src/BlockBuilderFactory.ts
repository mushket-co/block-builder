/**
 * BlockBuilderFactory
 * Создает и компонирует все зависимости для BlockBuilderFacade
 * Находится вне core/, так как связывает все слои (clean architecture)
 */

import { IBlockRepository } from './core/ports/BlockRepository';
import { IComponentRegistry } from './core/ports/ComponentRegistry';
import { IHttpClient } from './core/ports/HttpClient';
import { ICustomFieldRendererRegistry } from './core/ports/CustomFieldRenderer';
import { MemoryBlockRepositoryImpl } from './infrastructure/repositories/MemoryBlockRepositoryImpl';
import { MemoryComponentRegistry } from './infrastructure/registries/MemoryComponentRegistry';
import { CustomFieldRendererRegistry } from './infrastructure/registries/CustomFieldRendererRegistry';
import { FetchHttpClient } from './infrastructure/http/FetchHttpClient';
import { BlockManagementUseCase } from './core/use-cases/BlockManagementUseCase';
import { ApiSelectUseCase } from './core/use-cases/ApiSelectUseCase';

// Экспортируем ApiSelectUseCase и связанные типы для использования вне пакета
export { ApiSelectUseCase } from './core/use-cases/ApiSelectUseCase';
export type {
  IHttpClient,
  IHttpResponse,
  IHttpRequestOptions
} from './core/ports/HttpClient';
export type { IApiRequestParams } from './core/types/form';

export interface IBlockBuilderFactoryDependencies {
  repository?: IBlockRepository;
  componentRegistry?: IComponentRegistry;
  httpClient?: IHttpClient;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
}

/**
 * Factory для создания зависимостей BlockBuilder
 * Соблюдает Dependency Inversion Principle (SOLID)
 */
export class BlockBuilderFactory {
  /**
   * Создает все зависимости для BlockBuilder
   */
  static createDependencies(
    options?: {
      repository?: IBlockRepository;
      componentRegistry?: IComponentRegistry;
      httpClient?: IHttpClient;
      customFieldRendererRegistry?: ICustomFieldRendererRegistry;
    }
  ): {
    repository: IBlockRepository;
    componentRegistry: IComponentRegistry;
    httpClient: IHttpClient;
    customFieldRendererRegistry: ICustomFieldRendererRegistry;
    useCase: BlockManagementUseCase;
    apiSelectUseCase: ApiSelectUseCase;
  } {
    // 1. Создаем Repository (по умолчанию Memory, если не указан)
    // Репозиторий используется только для работы в памяти во время сессии.
    // Сохранение блоков реализовано через колбэк пользователя onSave.
    const repository = options?.repository || new MemoryBlockRepositoryImpl();

    // 2. Создаем ComponentRegistry (по умолчанию Memory, если не указан)
    const componentRegistry = options?.componentRegistry || new MemoryComponentRegistry();

    // 3. Создаем CustomFieldRendererRegistry (по умолчанию стандартный, если не указан)
    const customFieldRendererRegistry =
      options?.customFieldRendererRegistry || new CustomFieldRendererRegistry();

    // 4. Создаем HttpClient (по умолчанию Fetch, если не указан)
    const httpClient = options?.httpClient || new FetchHttpClient();

    // 5. Создаем Use Cases с инъекцией зависимостей
    const useCase = new BlockManagementUseCase(repository, componentRegistry);
    const apiSelectUseCase = new ApiSelectUseCase(httpClient);

    return {
      repository,
      componentRegistry,
      httpClient,
      customFieldRendererRegistry,
      useCase,
      apiSelectUseCase,
    };
  }
}
