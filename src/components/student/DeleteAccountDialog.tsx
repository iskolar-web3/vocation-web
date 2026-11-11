import { useState } from 'react';
import { Dialog, DialogClose } from '../ui';

/** RA 10173 erasure: the button stays disabled until the exact word is typed. Replaces window.confirm. */
export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const [text, setText] = useState('');
  const ready = text === 'DELETE';
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setText('');
        onOpenChange(o);
      }}
      title="Delete your account?"
      actions={
        <>
          <DialogClose className="btn btn-ghost">Keep my account</DialogClose>
          <button type="submit" form="delete-form" className="btn btn-danger" disabled={!ready || pending}>
            {pending ? 'Deleting…' : 'Delete account'}
          </button>
        </>
      }
    >
      <form
        id="delete-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onConfirm();
        }}
      >
        <div>
          <p className="t-body mb-2">This is permanent. We will erase:</p>
          <ul className="m-0 grid list-disc gap-1.5 pl-5 text-[15px] text-tx-2">
            <li>Your profile and skills</li>
            <li>Your saved roles</li>
            <li>Your bookings history</li>
          </ul>
        </div>
        <p className="t-small">Upcoming paid sessions must be cancelled first, so you get your refund.</p>
        <div className="field">
          <label htmlFor="delete-confirm">Type DELETE to confirm</label>
          <input
            id="delete-confirm"
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
          />
        </div>
      </form>
    </Dialog>
  );
}
