import { useState } from 'react';

import { Alert, Button, Checkbox, Modal, Textarea } from '@nafi/ui-react';

import { useSignContract } from '@/hooks';

export function ContractSignDialog({
  contractId,
  open,
  onOpenChange,
}: {
  contractId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [signature, setSignature] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const sign = useSignContract();

  const handleSign = async () => {
    await sign.mutateAsync({
      contractId,
      role: 'FARMER',
      signatureHash: signature,
    });
    onOpenChange(false);
    setSignature('');
    setConfirmed(false);
  };

  const canSign = signature.length >= 3 && confirmed && !sign.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Sign contract"
      description="Your signature will be recorded on the NAFI ledger."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSign} disabled={!canSign} loading={sign.isPending}>
            Sign contract
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert variant="warning" title="Legally binding">
          By signing, you agree to the production contract under Proclamation No. 1289/2023.
        </Alert>

        <Textarea
          label="Digital signature"
          rows={2}
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Type your full legal name exactly as registered"
        />

        <Checkbox
          checked={confirmed}
          onCheckedChange={(v) => setConfirmed(Boolean(v))}
          label="I confirm I have read the contract and agree to its terms."
        />
      </div>
    </Modal>
  );
}
