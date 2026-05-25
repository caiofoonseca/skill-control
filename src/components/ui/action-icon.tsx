type ActionIconName = "view" | "hide" | "edit" | "delete";
type ActionIconVariant = "default" | "accent" | "primary" | "danger";

const variantClassNames: Record<ActionIconVariant, string> = {
  default: "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--panel)]",
  accent: "border border-[var(--border)] bg-white text-[var(--accent)] hover:bg-[var(--panel)]",
  primary: "bg-[var(--primary)] text-white hover:opacity-95",
  danger: "border border-[rgba(236,28,36,0.24)] bg-white text-[var(--primary)] hover:bg-[rgba(236,28,36,0.06)]",
};

function ActionSvg({ icon }: { icon: ActionIconName }) {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
  };

  if (icon === "view") {
    return (
      <svg {...commonProps}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (icon === "hide") {
    return (
      <svg {...commonProps}>
        <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
        <path d="M9.9 4.3A10.2 10.2 0 0 1 12 4c6.5 0 10 8 10 8a15.5 15.5 0 0 1-4.2 5.1" />
        <path d="M6.6 6.6C3.6 8.5 2 12 2 12a15.5 15.5 0 0 0 6.1 6.4A9.6 9.6 0 0 0 12 20a10.2 10.2 0 0 0 2.2-.2" />
        <path d="m2 2 20 20" />
      </svg>
    );
  }

  if (icon === "edit") {
    return (
      <svg {...commonProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function actionClassName(variant: ActionIconVariant) {
  return `inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition ${variantClassNames[variant]}`;
}

export function ActionIconLink({
  href,
  label,
  icon,
  variant = "default",
}: {
  href: string;
  label: string;
  icon: ActionIconName;
  variant?: ActionIconVariant;
}) {
  return (
    <a href={href} aria-label={label} title={label} className={actionClassName(variant)}>
      <ActionSvg icon={icon} />
    </a>
  );
}

export function ActionIconButton({
  label,
  icon,
  variant = "default",
}: {
  label: string;
  icon: ActionIconName;
  variant?: ActionIconVariant;
}) {
  return (
    <button type="submit" aria-label={label} title={label} className={actionClassName(variant)}>
      <ActionSvg icon={icon} />
    </button>
  );
}
