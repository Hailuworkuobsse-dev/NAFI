import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Modal } from './Modal';

function Wrapper() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onOpenChange={setOpen} title="Test modal">
        <p>Content</p>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('opens on trigger click', async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Test modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByText('Open'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Test modal')).not.toBeInTheDocument();
  });

  it('traps focus inside dialog', async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByText('Open'));
    // Focus should be within the dialog
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });
});
