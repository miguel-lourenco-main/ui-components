"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ComponentPropContract } from "@/lib/contracts";

interface RequestPropsPanelProps {
  props: ComponentPropContract[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

function propTypeLabel(prop: ComponentPropContract): string {
  return Array.isArray(prop.type) ? prop.type.join(" | ") : prop.type;
}

function isEditableProp(prop: ComponentPropContract): boolean {
  const t = prop.type;
  if (typeof t === "string") {
    return ["boolean", "string", "number", "enum", "select"].includes(t);
  }
  return false;
}

/**
 * Lightweight prop controls for proposed components on the request detail page.
 */
export function RequestPropsPanel({
  props,
  values,
  onChange,
}: RequestPropsPanelProps) {
  const editable = props.filter(isEditableProp);
  if (editable.length === 0) return null;

  const setValue = (name: string, value: unknown) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Try the proposed props</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {editable.map((prop) => {
          const type = typeof prop.type === "string" ? prop.type : "string";
          const value = values[prop.name];

          if (type === "boolean") {
            return (
              <div
                key={prop.name}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <Label htmlFor={`req-prop-${prop.name}`} className="text-sm">
                    {prop.name}
                  </Label>
                  {prop.description ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {prop.description}
                    </p>
                  ) : null}
                </div>
                <Switch
                  id={`req-prop-${prop.name}`}
                  checked={Boolean(value)}
                  onCheckedChange={(checked) => setValue(prop.name, checked)}
                />
              </div>
            );
          }

          if (type === "enum" || type === "select") {
            return (
              <div key={prop.name} className="space-y-1">
                <Label htmlFor={`req-prop-${prop.name}`}>{prop.name}</Label>
                <select
                  id={`req-prop-${prop.name}`}
                  value={String(value ?? "")}
                  onChange={(e) => setValue(prop.name, e.target.value || undefined)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Default</option>
                  {prop.options?.map((option) => (
                    <option key={String(option)} value={String(option)}>
                      {String(option)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (type === "number") {
            return (
              <div key={prop.name} className="space-y-1">
                <Label htmlFor={`req-prop-${prop.name}`}>{prop.name}</Label>
                <input
                  id={`req-prop-${prop.name}`}
                  type="number"
                  value={value === undefined ? "" : String(value)}
                  onChange={(e) =>
                    setValue(
                      prop.name,
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            );
          }

          return (
            <div key={prop.name} className="space-y-1">
              <Label htmlFor={`req-prop-${prop.name}`}>{prop.name}</Label>
              <input
                id={`req-prop-${prop.name}`}
                type="text"
                value={value === undefined ? "" : String(value)}
                onChange={(e) => setValue(prop.name, e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">{propTypeLabel(prop)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
