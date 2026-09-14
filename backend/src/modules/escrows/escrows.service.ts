import prisma from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class ${module^}Service {
  async findAll(userId: string, institutionId?: string | null, scope = 'OWN') {
    const modelName = '${module%s}'.slice(0, -1);
    // Placeholder implementation
    return [];
  }

  async findById(id: string) {
    throw ApiError.notFound('Resource not found');
  }

  async create(data: any, userId: string) {
    throw ApiError.internal('Not implemented');
  }

  async update(id: string, data: any) {
    throw ApiError.internal('Not implemented');
  }

  async delete(id: string) {
    throw ApiError.internal('Not implemented');
  }
}

export const ${module}Service = new ${module^}Service();
