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

export function list<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    data: items,
    message,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  } as ApiResponse<T[]>);
}
