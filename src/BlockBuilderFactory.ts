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

export class BlockBuilderFactory {
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
    const repository = options?.repository || new MemoryBlockRepositoryImpl();

    const componentRegistry = options?.componentRegistry || new MemoryComponentRegistry();

    const customFieldRendererRegistry =
      options?.customFieldRendererRegistry || new CustomFieldRendererRegistry();

    const httpClient = options?.httpClient || new FetchHttpClient();

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
