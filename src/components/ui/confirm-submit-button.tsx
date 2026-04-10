"use client";

import { useId, useRef, useState } from "react";

type ConfirmSubmitButtonProps = {
  message: string;
  children: React.ReactNode;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmSubmitButton({
  message,
  children,
  className,
  formAction,
  title = "Confirmar exclusão",
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
}: ConfirmSubmitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  function confirmSubmit() {
    setIsOpen(false);
    hiddenSubmitRef.current?.form?.requestSubmit(hiddenSubmitRef.current);
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setIsOpen(true)}>
        {children}
      </button>
      <button
        ref={hiddenSubmitRef}
        type="submit"
        formAction={formAction}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.48)] px-4 py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-md rounded-lg border border-[rgba(153,27,27,0.16)] bg-white p-6 shadow-2xl shadow-[rgba(15,23,42,0.22)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(254,242,242)] text-lg font-bold text-[rgb(153,27,27)]">
                !
              </div>
              <div>
                <h2 id={titleId} className="text-xl font-semibold text-[var(--foreground)]">
                  {title}
                </h2>
                <p id={descriptionId} className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)]"
                onClick={() => setIsOpen(false)}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="rounded-lg bg-[rgb(153,27,27)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                onClick={confirmSubmit}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
