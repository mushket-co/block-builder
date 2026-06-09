import { afterEach, describe, expect, it } from '@jest/globals';

import {
  getCurrentBreakpoint,
  getDefaultBreakpoint,
  getBlockInlineStyles,
} from '../../src/utils/breakpointHelpers';
import {
  enableViewportBreakpointDetection,
  resetViewportBreakpointDetection,
} from '../../src/utils/ssr';

describe('breakpointHelpers SSR', () => {
  afterEach(() => {
    resetViewportBreakpointDetection();
  });

  it('uses default desktop breakpoint on server', () => {
    const breakpoints = [
      { name: 'mobile', label: 'Mobile', maxWidth: 640 },
      { name: 'desktop', label: 'Desktop', maxWidth: undefined },
    ];

    expect(getCurrentBreakpoint(breakpoints).name).toBe('desktop');
    expect(getDefaultBreakpoint(breakpoints).name).toBe('desktop');
  });

  it('returns inline styles without window on server', () => {
    const styles = getBlockInlineStyles(
      {
        desktop: {
          'margin-top': 16,
          'padding-top': 8,
        },
      },
      'spacing',
      [{ name: 'desktop', label: 'Desktop', maxWidth: undefined }]
    );

    expect(styles.marginTop).toBe('16px');
    expect(styles['--spacing-padding-top']).toBe('8px');
  });

  it('uses default breakpoint on client until viewport detection is enabled', () => {
    const breakpoints = [
      { name: 'mobile', label: 'Mobile', maxWidth: 9999 },
      { name: 'desktop', label: 'Desktop', maxWidth: undefined },
    ];

    expect(getCurrentBreakpoint(breakpoints).name).toBe('desktop');

    enableViewportBreakpointDetection();

    expect(getCurrentBreakpoint(breakpoints).name).toBe('mobile');
  });
});
