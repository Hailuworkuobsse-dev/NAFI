import { useState } from 'react';

import type { CreateInvestmentInput, FundingType } from '@/api/types/investment';

export interface InvestFlowState {
  step: 1 | 2 | 3;
  fundingType: FundingType;
  amountForeignCurrency: string;
  currency: 'USD' | 'EUR' | 'GBP';
  agreedReturnRate: number;
  sourceOfFunds: string;
}

const INITIAL: InvestFlowState = {
  step: 1,
  fundingType: 'DEBT_FIXED_RETURN',
  amountForeignCurrency: '',
  currency: 'USD',
  agreedReturnRate: 0.08,
  sourceOfFunds: '',
};

export function useInvestFlow() {
  const [state, setState] = useState<InvestFlowState>(INITIAL);

  const patch = (p: Partial<InvestFlowState>) => setState((s) => ({ ...s, ...p }));
  const next = () => patch({ step: Math.min(3, state.step + 1) as 1 | 2 | 3 });
  const back = () => patch({ step: Math.max(1, state.step - 1) as 1 | 2 | 3 });
  const reset = () => setState(INITIAL);

  const toInput = (contractId: string): CreateInvestmentInput => ({
    contractId,
    fundingType: state.fundingType,
    amountForeignCurrency: state.amountForeignCurrency,
    currency: state.currency,
    agreedReturnRate: state.agreedReturnRate,
    sourceOfFunds: state.sourceOfFunds,
  });

  return { state, patch, next, back, reset, toInput };
}
