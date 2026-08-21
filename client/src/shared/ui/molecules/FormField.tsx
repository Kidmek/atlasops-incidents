import { useId, type ReactNode } from "react";

import { FieldError } from "../atoms/FieldError";
import { Label } from "../atoms/Label";

interface FormFieldRenderProps {
  id: string;
  required: boolean;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: (field: FormFieldRenderProps) => ReactNode;
}

export function FormField({
  label,
  required = false,
  error,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {" *"}
          </span>
        )}
      </Label>

      {children({
        id,
        required,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}

      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
