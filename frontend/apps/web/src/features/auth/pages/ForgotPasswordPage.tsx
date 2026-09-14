import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Button, Card, CardBody, Input } from '@nafi/ui-react';

import { authApi } from '@/auth/api';

const schema = z.object({ email: z.string().email() });
type Input = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const form = useForm<Input>({ resolver: zodResolver(schema), defaultValues: { email: '' } });
  const [sent, setSent] = useState(false);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await authApi.requestPasswordReset(email);
    } catch {
      /* swallow — don't leak existence */
    }
    setSent(true);
  });

  return (
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col gap-5 p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Reset password</h1>

        {sent ? (
          <p className="text-sm text-neutral-600">
            If an account exists for that email, we sent a password reset link.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />
            <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
              Send reset link
            </Button>
          </form>
        )}

        <Link to="/login" className="text-center text-xs text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </CardBody>
    </Card>
  );
}
