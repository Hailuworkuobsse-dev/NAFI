import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export function ok<T>(res: Response, data: T, message?: string): Response {
  return res.status(200).json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

export function created<T>(res: Response, data: T, message?: string): Response {
  return res.status(201).json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export interface ListResult<T> {
  items?: T[];
  data?: T[];
  page: number;
  pageSize?: number;
  limit?: number;
  total: number;
}

export function list<T>(
  res: Response,
  result: ListResult<T>,
  message?: string
): Response {
  const items = (result.items ?? result.data ?? []) as T[];
  const total = result.total;
  const page = result.page;
  const limit = result.pageSize ?? result.limit ?? (items.length || 20);
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    data: {
      items,
      page,
      pageSize: limit,
      total,
    },
    message,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  } as ApiResponse<T[]>);
}
