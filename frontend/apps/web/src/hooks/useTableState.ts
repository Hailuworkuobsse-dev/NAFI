import { useCallback, useMemo, useState } from 'react';

import type { PageParams } from '@/api/types/common';

export interface TableState extends PageParams {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (q: string) => void;
  setSort: (field: string, dir: 'asc' | 'desc') => void;
  reset: () => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function useTableState(initial?: Partial<PageParams>): TableState {
  const [state, setState] = useState<
    Required<Pick<PageParams, 'page' | 'pageSize'>> & PageParams
  >({
    page: initial?.page ?? 1,
    pageSize: initial?.pageSize ?? DEFAULT_PAGE_SIZE,
    q: initial?.q ?? '',
    sortBy: initial?.sortBy,
    sortDir: initial?.sortDir ?? 'asc',
  });

  const setPage = useCallback((page: number) => {
    setState((s) => ({ ...s, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState((s) => ({ ...s, pageSize, page: 1 }));
  }, []);

  const setSearch = useCallback((q: string) => {
    setState((s) => ({ ...s, q, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    setState((s) => ({ ...s, sortBy, sortDir, page: 1 }));
  }, []);

  const reset = useCallback(() => {
    setState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, q: '', sortDir: 'asc' });
  }, []);

  return useMemo(
    () => ({ ...state, setPage, setPageSize, setSearch, setSort, reset }),
    [state, setPage, setPageSize, setSearch, setSort, reset],
  );
}
