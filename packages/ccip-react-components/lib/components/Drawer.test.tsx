import { act, render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Drawer } from './Drawer';
import { createRef } from 'react';
import { TDrawer } from '@/types';

describe('Drawer', () => {
  test('should toggle the dialog', () => {
    const ref = createRef<TDrawer>();
    render(<Drawer ref={ref} />);
    const open = vi.spyOn(ref.current, 'openDrawer' as never);
    const close = vi.spyOn(ref.current, 'closeDrawer' as never);
    const toggle = vi.spyOn(ref.current, 'toggleDrawer' as never);
    act(() => {
      ref.current?.openDrawer();
      ref.current?.closeDrawer();
      ref.current?.toggleDrawer();
    });
    expect(open).toBeCalled();
    expect(close).toBeCalled();
    expect(toggle).toBeCalled();
  });
});
