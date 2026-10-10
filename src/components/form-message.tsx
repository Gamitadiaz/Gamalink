import type { ActionState } from "@/lib/empresas";

export function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p className={state.ok ? "text-muted-foreground text-sm" : "text-destructive text-sm"} role="status">
      {state.message}
    </p>
  );
}
