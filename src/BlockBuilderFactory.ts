import { IBlockRepository } from './core/ports/BlockRepository';
import { IComponentRegistry } from './core/ports/ComponentRegistry';
import { ICustomFieldRendererRegistry } from './core/ports/CustomFieldRenderer';
import { IHttpClient } from './core/ports/HttpClient';
import { ApiSelectUseCase } from './core/use-cases/ApiSelectUseCase';
import { BlockManagementUseCase } from './core/use-cases/BlockManagementUseCase';
import { FetchHttpClient } from './infrastructure/http/FetchHttpClient';
import { CustomFieldRendererRegistry } from './infrastructure/registries/CustomFieldRendererRegistry';
import { MemoryComponentRegistry } from './infrastructure/registries/MemoryComponentRegistry';
import { MemoryBlockRepositoryImpl } from './infrastructure/repositories/MemoryBlockRepositoryImpl';

export type { IHttpClient, IHttpRequestOptions, IHttpResponse } from './core/ports/HttpClient';
export type { IApiRequestParams } from './core/types/form';
export { ApiSelectUseCase } from './core/use-cases/ApiSelectUseCase';

export interface IBlockBuilderFactoryDependencies {
  repository?: IBlockRepository;
  componentRegistry?: IComponentRegistry;
  httpClient?: IHttpClient;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
}

export const BlockBuilderFactory = {
  createDependencies(options?: {
    repository?: IBlockRepository;
    componentRegistry?: IComponentRegistry;
    httpClient?: IHttpClient;
    customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  }): {
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
  },
};
