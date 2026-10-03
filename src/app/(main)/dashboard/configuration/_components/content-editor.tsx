"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const fieldLabels: Record<string, string> = {
  nombre: "Nombre del negocio",
  tipo: "Tipo de negocio",
  slogan: "Título principal",
  subtitulo: "Subtítulo",
  descripcion: "Descripción",
  whatsapp: "WhatsApp (solo números con código de país)",
  instagram: "Usuario de Instagram",
  facebook: "Usuario de Facebook",
  telefono: "Teléfono",
  direccion: "Dirección",
  maps_embed: "URL del mapa de Google",
  horarios: "Horarios",
  dia: "Día",
  hora: "Horario",
  menu: "Categorías del menú",
  categoria: "Categoría",
  servicios: "Productos o servicios",
  zonas: "Zonas o áreas",
  nombre_item: "Nombre",
  precio: "Precio",
  desc: "Descripción",
  icono: "Icono",
  emoji: "Emoji",
  precios: "Planes y precios",
  badge: "Etiqueta",
  especial: "Destacar plan",
  inscripcion: "Inscripción",
  precio_estudiante: "Precio para estudiantes",
  precio_tercera_edad: "Precio para adultos mayores",
  ciudad: "Ciudad",
  slogan2: "Segundo título",
  precio_banner: "Texto del banner de precio",
  precio_sub: "Subtítulo de precio",
  items: "Elementos",
};

function labelFor(key: string) {
  return fieldLabels[key] ?? key.replaceAll("_", " ");
}

export function toJsonValue(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, toJsonValue(child)]));
  }

  throw new Error("El contenido de la landing no es compatible con JSON.");
}

function setAtPath(root: JsonValue, path: (string | number)[], nextValue: JsonValue): JsonValue {
  if (path.length === 0) {
    return nextValue;
  }

  const [segment, ...remaining] = path;
  if (Array.isArray(root) && typeof segment === "number") {
    return root.map((child, index) => (index === segment ? setAtPath(child, remaining, nextValue) : child));
  }
  if (root !== null && typeof root === "object" && !Array.isArray(root) && typeof segment === "string") {
    return {
      ...root,
      [segment]: setAtPath(root[segment], remaining, nextValue),
    };
  }

  return root;
}

function removeAtPath(root: JsonValue, path: (string | number)[]): JsonValue {
  const [segment, ...remaining] = path;
  if (Array.isArray(root) && typeof segment === "number") {
    if (remaining.length === 0) {
      return root.filter((_, index) => index !== segment);
    }
    return root.map((child, index) => (index === segment ? removeAtPath(child, remaining) : child));
  }
  if (root !== null && typeof root === "object" && !Array.isArray(root) && typeof segment === "string") {
    return {
      ...root,
      [segment]: removeAtPath(root[segment], remaining),
    };
  }
  return root;
}

function emptyLike(value: JsonValue, key = ""): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => emptyLike(item));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, emptyLike(child, childKey)]));
  }
  if (key === "color") {
    return value;
  }
  if (typeof value === "boolean") {
    return false;
  }
  if (typeof value === "number") {
    return 0;
  }
  return value === null ? null : "";
}

function ContentField({
  label,
  path,
  value,
  onChange,
}: {
  label: string;
  path: (string | number)[];
  value: JsonValue;
  onChange: (path: (string | number)[], value: JsonValue) => void;
}) {
  if (Array.isArray(value)) {
    return (
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="px-1 font-medium text-sm">{label}</legend>
        {value.map((item, index) => {
          // biome-ignore lint/suspicious/noArrayIndexKey: rows use schema positions and cannot be reordered
          return (
            <div className="rounded-md bg-muted/30 p-3" key={index}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {label.replace(/s$/, "")} {index + 1}
                </span>
                <Button
                  aria-label={`Eliminar ${label.replace(/s$/, "").toLowerCase()} ${index + 1}`}
                  disabled={value.length === 1}
                  onClick={() => onChange(path, removeAtPath(value, [index]))}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 />
                </Button>
              </div>
              <ContentObject path={[...path, index]} value={item} onChange={onChange} />
            </div>
          );
        })}
        <Button
          disabled={value.length >= 50}
          onClick={() => onChange(path, [...value, emptyLike(value[0])])}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus />
          Agregar elemento
        </Button>
      </fieldset>
    );
  }

  if (value !== null && typeof value === "object") {
    return (
      <fieldset className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <legend className="px-1 font-medium text-sm">{label}</legend>
        <ContentObject path={path} value={value} onChange={onChange} />
      </fieldset>
    );
  }

  const id = `landing-field-${path.map(String).join("-")}`;
  const multiline = ["descripcion", "subtitulo", "precio_banner", "precio_sub"].includes(String(path[path.length - 1]));

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm" htmlFor={id}>
        <input
          checked={value}
          id={id}
          onChange={(event) => onChange(path, event.currentTarget.checked)}
          type="checkbox"
        />
        {label}
      </label>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea id={id} onChange={(event) => onChange(path, event.currentTarget.value)} value={String(value ?? "")} />
      ) : (
        <Input
          id={id}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            onChange(path, value === null && nextValue === "" ? null : nextValue);
          }}
          value={String(value ?? "")}
        />
      )}
    </div>
  );
}

function ContentObject({
  path,
  value,
  onChange,
}: {
  path: (string | number)[];
  value: JsonValue;
  onChange: (path: (string | number)[], value: JsonValue) => void;
}) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return (
      <ContentField label={labelFor(String(path[path.length - 1]))} path={path} value={value} onChange={onChange} />
    );
  }

  return (
    <>
      {Object.entries(value)
        .filter(([key]) => key !== "imagenes" && key !== "color")
        .map(([key, child]) => {
          const childPath = [...path, key];
          return (
            <ContentField
              key={childPath.join(".")}
              label={labelFor(key)}
              onChange={onChange}
              path={childPath}
              value={child}
            />
          );
        })}
    </>
  );
}

export function LandingContentEditor({
  content,
  onChange,
}: {
  content: JsonValue;
  onChange: (path: (string | number)[], value: JsonValue) => void;
}) {
  return <ContentObject path={[]} value={content} onChange={onChange} />;
}

export { removeAtPath, setAtPath };
