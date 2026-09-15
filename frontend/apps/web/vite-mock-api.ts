import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const mockOpportunities = [
  {
    id: 'opp-1',
    targetCrop: 'Sesame (Humera Premium)',
    region: 'Amhara',
    regionCode: 'ET-AM',
    targetAmountEtb: '5000000.00',
    committedAmountEtb: '3750000.00',
    investorCount: 24,
    targetYieldKg: '500000.00',
    floorPriceEtb: '45.50',
    maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.75,
  },
  {
    id: 'opp-2',
    targetCrop: 'Coffee (Yirgacheffe Grade 1)',
    region: 'Sidama',
    regionCode: 'ET-SI',
    targetAmountEtb: '12000000.00',
    committedAmountEtb: '10800000.00',
    investorCount: 42,
    targetYieldKg: '250000.00',
    floorPriceEtb: '120.00',
    maturityDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.9,
  },
  {
    id: 'opp-3',
    targetCrop: 'Soybean (Non-GMO Export)',
    region: 'Oromia',
    regionCode: 'ET-OR',
    targetAmountEtb: '8500000.00',
    committedAmountEtb: '4250000.00',
    investorCount: 18,
    targetYieldKg: '800000.00',
    floorPriceEtb: '32.00',
    maturityDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.5,
  },
];

