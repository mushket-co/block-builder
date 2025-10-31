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
import { LocalStorageBlockRepositoryImpl } from './infrastructure/repositories/LocalStorageBlockRepositoryImpl';

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
      storageType?: 'memory' | 'localStorage';
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
    const repository =
      options?.repository ||
      (options?.storageType === 'localStorage'
        ? new LocalStorageBlockRepositoryImpl()
        : new MemoryBlockRepositoryImpl());

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
