import { TRenderRef } from '../core/types';

export function getHtmlTemplate(
  render?: TRenderRef
): string | ((props: Record<string, unknown>) => string) | null {
  if (!render) {
    return null;
  }
  if (render.kind === 'html') {
    return render.template;
  }
  return null;
}
export function getComponentInfo(render?: TRenderRef): {
  name?: string; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any;
  props?: Record<string, unknown>;
} | null {
  if (!render) {
    return null;
  }
  if (render.kind === 'component') {
    return {
      name: render.name,
      component: render.component,
      props: render.props,
    };
  }
  return null;
}
export function isVueComponent(render?: TRenderRef): boolean {
  return render?.kind === 'component' && render.framework === 'vue';
}

/** Проверяет, что значение похоже на Vue-компонент (не пустой объект после JSON/deepClone). */
export function isRenderableVueComponent(component: unknown): boolean {
  if (!component) {
    return false;
  }

  if (typeof component === 'function') {
    return true;
  }

  if (typeof component !== 'object') {
    return false;
  }

  const candidate = component as Record<string, unknown>;

  return (
    typeof candidate.setup === 'function' ||
    typeof candidate.render === 'function' ||
    candidate.__vccOpts !== undefined ||
    typeof candidate.__hmrId === 'string'
  );
}
export function isReactComponent(render?: TRenderRef): boolean {
  return render?.kind === 'component' && render.framework === 'react';
}

/** Проверяет, что значение похоже на React-компонент (не пустой объект после JSON/deepClone). */
export function isRenderableReactComponent(component: unknown): boolean {
  if (!component) {
    return false;
  }

  if (typeof component === 'function') {
    return true;
  }

  if (typeof component !== 'object') {
    return false;
  }

  const candidate = component as Record<string, unknown>;

  return (
    typeof candidate.$$typeof === 'symbol' ||
    typeof candidate.type === 'function' ||
    typeof candidate.render === 'function'
  );
}

export function isRenderableComponent(
  component: unknown,
  framework: 'vue' | 'react'
): boolean {
  return framework === 'react'
    ? isRenderableReactComponent(component)
    : isRenderableVueComponent(component);
}
export function isHtmlTemplate(render?: TRenderRef): boolean {
  return render?.kind === 'html';
}
export function isExternalAdapter(render?: TRenderRef): boolean {
  return render?.kind === 'external';
}
export function isCustomRender(render?: TRenderRef): boolean {
  return render?.kind === 'custom';
}
export function getFramework(render?: TRenderRef): string | null {
  if (render?.kind === 'component') {
    return render.framework;
  }
  return null;
}
export function getAdapter(render?: TRenderRef): string | null {
  if (render?.kind === 'external') {
    return render.adapter;
  }
  return null;
}
export function getCustomMount(
  render?: TRenderRef
): ((container: HTMLElement, props: Record<string, unknown>) => void) | null {
  if (render?.kind === 'custom') {
    return render.mount;
  }
  return null;
}
export function getCustomUnmount(render?: TRenderRef): ((container: HTMLElement) => void) | null {
  if (render?.kind === 'custom') {
    return render.unmount || null;
  }
  return null;
}
