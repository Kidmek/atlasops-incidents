import { useState, type SubmitEvent } from "react";

import { ApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/ui/atoms/Button";
import { FieldError } from "@/shared/ui/atoms/FieldError";
import { Label } from "@/shared/ui/atoms/Label";
import { Textarea } from "@/shared/ui/atoms/Textarea";

import { useAddIncidentNote } from "../hooks/useIncidentsMutation";

export function IncidentNote({ incidentId }: { incidentId: string }) {
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const mutation = useAddIncidentNote(incidentId);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = message.trim();

    // Rejects both empty and whitespace-only notes.
    if (trimmed === "") {
      setValidationError("Enter a note before submitting.");
      return;
    }

    setValidationError(null);

    // Cleared only on success, so a failed submission keeps the user's text.
    mutation.mutate(trimmed, { onSuccess: () => setMessage("") });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="incident-note">Add a note</Label>

      <Textarea
        id="incident-note"
        rows={3}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        aria-invalid={validationError !== null}
        aria-describedby="incident-note-error"
        placeholder="What did you find?"
      />

      <FieldError id="incident-note-error">{validationError}</FieldError>

      <div className="flex items-center gap-3 sm:flex-row flex-col">
        <Button
          type="submit"
          variant="primary"
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Adding…" : "Add note"}
        </Button>

        <span aria-live="polite" className="text-sm text-danger text-center">
          {mutation.isError
            ? mutation.error instanceof ApiError
              ? mutation.error.message
              : "The note could not be added."
            : null}
        </span>
      </div>
    </form>
  );
}
