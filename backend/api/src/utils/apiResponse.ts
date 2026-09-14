import type { Response } from 'express';

export interface SuccessMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  requestId?: string;
}

export function ok<T>(res: Response, data: T, meta?: SuccessMeta): void {
  res.status(200).json({
    success: true,
    data,
    meta: meta ? { ...meta, requestId: res.locals.requestId } : undefined,
  });
}

export function created<T>(res: Response, data: T): void {
  res.status(201).json({
    success: true,
    data,
    meta: { requestId: res.locals.requestId },
  });
}

export function noContent(res: Response): void {
  res.status(204).send();
}

export function list<T>(
  res: Response,
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): void {
  res.status(200).json({
    success: true,
    data: { items, page, pageSize, total },
    meta: { page, pageSize, total, requestId: res.locals.requestId },
  });
}
