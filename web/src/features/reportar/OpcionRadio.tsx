import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
}

/** Tarjeta seleccionable con radio nativo (accesible por teclado, foco visible). */
export default function OpcionRadio({ children, ...props }: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background p-3 text-sm transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring">
      <input type="radio" className="size-4 accent-primary" {...props} />
      <span>{children}</span>
    </label>
  );
}
