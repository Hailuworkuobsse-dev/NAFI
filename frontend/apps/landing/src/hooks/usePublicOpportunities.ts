import { useQuery } from '@tanstack/react-query';

export interface PublicOpportunity {
  id: string;
  targetCrop: string;
  cropCategory?: 'coffee' | 'oilseeds' | 'grains' | 'horticulture';
  region: string;
  targetAmountEtb: string;
  committedAmountEtb: string;
  investorCount: number;
  targetYieldKg: string;
  floorPriceEtb: string;
  maturityDate: string;
  fundedPercent: number;
  projectedApyPercent?: number;
  riskRating?: string;
  contractType?: 'DEBT_BOND' | 'EQUITY_POOL';
}

const FALLBACK_OPPORTUNITIES: PublicOpportunity[] = [
  {
    id: 'opp-sidama-coffee',
    targetCrop: 'Sidama Grade 1 Arabica Coffee',
    cropCategory: 'coffee',
    region: 'Sidama (Aleta Wendo)',
    targetAmountEtb: '18500000.00',
    committedAmountEtb: '14430000.00',
    investorCount: 42,
    targetYieldKg: '320000.00',
    floorPriceEtb: '480.00',
    maturityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.78,
    projectedApyPercent: 14.8,
    riskRating: 'AA (Sovereign NAFA)',
    contractType: 'DEBT_BOND',
  },
  {
    id: 'opp-humera-sesame',
    targetCrop: 'Humera White Sesame Export Pool',
    cropCategory: 'oilseeds',
    region: 'Western Tigray (Humera)',
    targetAmountEtb: '12000000.00',
    committedAmountEtb: '10200000.00',
    investorCount: 31,
    targetYieldKg: '450000.00',
    floorPriceEtb: '210.00',
    maturityDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.85,
    projectedApyPercent: 16.2,
    riskRating: 'AA- (Bank Escrow)',
    contractType: 'EQUITY_POOL',
  },
  {
    id: 'opp-bale-durum-wheat',
    targetCrop: 'Bale Durum Wheat & Malt Barley',
    cropCategory: 'grains',
    region: 'Oromia (Bale Robe)',
    targetAmountEtb: '24000000.00',
    committedAmountEtb: '15600000.00',
    investorCount: 56,
    targetYieldKg: '1200000.00',
    floorPriceEtb: '85.00',
    maturityDate: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.65,
    projectedApyPercent: 13.5,
    riskRating: 'AAA (DBE Co-Financed)',
    contractType: 'DEBT_BOND',
  },
  {
    id: 'opp-awash-soya',
    targetCrop: 'Awash Valley Non-GMO Soya Beans',
    cropCategory: 'oilseeds',
    region: 'Afar / Middle Awash Basin',
    targetAmountEtb: '9500000.00',
    committedAmountEtb: '8740000.00',
    investorCount: 24,
    targetYieldKg: '600000.00',
    floorPriceEtb: '115.00',
    maturityDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.92,
    projectedApyPercent: 15.0,
    riskRating: 'AA (Escrow Secured)',
    contractType: 'DEBT_BOND',
  },
  {
    id: 'opp-jimma-washed-coffee',
    targetCrop: 'Jimma Limu Washed Specialty Coffee',
    cropCategory: 'coffee',
    region: 'Oromia (Jimma Limu)',
    targetAmountEtb: '16000000.00',
    committedAmountEtb: '8480000.00',
    investorCount: 28,
    targetYieldKg: '280000.00',
    floorPriceEtb: '510.00',
    maturityDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.53,
    projectedApyPercent: 17.0,
    riskRating: 'AA (Coop Union Verified)',
    contractType: 'EQUITY_POOL',
  },
  {
    id: 'opp-wondo-genet-avocado',
    targetCrop: 'Wondo Genet Hass Avocado Export',
    cropCategory: 'horticulture',
    region: 'Sidama (Wondo Genet)',
    targetAmountEtb: '8000000.00',
    committedAmountEtb: '5680000.00',
    investorCount: 19,
    targetYieldKg: '220000.00',
    floorPriceEtb: '195.00',
    maturityDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    fundedPercent: 0.71,
    projectedApyPercent: 15.5,
    riskRating: 'AA- (Cold-Chain Verified)',
    contractType: 'EQUITY_POOL',
  },
];

export function usePublicOpportunities() {
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'opportunities'] as const,
    queryFn: async (): Promise<PublicOpportunity[]> => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/public/opportunities`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch opportunities');
      const json = await res.json();
      const items = json.data as PublicOpportunity[];
      return items && items.length > 0 ? items : FALLBACK_OPPORTUNITIES;
    },
    staleTime: 60_000,
    retry: 1,
  });

  return { opportunities: data && data.length > 0 ? data : FALLBACK_OPPORTUNITIES, isLoading };
}
