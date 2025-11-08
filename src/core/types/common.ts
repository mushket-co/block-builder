export type TBlockId = string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TComponent = any;
export type TRenderRef =
  | {
      kind: 'html';
      template: string | ((props: Record<string, unknown>) => string);
    }
  | {
      kind: 'component';
      framework: 'vue' | 'react' | string;
      name?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component?: any;
      props?: Record<string, unknown>;
    }
  | {
      kind: 'external';
      adapter: string;
      payload: Record<string, unknown>;
    }
  | {
      kind: 'custom';
      mount: (container: HTMLElement, props: Record<string, unknown>) => void;
      unmount?: (container: HTMLElement) => void;
    };
export interface IFormData {
  [key: string]: unknown;
}
