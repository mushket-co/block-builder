export type TBlockId = string;
export type TComponent = any;
export type TRenderRef =
  | {
    kind: 'html';
    template: string | ((props: Record<string, any>) => string);
  }
  | {
    kind: 'component';
    framework: 'vue' | 'react' | string;
    name?: string;
    component?: any;
    props?: Record<string, any>;
  }
  | {
    kind: 'external';
    adapter: string;
    payload: Record<string, any>;
  }
  | {
    kind: 'custom';
    mount: (container: HTMLElement, props: Record<string, any>) => void;
    unmount?: (container: HTMLElement) => void;
  };
export interface IFormData {
  [key: string]: any;
}
