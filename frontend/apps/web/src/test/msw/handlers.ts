import { http, HttpResponse } from 'msw';

import type { ContractSummary } from '@/api/types/contract';
import type { PublicOpportunity } from '@/api/types/opportunity';

const API = '/api/v1';

export const mockContract: ContractSummary = {
  id: 'contract-1',
  targetCrop: 'Sesame',
  region: 'Amhara',
  regionCode: 'ET-AM',
  farmerId: 'farmer-1',
  farmerName: 'Abebe Bekele',
  totalTargetYieldKg: '500000.00',
  guaranteedFloorPriceEtb: '45.50',
  contractValueEtb: '22750000.00',
  committedAmountEtb: '12500000.00',
  status: 'ACTIVE',
  maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockOpportunity: PublicOpportunity = {
  id: 'opp-1',
  targetCrop: 'Sesame',
  region: 'Amhara',
  regionCode: 'ET-AM',
  targetAmountEtb: '5000000.00',
  committedAmountEtb: '2500000.00',
  investorCount: 12,
  targetYieldKg: '500000.00',
  floorPriceEtb: '45.50',
  maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  fundedPercent: 0.5,
};

export const handlers = [
  http.get(`${API}/contracts`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [mockContract], page: 1, pageSize: 20, total: 1 },
    }),
  ),
  http.get(`${API}/contracts/:id`, () =>
    HttpResponse.json({ success: true, data: mockContract }),
  ),
  http.post(`${API}/contracts`, () =>
    HttpResponse.json({ success: true, data: mockContract }, { status: 201 }),
  ),
  http.get(`${API}/opportunities`, () =>
    HttpResponse.json({ success: true, data: [mockOpportunity] }),
  ),
  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({
      success: true,
      data: {
        id: 'user-1',
        nafiId: 'NAFI-ABC12345',
        email: 'farmer@nafi.et',
        fullName: 'Abebe Bekele',
        role: 'COMMERCIAL_FARMER',
        permissions: ['contract:create', 'contract:read:own'],
        locale: 'en',
        mfaEnabled: false,
      },
    }),
  ),
  http.post(`${API}/inputs/:id/verify`, () =>
    HttpResponse.json({ success: true, data: { verified: true } }),
  ),
];

export const errorHandlers = {
  forbidden: [
    http.get(`${API}/contracts`, () =>
      HttpResponse.json(
        { success: false, error: { code: 'forbidden', message: 'Access denied', requestId: 'r1' } },
        { status: 403 },
      ),
    ),
  ],
  serverError: [
    http.get(`${API}/contracts`, () =>
      HttpResponse.json(
        { success: false, error: { code: 'internal', message: 'Server error', requestId: 'r2' } },
        { status: 500 },
      ),
    ),
  ],
};
