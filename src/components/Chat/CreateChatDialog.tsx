import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { ModelPicker } from "./ModelPicker";
import { useAsync } from "@/hooks/useAsync";
import { useForm } from "@/hooks/useForm";
import { api } from "@/lib/services";
import { createChatSchema, LIMITS } from "@/shared/schemas";
import type { ChatSummary } from "@/shared/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (chat: ChatSummary) => void;
}

const FORM_ID = "create-chat-form";

export const CreateChatDialog = ({ open, onClose, onCreated }: Props) => {
  const models = useAsync(open ? api.listModels : null, [], [open]);
  const { field, values, setValues, errors, formError, submitting, handleSubmit } = useForm(createChatSchema, { title: "", model_names: [] });

  const onSubmit = handleSubmit(async (data) => {
    const chat = await api.createChat(data);
    if (!chat?._id) throw new Error("The server returned an invalid response.");
    setValues({ title: "", model_names: [] });
    onCreated(chat);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      locked={submitting}
      title="New chat"
      description="Name it and choose up to two models."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" form={FORM_ID} loading={submitting} disabled={models.loading || !!models.error}>Create chat</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <FormField label="Title" placeholder="e.g. Research assistant" maxLength={LIMITS.chatTitle.max} {...field("title")} />
        <ModelPicker
          models={models.data}
          loading={models.loading}
          error={models.error}
          onRetry={models.reload}
          selected={values.model_names}
          onChange={(model_names) => setValues((v) => ({ ...v, model_names }))}
          invalid={errors.model_names}
        />
      </form>
    </Dialog>
  );
};
