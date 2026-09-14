import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { Button, Card, CardBody, Input } from '@nafi/ui-react';

import { authApi } from '@/auth/api';

const schema = z
  .object({
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type Input = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      await authApi.confirmPasswordReset(token, password);
      navigate('/login', { replace: true });
    } catch {
      setError('Reset link is invalid or expired.');
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col gap-5 p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Choose a new password</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.confirm?.message}
            {...form.register('confirm')}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
            Reset password
          </Button>
        </form>
        <Link to="/login" className="text-center text-xs text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </CardBody>
    </Card>
  );
}
