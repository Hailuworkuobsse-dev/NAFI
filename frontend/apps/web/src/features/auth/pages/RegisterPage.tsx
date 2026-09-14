import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { LOCALE_LABELS, SUPPORTED_LOCALES } from '@nafi/i18n';
import type { Role } from '@nafi/rbac-core';
import { Button, Card, CardBody, Checkbox, Input, Select } from '@nafi/ui-react';
import { registerSchema, type RegisterInput } from '@nafi/validators';

import { useAuthActions } from '@/auth/AuthProvider';

const ROLE_LABELS: Record<Role, string> = {
  DIASPORA_INVESTOR: 'Diaspora Investor',
  COMMERCIAL_BANK: 'Commercial Bank',
  DBE_OFFICER: 'Development Bank of Ethiopia',
  NAFA_OFFICER: 'NAFA Officer',
  INPUT_SUPPLIER: 'Input Supplier',
  COMMERCIAL_FARMER: 'Commercial Farmer',
  OFF_TAKER: 'Off-Taker / Buyer',
  GOVERNMENT_REGULATOR: 'Government Regulator',
  DONOR: 'Donor / Development Partner',
  NAFI_ADMIN: 'NAFI Administrator',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  ARBITRATOR: 'Arbitrator',
};

const SELF_REGISTERABLE_ROLES: Role[] = [
  'DIASPORA_INVESTOR',
  'COMMERCIAL_FARMER',
  'INPUT_SUPPLIER',
  'OFF_TAKER',
  'COMMERCIAL_BANK',
];

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register: registerUser } = useAuthActions();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initialRole = (params.get('role') as Role | null) ?? 'DIASPORA_INVESTOR';

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole,
      fullName: '',
      email: '',
      phone: '',
      password: '',
      locale: 'en',
      acceptTerms: true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await registerUser(values);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Unable to register. Please try again.';
      setServerError(message);
    }
  });

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success-dark">
            ✓
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Check your email</h1>
          <p className="text-sm text-neutral-600">
            We sent a verification link to <strong>{form.getValues('email')}</strong>.
            Please verify your email to continue.
          </p>
          <Link to="/login" className="text-sm text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardBody className="flex flex-col gap-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('register.title')}</h1>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <Select
                label={t('register.selectRole')}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
                options={SELF_REGISTERABLE_ROLES.map((r) => ({
                  value: r,
                  label: ROLE_LABELS[r],
                }))}
              />
            )}
          />

          <Input
            label={t('register.fullName')}
            autoComplete="name"
            error={form.formState.errors.fullName?.message}
            {...form.register('fullName')}
          />

          <Input
            label={t('register.email')}
            type="email"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <Input
            label={t('register.phone')}
            autoComplete="tel"
            placeholder="+251 9..."
            error={form.formState.errors.phone?.message}
            {...form.register('phone')}
          />

          <Input
            label={t('register.password')}
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          <Controller
            control={form.control}
            name="locale"
            render={({ field }) => (
              <Select
                label={t('register.locale')}
                value={field.value}
                onValueChange={field.onChange}
                options={SUPPORTED_LOCALES.map((l) => ({
                  value: l,
                  label: LOCALE_LABELS[l],
                }))}
              />
            )}
          />

          <Controller
            control={form.control}
            name="acceptTerms"
            render={({ field, fieldState }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
                label={t('register.acceptTerms')}
                error={fieldState.error?.message}
              />
            )}
          />

          {serverError && (
            <p
              className="rounded border border-danger/30 bg-danger-light/40 px-3 py-2 text-xs text-danger-dark"
              role="alert"
            >
              {serverError}
            </p>
          )}

          <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
            {t('register.submit')}
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            {t('register.signIn')}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
