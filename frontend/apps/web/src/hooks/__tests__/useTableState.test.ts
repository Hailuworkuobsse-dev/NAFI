import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTableState } from '../useTableState';

describe('useTableState', () => {
  it('initializes with defaults', () => {
    const { result } = renderHook(() => useTableState());
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.q).toBe('');
  });

  it('updates page', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
  });

  it('resets page to 1 when search changes', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(5));
    act(() => result.current.setSearch('sesame'));
    expect(result.current.page).toBe(1);
    expect(result.current.q).toBe('sesame');
  });

  it('resets all state', () => {
    const { result } = renderHook(() => useTableState());
    act(() => {
      result.current.setPage(5);
      result.current.setSearch('x');
    });
    act(() => result.current.reset());
    expect(result.current.page).toBe(1);
    expect(result.current.q).toBe('');
  });
});
