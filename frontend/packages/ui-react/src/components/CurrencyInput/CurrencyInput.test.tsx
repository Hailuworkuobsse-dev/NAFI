import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CurrencyInput } from './CurrencyInput';

describe('CurrencyInput', () => {
  it('renders with currency label', () => {
    render(<CurrencyInput currency="ETB" label="Amount" />);
    expect(screen.getByText('ETB')).toBeInTheDocument();
    expect(screen.getByText('Br')).toBeInTheDocument();
  });

  it('accepts decimal input', async () => {
    const onChange = vi.fn();
    render(<CurrencyInput currency="ETB" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '1234.56');
    expect(onChange).toHaveBeenLastCalledWith('1234.56');
  });

  it('rejects more than 2 decimal places', async () => {
    const onChange = vi.fn();
    render(<CurrencyInput currency="ETB" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '12.345');
    // The '5' should be rejected
    expect(onChange).toHaveBeenLastCalledWith('12.34');
  });

  it('rejects letters', async () => {
    const onChange = vi.fn();
    render(<CurrencyInput currency="ETB" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abc');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows error with role=alert', () => {
    render(<CurrencyInput currency="ETB" error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});
