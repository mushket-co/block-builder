import { TRenderRef } from '../core/types';

/**
 * Утилиты для работы с render-описанием блоков
 */

/**
 * Извлекает HTML template из render-описания
 */
export function getHtmlTemplate(render?: TRenderRef): string | ((props: Record<string, any>) => string) | null {
  if (!render) return null;

  if (render.kind === 'html') {
  return render.template;
  }

  return null;
}

/**
 * Извлекает информацию о компоненте из render-описания
 */
export function getComponentInfo(render?: TRenderRef): { name?: string; component?: any; props?: Record<string, any> } | null {
  if (!render) return null;

  if (render.kind === 'component') {
  return {
    name: render.name,
    component: render.component,
    props: render.props
  };
  }

  return null;
}

/**
 * Проверяет, является ли render Vue компонентом
 */
export function isVueComponent(render?: TRenderRef): boolean {
  return render?.kind === 'component' && render.framework === 'vue';
}

/**
 * Проверяет, является ли render React компонентом
 */
export function isReactComponent(render?: TRenderRef): boolean {
  return render?.kind === 'component' && render.framework === 'react';
}

/**
 * Проверяет, является ли render HTML template
 */
export function isHtmlTemplate(render?: TRenderRef): boolean {
  return render?.kind === 'html';
}

/**
 * Проверяет, является ли render внешним адаптером
 */
export function isExternalAdapter(render?: TRenderRef): boolean {
  return render?.kind === 'external';
}

/**
 * Проверяет, является ли render кастомным (с функцией mount)
 */
export function isCustomRender(render?: TRenderRef): boolean {
  return render?.kind === 'custom';
}

/**
 * Получает framework из render-описания
 */
export function getFramework(render?: TRenderRef): string | null {
  if (render?.kind === 'component') {
  return render.framework;
  }
  return null;
}

/**
 * Получает адаптер из render-описания
 */
export function getAdapter(render?: TRenderRef): string | null {
  if (render?.kind === 'external') {
  return render.adapter;
  }
  return null;
}

/**
 * Получает функцию mount из custom render-описания
 */
export function getCustomMount(render?: TRenderRef): ((container: HTMLElement, props: Record<string, any>) => void) | null {
  if (render?.kind === 'custom') {
  return render.mount;
  }
  return null;
}

/**
 * Получает функцию unmount из custom render-описания
 */
export function getCustomUnmount(render?: TRenderRef): ((container: HTMLElement) => void) | null {
  if (render?.kind === 'custom') {
  return render.unmount || null;
  }
  return null;
}