const mockContracts = [
  {
    id: 'contract-1',
    targetCrop: 'Sesame',
    region: 'Amhara',
    regionCode: 'ET-AM',
    farmerId: 'farmer-1',
    farmerName: 'Abebe Bekele',
    totalTargetYieldKg: '500000.00',
    guaranteedFloorPriceEtb: '45.50',
    contractValueEtb: '22750000.00',
    status: 'ACTIVE',
    maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'contract-2',
    targetCrop: 'Coffee',
    region: 'Sidama',
    regionCode: 'ET-SI',
    farmerId: 'farmer-2',
    farmerName: 'Tadesse Gemechu',
    totalTargetYieldKg: '250000.00',
    guaranteedFloorPriceEtb: '120.00',
    contractValueEtb: '30000000.00',
    status: 'ACTIVE',
    maturityDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockStats = {
  totalFundedUsd: 12450000,
  activeContracts: 47,
  farmersReached: 1840,
  hectaresUnderContract: 68200,
  forexGeneratedUsd: 4180000,
  jobsCreated: 3210,
};

let currentUser: any = null;

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function mockApiPlugin(): Plugin {
  return {
    name: 'nafi-mock-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const method = req.method || 'GET';

        if (!url.startsWith('/api/')) {
          return next();
        }

        const path = url.split('?')[0].replace(/\/$/, '');

        // Health check
        if (path === '/api/v1/health') {
          return sendJson(res, { status: 'ok', time: new Date().toISOString() });
        }

        // Public stats
        if (path === '/api/v1/public/stats') {
          return sendJson(res, { success: true, data: mockStats });
        }

        // Public opportunities
        if (path === '/api/v1/public/opportunities' || path === '/api/v1/opportunities') {
          if (method === 'GET') {
            return sendJson(res, { success: true, data: mockOpportunities });
          }
        }

        if (path.startsWith('/api/v1/opportunities/')) {
          const id = path.replace('/api/v1/opportunities/', '');
          const opp = mockOpportunities.find((o) => o.id === id) || mockOpportunities[0];
          return sendJson(res, { success: true, data: opp });
        }

        // Auth refresh
        if (path === '/api/v1/auth/refresh') {
          if (currentUser) {
            return sendJson(res, {
              success: true,
              data: { accessToken: 'mock-jwt-token-active' },
            });
          }
          return sendJson(
            res,
            { success: false, error: { code: 'UNAUTHORIZED', message: 'No active session' } },
            401,
          );
        }

        // Auth login
        if (path === '/api/v1/auth/login' && method === 'POST') {
          const body = await parseBody(req);
          const email = (body.email || 'farmer@nafi.et').toLowerCase();

          let role = 'COMMERCIAL_FARMER';
          let fullName = 'Abebe Bekele';
          if (email.includes('investor')) {
            role = 'DIASPORA_INVESTOR';
            fullName = 'Selamawit Tadesse';
          } else if (email.includes('bank')) {
            role = 'COMMERCIAL_BANK';
            fullName = 'Commercial Bank of Ethiopia';
          } else if (email.includes('dbe')) {
            role = 'DBE_OFFICER';
            fullName = 'Development Bank Officer';
          } else if (email.includes('nafa')) {
            role = 'NAFA_OFFICER';
            fullName = 'NAFA Guarantee Officer';
          } else if (email.includes('supplier')) {
            role = 'INPUT_SUPPLIER';
            fullName = 'Agri-Inputs Ethiopia Ltd';
          } else if (email.includes('buyer') || email.includes('taker')) {
            role = 'OFF_TAKER';
            fullName = 'Ethiopian Trading Enterprise';
          } else if (email.includes('gov') || email.includes('regulator')) {
            role = 'GOVERNMENT_REGULATOR';
            fullName = 'Ministry of Agriculture';
          } else if (email.includes('donor')) {
            role = 'DONOR';
            fullName = 'Global Agri Development Fund';
          } else if (email.includes('admin')) {
            role = 'NAFI_ADMIN';
            fullName = 'System Administrator';
          } else if (email.includes('compliance')) {
            role = 'COMPLIANCE_OFFICER';
            fullName = 'Compliance Officer';
          } else if (email.includes('arbitrat')) {
            role = 'ARBITRATOR';
            fullName = 'Legal Arbitrator';
          }

          currentUser = {
            id: 'usr-demo-1',
            nafiId: `NAFI-${role.substring(0, 4)}-8821`,
            email,
            fullName,
            role,
            institutionId: 'inst-1',
            institutionName: 'NAFI Demo Network',
            permissions: [
              'contract:read:own',
              'contract:create',
              'contract:read:all',
              'contract:approve',
              'investment:read:own',
              'investment:create',
              'escrow:read:own',
              'escrow:release',
              'input:create',
              'input:verify',
              'report:read:own',
              'report:export',
              'system:configure',
              'dispute:arbitrate',
            ],
            locale: 'en',
            mfaEnabled: false,
          };

          return sendJson(res, {
            success: true,
            data: {
              accessToken: 'mock-access-token-' + Date.now(),
              user: currentUser,
            },
          });
        }

        // Auth me
        if (path === '/api/v1/auth/me') {
          if (!currentUser) {
            currentUser = {
              id: 'usr-demo-1',
              nafiId: 'NAFI-FARM-8821',
              email: 'farmer@nafi.et',
              fullName: 'Abebe Bekele',
              role: 'COMMERCIAL_FARMER',
              institutionId: 'inst-1',
              institutionName: 'NAFI Demo Network',
              permissions: [
                'contract:read:own',
                'contract:create',
                'contract:read:all',
                'contract:approve',
                'investment:read:own',
                'investment:create',
                'escrow:read:own',
                'escrow:release',
                'input:create',
                'input:verify',
                'report:read:own',
                'report:export',
                'system:configure',
                'dispute:arbitrate',
              ],
              locale: 'en',
              mfaEnabled: false,
            };
          }
          return sendJson(res, { success: true, data: currentUser });
        }

        // Auth logout
        if (path === '/api/v1/auth/logout') {
          currentUser = null;
          return sendJson(res, { success: true, data: null });
        }

        // Auth register
        if (path === '/api/v1/auth/register') {
          return sendJson(res, { success: true, data: { userId: 'usr-new-registered' } });
        }

        // Contracts
        if (path === '/api/v1/contracts') {
          if (method === 'POST') {
            const body = await parseBody(req);
            const newContract = {
              id: `contract-${Date.now()}`,
              ...mockContracts[0],
              ...body,
              status: 'PENDING_REVIEW',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            mockContracts.push(newContract);
            return sendJson(res, { success: true, data: newContract }, 201);
          }
          return sendJson(res, {
            success: true,
            data: {
              items: mockContracts,
              page: 1,
              pageSize: 20,
              total: mockContracts.length,
            },
          });
        }

        if (path.startsWith('/api/v1/contracts/')) {
          const id = path.replace('/api/v1/contracts/', '');
          const contract = mockContracts.find((c) => c.id === id) || mockContracts[0];
          return sendJson(res, { success: true, data: contract });
        }

        // Escrows
        if (path.startsWith('/api/v1/escrows')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [
                {
                  id: 'escrow-1',
                  contractId: 'contract-1',
                  contractTitle: 'Sesame Export Contract',
                  totalAmountEtb: '22750000.00',
                  fundedAmountEtb: '22750000.00',
                  disbursedAmountEtb: '10000000.00',
                  status: 'FUNDED',
                  bankName: 'Commercial Bank of Ethiopia',
                  updatedAt: new Date().toISOString(),
                },
              ],
              total: 1,
            },
          });
        }

        // Investments
        if (path.startsWith('/api/v1/investments')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [
                {
                  id: 'inv-1',
                  opportunityId: 'opp-1',
                  cropName: 'Sesame (Humera Premium)',
                  principalUsd: '15000.00',
                  expectedReturnUsd: '17250.00',
                  yieldPercent: 15.0,
                  status: 'ACTIVE',
                  maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ],
              total: 1,
            },
          });
        }

        // Inputs
        if (path.startsWith('/api/v1/inputs')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [
                {
                  id: 'input-1',
                  contractId: 'contract-1',
                  itemType: 'FERTILIZER',
                  itemName: 'DAP High Yield Fertilizer',
                  quantity: 500,
                  unit: 'BAGS',
                  unitPriceEtb: '2800.00',
                  status: 'DELIVERED',
                  supplierName: 'Agri-Inputs Ethiopia Ltd',
                },
              ],
              total: 1,
            },
          });
        }

        // Settlements
        if (path.startsWith('/api/v1/settlements')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [
                {
                  id: 'stl-1',
                  contractId: 'contract-1',
                  grossProceedsEtb: '22750000.00',
                  inputLoanRepaidEtb: '1400000.00',
                  bankInterestEtb: '450000.00',
                  investorPrincipalEtb: '5000000.00',
                  investorReturnEtb: '750000.00',
                  farmerNetProceedsEtb: '15150000.00',
                  status: 'SETTLED',
                  settledAt: new Date().toISOString(),
                },
              ],
              total: 1,
            },
          });
        }

        // Collateral
        if (path.startsWith('/api/v1/collateral')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [
                {
                  id: 'col-1',
                  type: 'WAREHOUSE_RECEIPT',
                  receiptNumber: 'ECX-WR-2026-9921',
                  warehouseLocation: 'Humera Central Warehouse',
                  commodity: 'Sesame Grade 1',
                  quantityKg: 250000,
                  estimatedValueEtb: '11375000.00',
                  status: 'PLEDGED',
                },
              ],
              total: 1,
            },
          });
        }

        // Disputes
        if (path.startsWith('/api/v1/disputes')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [],
              total: 0,
            },
          });
        }

        // Notifications
        if (path.startsWith('/api/v1/notifications')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [
                {
                  id: 'notif-1',
                  title: 'Contract Escrow Funded',
                  message: 'Escrow for contract #1 has been fully funded by CBE.',
                  read: false,
                  createdAt: new Date().toISOString(),
                },
              ],
              total: 1,
            },
          });
        }

        // Reports
        if (path.startsWith('/api/v1/reports')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [],
              total: 0,
            },
          });
        }

        // Audit
        if (path.startsWith('/api/v1/audit')) {
          return sendJson(res, {
            success: true,
            data: {
              items: [
                {
                  id: 'aud-1',
                  action: 'CONTRACT_APPROVED',
                  actor: 'System Admin',
                  target: 'contract-1',
                  timestamp: new Date().toISOString(),
                },
              ],
              total: 1,
            },
          });
        }

        // Default response for any other /api route
        return sendJson(res, { success: true, data: [] });
      });
    },
  };
}
