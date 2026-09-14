import { Camera, MapPin, WifiOff } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Input, Modal, Textarea } from '@nafi/ui-react';

import { inputsApi } from '@/api/domains/inputs';
import type { InputPurchaseSummary } from '@/api/types/input';
import { qk } from '@/lib/queryKeys';
import { useOffline } from '@/offline/OfflineProvider';
import { useOfflineMutation } from '@/offline/useOfflineMutation';

export function DeliveryVerifyDialog({
  purchase,
  open,
  onOpenChange,
}: {
  purchase: InputPurchaseSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isOnline } = useOffline();
  const [photoHash, setPhotoHash] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const verify = useOfflineMutation({
    endpoint: `/inputs/${purchase.id}/verify`,
    method: 'POST',
    priority: 100,
    groupKey: `input:${purchase.id}`,
    invalidateKeys: [qk.inputs.root, qk.escrows.root],
    onlineMutation: (vars: {
      purchaseId: string;
      photoHash: string;
      latitude: number;
      longitude: number;
      qrCode?: string;
      notes?: string;
    }) => inputsApi.verifyDelivery(vars),
    successToast: 'Delivery verified — escrow will release payment',
    queuedToast: 'Delivery saved offline',
    onComplete: () => {
      onOpenChange(false);
      setPhotoHash('');
      setQrCode('');
      setNotes('');
      setCoords(null);
    },
  });

  const payload = {
    purchaseId: purchase.id,
    photoHash,
    latitude: coords?.lat ?? 0,
    longitude: coords?.lng ?? 0,
    qrCode: qrCode || undefined,
    notes: notes || undefined,
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Location is not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
      },
      () => setGpsError('Could not get your location. Please enable GPS.'),
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const handlePhoto = (file: File) => {
    setPhotoHash(`${file.name}:${file.size}:${Date.now()}`);
  };

  const canVerify = photoHash.length > 0 && coords !== null && !verify.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Verify delivery"
      description={purchase.itemDescription}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => verify.mutate(payload)}
            disabled={!canVerify}
            loading={verify.isPending}
          >
            {isOnline ? 'Confirm receipt' : 'Save offline'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!isOnline && (
          <Alert
            variant="warning"
            icon={<WifiOff className="h-5 w-5" />}
            title="You're offline"
          >
            Your verification will be saved on this device and synced automatically once you
            reconnect. Don&apos;t uninstall the app before syncing.
          </Alert>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Delivery photo
          </label>
          <label className="flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-brand-400">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhoto(file);
              }}
            />
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <Camera className="h-6 w-6" />
              <span className="text-xs">
                {photoHash ? 'Photo attached ✓' : 'Tap to capture'}
              </span>
            </div>
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">GPS location</label>
          <Button
            type="button"
            variant="outline"
            fullWidth
            leadingIcon={<MapPin className="h-4 w-4" />}
            onClick={captureLocation}
          >
            {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Capture GPS'}
          </Button>
          {gpsError && <p className="mt-1 text-xs text-danger">{gpsError}</p>}
        </div>

        <Input
          label="QR code (optional)"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Scan or type the package code"
        />

        <Textarea
          label="Notes (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any issues with the delivery?"
        />
      </div>
    </Modal>
  );
}
