export type SignerOption = {
  key: "student" | "primary" | "secondary";
  label: string;
  fullName: string;
  cpf: string | null;
};

export function Blank({ width = "220px" }: { width?: string }) {
  return (
    <span
      className="inline-block border-b border-[var(--foreground)] align-bottom"
      style={{ width, minHeight: "1em" }}
    >
      &nbsp;
    </span>
  );
}

export function SignerControls({
  options,
  selectedKey,
  onChange,
}: {
  options: SignerOption[];
  selectedKey: SignerOption["key"];
  onChange: (key: SignerOption["key"]) => void;
}) {
  if (options.length <= 1) {
    return null;
  }

  return (
    <label className="block text-sm font-medium text-[var(--foreground)] print:hidden">
      Quem assina como contratante
      <select
        value={selectedKey}
        onChange={(event) => onChange(event.target.value as SignerOption["key"])}
        className="mt-1.5 block w-full max-w-xs rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ContratanteBlock({
  selected,
  studentFullName,
  renderManualBlank,
}: {
  selected: SignerOption | undefined;
  studentFullName: string;
  renderManualBlank: (id: string, width?: string) => React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm leading-7">
        CONTRATANTE:{" "}
        {selected ? <span className="font-semibold">{selected.fullName}</span> : <Blank width="420px" />}{" "}
        CPF/MF:{" "}
        {selected?.cpf ? (
          <span className="font-semibold">{selected.cpf}</span>
        ) : (
          renderManualBlank(`cpf_${selected?.key ?? "none"}`, "180px")
        )}
      </p>
      {selected && selected.key !== "student" ? (
        <p className="text-sm leading-7">
          Representando: <span className="font-semibold">{studentFullName}</span>
        </p>
      ) : null}
    </div>
  );
}

export function SignatureLine({ selected }: { selected: SignerOption | undefined }) {
  return (
    <div className="mt-16 text-center text-sm">
      <div className="mx-auto w-80 border-t border-[var(--foreground)] pt-2">
        {selected?.fullName ?? "Contratante"}
      </div>
      <p className="mt-1 font-semibold">Contratante</p>
    </div>
  );
}
