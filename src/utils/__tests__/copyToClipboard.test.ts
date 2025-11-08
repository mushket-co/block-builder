import { copyToClipboard } from '../copyToClipboard';
describe('copyToClipboard', () => {
  let mockClipboard: { writeText: jest.Mock };
  let mockExecCommand: jest.Mock;
  beforeEach(() => {
  mockClipboard = {
    writeText: jest.fn().mockResolvedValue(undefined)
  };
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true
  });
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    writable: true,
    configurable: true
  });
  mockExecCommand = jest.fn().mockReturnValue(true);
  document.execCommand = mockExecCommand;
  });
  afterEach(() => {
  jest.restoreAllMocks();
  });
  describe('Secure context', () => {
  test('должен использовать navigator.clipboard.writeText в secure context', async () => {
    await copyToClipboard('test text');
    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
  });
  test('должен вернуть true при успешном копировании', async () => {
    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
  });
  test('должен скопировать пустую строку', async () => {
    await copyToClipboard('');
    expect(mockClipboard.writeText).toHaveBeenCalledWith('');
  });
  test('должен скопировать многострочный текст', async () => {
    const multiline = 'line1\nline2\nline3';
    await copyToClipboard(multiline);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(multiline);
  });
  test('должен скопировать текст со специальными символами', async () => {
    const special = 'text with "quotes" and \'apostrophes\' and <tags>';
    await copyToClipboard(special);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(special);
  });
  });
  describe('Non-secure context fallback', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      writable: true,
      configurable: true
    });
    document.body.append = jest.fn();
    document.createRange = jest.fn().mockReturnValue({
      selectNode: jest.fn()
    });
    window.getSelection = jest.fn().mockReturnValue({
      removeAllRanges: jest.fn(),
      addRange: jest.fn()
    });
  });
  test('должен использовать fallback метод в non-secure context', async () => {
    await copyToClipboard('test text');
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
    expect(document.createRange).toHaveBeenCalled();
  });
  test('должен вернуть true при успешном fallback копировании', async () => {
    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
  });
  });
  describe('Error handling', () => {
  test('должен вернуть false при ошибке', async () => {
    mockClipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    const result = await copyToClipboard('test text');
    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result).toBe(false);
  });
  test('должен обработать ошибку при отсутствии selection', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      writable: true,
      configurable: true
    });
    const mockDiv = document.createElement('div');
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'div') {
        return mockDiv;
      }
      return originalCreateElement(tag);
    });
    const mockRemove = jest.fn();
    mockDiv.remove = mockRemove;
    window.getSelection = jest.fn().mockReturnValue(null);
    document.createRange = jest.fn().mockReturnValue({
      selectNode: jest.fn()
    });
    document.body.append = jest.fn();
    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
    expect(mockRemove).toHaveBeenCalled();
  });
  });
});