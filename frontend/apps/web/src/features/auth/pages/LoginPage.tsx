import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROLE_HOME } from '@nafi/rbac-core';
import { Button, Card, CardBody, Input } from '@nafi/ui-react';
import { loginSchema, type LoginInput } from '@nafi/validators';

import { useAuthActions } from '@/auth/AuthProvider';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthActions();
  const [mfaRequired, setMfaRequired] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await login(values);
      if (result.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      const redirect = (location.state as { from?: string } | null)?.from;
      const home = ROLE_HOME[result.user.role];
      navigate(redirect ?? home, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Unable to sign in. Please try again.';
      setServerError(message);
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col gap-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label={t('login.email')}
            type="email"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <Input
            label={t('login.password')}
            type="password"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          {mfaRequired && (
            <Input
              label={t('login.mfaCode')}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              {...form.register('mfaCode')}
            />
          )}

          {serverError && (
            <p
              className="rounded border border-danger/30 bg-danger-light/40 px-3 py-2 text-xs text-danger-dark"
              role="alert"
            >
              {serverError}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-brand-600 hover:underline">
              {t('login.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
            {t('login.submit')}
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            {t('login.createAccount')}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
