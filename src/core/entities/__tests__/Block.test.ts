import { BlockEntity } from '../Block';
import { IBlock, IBlockSettings, IBlockProps, IBlockStyle, TBlockId } from '../../types';

describe('BlockEntity', () => {
  let mockBlock: IBlock;

  beforeEach(() => {
  mockBlock = {
    id: 'test-block-1',
    type: 'TestBlock',
    settings: { settingKey: 'settingValue' },
    props: { propKey: 'propValue' },
    style: { color: 'red', fontSize: 14 },
    visible: true,
    locked: false,
    children: [],
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      version: 1
    }
  };
  });

  describe('Геттеры', () => {
  test('должен возвращать id блока', () => {
    const entity = new BlockEntity(mockBlock);
    expect(entity.id).toBe('test-block-1');
  });

  test('должен возвращать type блока', () => {
    const entity = new BlockEntity(mockBlock);
    expect(entity.type).toBe('TestBlock');
  });

  test('должен возвращать копию settings', () => {
    const entity = new BlockEntity(mockBlock);
    const settings = entity.settings;
    
    expect(settings).toEqual({ settingKey: 'settingValue' });
    // Проверяем что это копия
    settings.newKey = 'newValue';
    expect(entity.settings).not.toHaveProperty('newKey');
  });

  test('должен возвращать копию props', () => {
    const entity = new BlockEntity(mockBlock);
    const props = entity.props;
    
    expect(props).toEqual({ propKey: 'propValue' });
    // Проверяем что это копия
    props.newKey = 'newValue';
    expect(entity.props).not.toHaveProperty('newKey');
  });

  test('должен возвращать копию style', () => {
    const entity = new BlockEntity(mockBlock);
    const style = entity.style;
    
    expect(style).toEqual({ color: 'red', fontSize: 14 });
    // Проверяем что это копия
    if (style) {
      style.backgroundColor = 'blue';
      expect(entity.style).not.toHaveProperty('backgroundColor');
    }
  });

  test('должен возвращать undefined для style если его нет', () => {
    const blockWithoutStyle = { ...mockBlock, style: undefined };
    const entity = new BlockEntity(blockWithoutStyle);
    
    expect(entity.style).toBeUndefined();
  });

  test('должен возвращать копию children', () => {
    const childBlock: IBlock = {
      id: 'child-1',
      type: 'ChildBlock',
      settings: {},
      props: {}
    };
    
    const blockWithChildren = { ...mockBlock, children: [childBlock] };
    const entity = new BlockEntity(blockWithChildren);
    const children = entity.children;
    
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe('child-1');
    
    // Проверяем что это копия
    children.push({ id: 'new-child', type: 'New', settings: {}, props: {} });
    expect(entity.children).toHaveLength(1);
  });

  test('должен возвращать пустой массив для children если их нет', () => {
    const blockWithoutChildren = { ...mockBlock, children: undefined };
    const entity = new BlockEntity(blockWithoutChildren);
    
    expect(entity.children).toEqual([]);
  });

  test('должен возвращать parent id', () => {
    const blockWithParent = { ...mockBlock, parent: 'parent-id' };
    const entity = new BlockEntity(blockWithParent);
    
    expect(entity.parent).toBe('parent-id');
  });

  test('должен возвращать true для visible по умолчанию', () => {
    const blockWithoutVisible = { ...mockBlock, visible: undefined };
    const entity = new BlockEntity(blockWithoutVisible);
    
    expect(entity.visible).toBe(true);
  });

  test('должен возвращать false для locked по умолчанию', () => {
    const blockWithoutLocked = { ...mockBlock, locked: undefined };
    const entity = new BlockEntity(blockWithoutLocked);
    
    expect(entity.locked).toBe(false);
  });

  test('должен возвращать metadata', () => {
    const entity = new BlockEntity(mockBlock);
    
    expect(entity.metadata).toEqual({
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      version: 1
    });
  });

  test('должен возвращать render', () => {
    const renderConfig = { kind: 'html' as const, template: '<div>Test</div>' };
    const blockWithRender = { ...mockBlock, render: renderConfig };
    const entity = new BlockEntity(blockWithRender);
    
    expect(entity.render).toEqual(renderConfig);
  });

  test('должен возвращать formConfig', () => {
    const formConfig = { fields: [] };
    const blockWithForm = { ...mockBlock, formConfig };
    const entity = new BlockEntity(blockWithForm);
    
    expect(entity.formConfig).toEqual(formConfig);
  });
  });

  describe('updateSettings', () => {
  test('должен обновлять настройки блока', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.updateSettings({ newSetting: 'newValue' });
    
    expect(entity.settings).toEqual({
      settingKey: 'settingValue',
      newSetting: 'newValue'
    });
  });

  test('должен перезаписывать существующие настройки', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.updateSettings({ settingKey: 'updatedValue' });
    
    expect(entity.settings).toEqual({
      settingKey: 'updatedValue'
    });
  });

  test('должен обновлять metadata при изменении', async () => {
    const entity = new BlockEntity(mockBlock);
    const originalVersion = entity.metadata?.version;
    const originalUpdatedAt = mockBlock.metadata?.updatedAt;
    
    // Ждем немного чтобы время точно изменилось
    await new Promise(resolve => setTimeout(resolve, 10));
    
    entity.updateSettings({ newSetting: 'value' });
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
    
    // Проверяем что время обновилось
    if (originalUpdatedAt && entity.metadata?.updatedAt) {
      expect(entity.metadata.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    }
  });
  });

  describe('updateProps', () => {
  test('должен обновлять свойства блока', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.updateProps({ newProp: 'newValue' });
    
    expect(entity.props).toEqual({
      propKey: 'propValue',
      newProp: 'newValue'
    });
  });

  test('должен перезаписывать существующие свойства', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.updateProps({ propKey: 'updatedValue' });
    
    expect(entity.props).toEqual({
      propKey: 'updatedValue'
    });
  });

  test('должен обновлять metadata при изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const originalVersion = entity.metadata?.version;
    
    entity.updateProps({ newProp: 'value' });
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
  });
  });

  describe('updateStyle', () => {
  test('должен обновлять стили блока', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.updateStyle({ backgroundColor: 'blue' });
    
    expect(entity.style).toEqual({
      color: 'red',
      fontSize: 14,
      backgroundColor: 'blue'
    });
  });

  test('должен перезаписывать существующие стили', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.updateStyle({ color: 'green' });
    
    expect(entity.style).toEqual({
      color: 'green',
      fontSize: 14
    });
  });

  test('должен обновлять metadata при изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const originalVersion = entity.metadata?.version;
    
    entity.updateStyle({ margin: '10px' });
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
  });
  });

  describe('updateFormConfig', () => {
  test('должен обновлять конфигурацию формы', () => {
    const entity = new BlockEntity(mockBlock);
    const formConfig = { fields: [{ name: 'test', type: 'text' }] };
    
    entity.updateFormConfig(formConfig);
    
    expect(entity.formConfig).toEqual(formConfig);
  });

  test('должен обновлять metadata при изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const originalVersion = entity.metadata?.version;
    
    entity.updateFormConfig({ fields: [] });
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
  });
  });

  describe('setLocked', () => {
  test('должен блокировать блок', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.setLocked(true);
    
    expect(entity.locked).toBe(true);
  });

  test('должен разблокировать блок', () => {
    const lockedBlock = { ...mockBlock, locked: true };
    const entity = new BlockEntity(lockedBlock);
    
    entity.setLocked(false);
    
    expect(entity.locked).toBe(false);
  });

  test('должен обновлять metadata при изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const originalVersion = entity.metadata?.version;
    
    entity.setLocked(true);
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
  });
  });

  describe('setVisible', () => {
  test('должен скрывать блок', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.setVisible(false);
    
    expect(entity.visible).toBe(false);
  });

  test('должен показывать блок', () => {
    const hiddenBlock = { ...mockBlock, visible: false };
    const entity = new BlockEntity(hiddenBlock);
    
    entity.setVisible(true);
    
    expect(entity.visible).toBe(true);
  });

  test('должен обновлять metadata при изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const originalVersion = entity.metadata?.version;
    
    entity.setVisible(false);
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
  });
  });

  describe('addChild', () => {
  test('должен добавлять дочерний блок', () => {
    const entity = new BlockEntity(mockBlock);
    const childBlock: IBlock = {
      id: 'child-1',
      type: 'ChildBlock',
      settings: {},
      props: {}
    };
    
    entity.addChild(childBlock);
    
    expect(entity.children).toHaveLength(1);
    expect(entity.children[0].id).toBe('child-1');
  });

  test('должен инициализировать массив children если его нет', () => {
    const blockWithoutChildren = { ...mockBlock, children: undefined };
    const entity = new BlockEntity(blockWithoutChildren);
    const childBlock: IBlock = {
      id: 'child-1',
      type: 'ChildBlock',
      settings: {},
      props: {}
    };
    
    entity.addChild(childBlock);
    
    expect(entity.children).toHaveLength(1);
  });

  test('должен добавлять несколько дочерних блоков', () => {
    const entity = new BlockEntity(mockBlock);
    const child1: IBlock = { id: 'child-1', type: 'Child', settings: {}, props: {} };
    const child2: IBlock = { id: 'child-2', type: 'Child', settings: {}, props: {} };
    
    entity.addChild(child1);
    entity.addChild(child2);
    
    expect(entity.children).toHaveLength(2);
  });

  test('должен обновлять metadata при изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const originalVersion = entity.metadata?.version;
    
    entity.addChild({ id: 'child', type: 'Child', settings: {}, props: {} });
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
  });
  });

  describe('removeChild', () => {
  test('должен удалять дочерний блок', () => {
    const childBlock: IBlock = {
      id: 'child-1',
      type: 'ChildBlock',
      settings: {},
      props: {}
    };
    const blockWithChild = { ...mockBlock, children: [childBlock] };
    const entity = new BlockEntity(blockWithChild);
    
    const result = entity.removeChild('child-1');
    
    expect(result).toBe(true);
    expect(entity.children).toHaveLength(0);
  });

  test('должен возвращать false если блок не найден', () => {
    const entity = new BlockEntity(mockBlock);
    
    const result = entity.removeChild('non-existent-id');
    
    expect(result).toBe(false);
  });

  test('должен возвращать false если нет дочерних блоков', () => {
    const blockWithoutChildren = { ...mockBlock, children: undefined };
    const entity = new BlockEntity(blockWithoutChildren);
    
    const result = entity.removeChild('any-id');
    
    expect(result).toBe(false);
  });

  test('должен удалять правильный блок из нескольких', () => {
    const child1: IBlock = { id: 'child-1', type: 'Child', settings: {}, props: {} };
    const child2: IBlock = { id: 'child-2', type: 'Child', settings: {}, props: {} };
    const child3: IBlock = { id: 'child-3', type: 'Child', settings: {}, props: {} };
    const blockWithChildren = { ...mockBlock, children: [child1, child2, child3] };
    const entity = new BlockEntity(blockWithChildren);
    
    entity.removeChild('child-2');
    
    expect(entity.children).toHaveLength(2);
    expect(entity.children[0].id).toBe('child-1');
    expect(entity.children[1].id).toBe('child-3');
  });

  test('должен обновлять metadata при удалении', () => {
    const childBlock: IBlock = { id: 'child-1', type: 'Child', settings: {}, props: {} };
    const blockWithChild = { ...mockBlock, children: [childBlock] };
    const entity = new BlockEntity(blockWithChild);
    const originalVersion = entity.metadata?.version;
    
    entity.removeChild('child-1');
    
    expect(entity.metadata?.version).toBe((originalVersion || 0) + 1);
  });
  });

  describe('hasChild', () => {
  test('должен возвращать true если дочерний блок существует', () => {
    const childBlock: IBlock = {
      id: 'child-1',
      type: 'ChildBlock',
      settings: {},
      props: {}
    };
    const blockWithChild = { ...mockBlock, children: [childBlock] };
    const entity = new BlockEntity(blockWithChild);
    
    expect(entity.hasChild('child-1')).toBe(true);
  });

  test('должен возвращать false если дочерний блок не существует', () => {
    const entity = new BlockEntity(mockBlock);
    
    expect(entity.hasChild('non-existent-id')).toBe(false);
  });

  test('должен возвращать false если нет дочерних блоков', () => {
    const blockWithoutChildren = { ...mockBlock, children: undefined };
    const entity = new BlockEntity(blockWithoutChildren);
    
    expect(entity.hasChild('any-id')).toBe(false);
  });
  });

  describe('canEdit', () => {
  test('должен возвращать true если блок не заблокирован и видимый', () => {
    const entity = new BlockEntity(mockBlock);
    
    expect(entity.canEdit()).toBe(true);
  });

  test('должен возвращать false если блок заблокирован', () => {
    const lockedBlock = { ...mockBlock, locked: true };
    const entity = new BlockEntity(lockedBlock);
    
    expect(entity.canEdit()).toBe(false);
  });

  test('должен возвращать false если блок скрыт', () => {
    const hiddenBlock = { ...mockBlock, visible: false };
    const entity = new BlockEntity(hiddenBlock);
    
    expect(entity.canEdit()).toBe(false);
  });

  test('должен возвращать false если блок заблокирован и скрыт', () => {
    const lockedAndHiddenBlock = { ...mockBlock, locked: true, visible: false };
    const entity = new BlockEntity(lockedAndHiddenBlock);
    
    expect(entity.canEdit()).toBe(false);
  });
  });

  describe('canDelete', () => {
  test('должен возвращать true если блок не заблокирован', () => {
    const entity = new BlockEntity(mockBlock);
    
    expect(entity.canDelete()).toBe(true);
  });

  test('должен возвращать false если блок заблокирован', () => {
    const lockedBlock = { ...mockBlock, locked: true };
    const entity = new BlockEntity(lockedBlock);
    
    expect(entity.canDelete()).toBe(false);
  });

  test('должен возвращать true для скрытого но не заблокированного блока', () => {
    const hiddenBlock = { ...mockBlock, visible: false };
    const entity = new BlockEntity(hiddenBlock);
    
    expect(entity.canDelete()).toBe(true);
  });
  });

  describe('clone', () => {
  test('должен клонировать блок с новым ID', () => {
    const entity = new BlockEntity(mockBlock);
    
    const cloned = entity.clone('cloned-id');
    
    expect(cloned.id).toBe('cloned-id');
    expect(cloned.type).toBe(entity.type);
    expect(cloned.settings).toEqual(entity.settings);
    expect(cloned.props).toEqual(entity.props);
  });

  test('должен клонировать дочерние блоки', () => {
    const childBlock: IBlock = {
      id: 'child-1',
      type: 'ChildBlock',
      settings: {},
      props: {}
    };
    const blockWithChild = { ...mockBlock, children: [childBlock] };
    const entity = new BlockEntity(blockWithChild);
    
    const cloned = entity.clone('cloned-id');
    
    expect(cloned.children).toHaveLength(1);
    expect(cloned.children[0].id).toBe('child-1');
  });

  test('должен сбрасывать metadata для клона', () => {
    const entity = new BlockEntity(mockBlock);
    
    const cloned = entity.clone('cloned-id');
    
    expect(cloned.metadata?.version).toBe(1);
    expect(cloned.metadata?.createdAt).not.toEqual(mockBlock.metadata?.createdAt);
    expect(cloned.metadata?.updatedAt).not.toEqual(mockBlock.metadata?.updatedAt);
  });

  test('не должен влиять на оригинальный блок', () => {
    const entity = new BlockEntity(mockBlock);
    const originalId = entity.id;
    
    const cloned = entity.clone('cloned-id');
    cloned.updateSettings({ newSetting: 'value' });
    
    expect(entity.id).toBe(originalId);
    expect(entity.settings).not.toHaveProperty('newSetting');
  });
  });

  describe('toJSON', () => {
  test('должен возвращать сериализованный блок', () => {
    const entity = new BlockEntity(mockBlock);
    
    const json = entity.toJSON();
    
    expect(json).toEqual(mockBlock);
  });

  test('должен возвращать копию блока', () => {
    const entity = new BlockEntity(mockBlock);
    
    const json = entity.toJSON();
    json.settings.newKey = 'newValue';
    
    expect(entity.settings).not.toHaveProperty('newKey');
  });

  test('должен включать все изменения', () => {
    const entity = new BlockEntity(mockBlock);
    
    entity.updateSettings({ newSetting: 'value' });
    entity.updateProps({ newProp: 'value' });
    entity.setLocked(true);
    
    const json = entity.toJSON();
    
    expect(json.settings).toHaveProperty('newSetting');
    expect(json.props).toHaveProperty('newProp');
    expect(json.locked).toBe(true);
  });
  });

  describe('Обновление metadata', () => {
  test('должен создавать metadata если его нет', () => {
    const blockWithoutMetadata = { ...mockBlock, metadata: undefined };
    const entity = new BlockEntity(blockWithoutMetadata);
    
    entity.updateSettings({ key: 'value' });
    
    expect(entity.metadata).toBeDefined();
    expect(entity.metadata?.version).toBe(1);
    expect(entity.metadata?.createdAt).toBeInstanceOf(Date);
    expect(entity.metadata?.updatedAt).toBeInstanceOf(Date);
  });

  test('должен инкрементировать version при каждом изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const initialVersion = entity.metadata?.version || 0;
    
    entity.updateSettings({ key: 'value' });
    expect(entity.metadata?.version).toBe(initialVersion + 1);
    
    entity.updateProps({ key: 'value' });
    expect(entity.metadata?.version).toBe(initialVersion + 2);
    
    entity.updateStyle({ color: 'blue' });
    expect(entity.metadata?.version).toBe(initialVersion + 3);
  });

  test('должен обновлять updatedAt при изменении', () => {
    const entity = new BlockEntity(mockBlock);
    const originalUpdatedAt = entity.metadata?.updatedAt;
    
    // Добавляем небольшую задержку чтобы время точно изменилось
    setTimeout(() => {
      entity.updateSettings({ key: 'value' });
      expect(entity.metadata?.updatedAt).not.toEqual(originalUpdatedAt);
    }, 10);
  });
  });
});

