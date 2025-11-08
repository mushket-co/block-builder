import { BlockBuilderFactory } from '../BlockBuilderFactory';
import { IBlockRepository } from '../core/ports/BlockRepository';
import { IComponentRegistry } from '../core/ports/ComponentRegistry';
import { BlockManagementUseCase } from '../core/use-cases/BlockManagementUseCase';

export interface ICreateBlockManagementUseCaseOptions {
  repository?: IBlockRepository;
  componentRegistry?: IComponentRegistry;
}
export function createBlockManagementUseCase(
  options: ICreateBlockManagementUseCaseOptions = {}
): BlockManagementUseCase {
  const dependencies = BlockBuilderFactory.createDependencies({
    repository: options.repository,
    componentRegistry: options.componentRegistry,
  });
  return dependencies.useCase;
}
