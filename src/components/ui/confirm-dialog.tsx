import { useState } from "react";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { Alert } from "./alert";
import { errorMessage } from "@/lib/api";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const ConfirmDialog = ({ open, title, description, confirmLabel = "Delete", onConfirm, onClose }: ConfirmDialogProps) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setError("");
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      close();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      locked={busy}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={busy}>Cancel</Button>
          <Button variant="destructive" onClick={confirm} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      {error && <Alert>{error}</Alert>}
    </Dialog>
  );
};
