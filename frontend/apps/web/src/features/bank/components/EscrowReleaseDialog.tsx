import { ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, CurrencyInput, Modal, Select, Textarea } from '@nafi/ui-react';

import type { EscrowSummary } from '@/api/types/escrow';
import { useReleaseEscrow } from '@/hooks';

const PURPOSE_OPTIONS = [
  { value: 'INPUT_DISBURSEMENT', label: 'Input supplier disbursement' },
  { value: 'LABOR', label: 'Labor wages' },
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'HARVEST', label: 'Harvest operations' },
  { value: 'OTHER', label: 'Other' },
];

export function EscrowReleaseDialog({
  escrow,
  open,
  onOpenChange,
}: {
  escrow: EscrowSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'ETB' | 'USD' | 'EUR'>('ETB');
  const [purpose, setPurpose] = useState('INPUT_DISBURSEMENT');
  const [recipientId, setRecipientId] = useState('');
  const [approvalToken, setApprovalToken] = useState('');
  const [notes, setNotes] = useState('');

  const release = useReleaseEscrow();
  const isMultiParty = Number(amount) > 1_000_000;

  const canSubmit =
    Number(amount) > 0 &&
    recipientId.length > 0 &&
    (!isMultiParty || approvalToken.length > 0) &&
    !release.isPending;

  const submit = async () => {
    await release.mutateAsync({
      escrowId: escrow.id,
      amount,
      currency,
      recipientId,
      purpose,
      approvalToken: isMultiParty ? approvalToken : undefined,
    });
    onOpenChange(false);
    setAmount('');
    setApprovalToken('');
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Release escrow funds"
      description={`Contract ${escrow.contractId.slice(0, 8)} · ${escrow.contractCrop}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit} loading={release.isPending}>
            Release funds
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert variant="warning" title="Irreversible action">
          Released funds cannot be recalled without a formal dispute and arbitration.
        </Alert>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Currency"
            value={currency}
            onValueChange={(v) => setCurrency(v as typeof currency)}
            options={[
              { value: 'ETB', label: 'ETB — Ethiopian Birr' },
              { value: 'USD', label: 'USD — US Dollar' },
              { value: 'EUR', label: 'EUR — Euro' },
            ]}
          />
          <Select
            label="Purpose"
            value={purpose}
            onValueChange={setPurpose}
            options={PURPOSE_OPTIONS}
          />
        </div>

        <CurrencyInput
          label="Amount"
          currency={currency}
          value={amount}
          onChange={setAmount}
        />

        <Select
          label="Recipient"
          value={recipientId}
          onValueChange={setRecipientId}
          placeholder="Select a recipient…"
          options={[
            { value: 'supplier-1', label: 'Ethiopian Seed Enterprise' },
            { value: 'supplier-2', label: 'Oromia Fertilizer Corp' },
            { value: 'farmer-1', label: 'Anchor Farmer Co-op' },
          ]}
        />

        {isMultiParty && (
          <div className="flex flex-col gap-2 rounded-md border border-accent-300 bg-accent-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-800">
              <Users className="h-4 w-4" />
              Multi-party approval required
            </div>
            <p className="text-xs text-accent-700">
              Releases over 1,000,000 ETB require an approval token from the contract's government
              witness and DBE co-signer.
            </p>
            <Textarea
              label="Approval token"
              value={approvalToken}
              onChange={(e) => setApprovalToken(e.target.value)}
              rows={2}
              placeholder="Paste the approval token issued via the multi-party signing workflow"
            />
          </div>
        )}

        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <Alert variant="info" icon={<ShieldCheck className="h-5 w-5" />}>
          Every release is logged to the immutable NAFI ledger with your user ID, timestamp, and
          purpose.
        </Alert>
      </div>
    </Modal>
  );
}
