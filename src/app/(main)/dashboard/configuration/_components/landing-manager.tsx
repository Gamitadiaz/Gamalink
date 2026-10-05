"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { ExternalLink, ImagePlus, Plus, Save, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cloneDefaultContent,
  DEFAULT_LANDING_CONTENT,
  isLandingContent,
  type LandingRow,
  type LandingTemplateKey,
  TEMPLATE_OPTIONS,
} from "@/lib/landings/model";
import { isSuperadminUserId } from "@/lib/landings/superadmin";
import { supabase } from "@/lib/sb/supabase_config";

import { type JsonValue, LandingContentEditor, removeAtPath, setAtPath, toJsonValue } from "./content-editor";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);
const RESERVED_SUBDOMAINS = new Set(["admin", "app", "www"]);

type CompanyOption = { id: string; name: string };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) && !RESERVED_SUBDOMAINS.has(value);
}

function getImageStoragePath(publicUrl: string) {
  try {
    const url = new URL(publicUrl);
    const prefix = "/storage/v1/object/public/gl-landing-images/";
    return url.pathname.startsWith(prefix) ? decodeURIComponent(url.pathname.slice(prefix.length)) : null;
  } catch {
    return null;
  }
}

function isValidDomain(value: string) {
  if (!value) {
    return true;
  }
  const normalized = value.trim().toLowerCase();
  const labels = normalized.split(".");
  return (
    normalized.length <= 253 &&
    labels.length >= 2 &&
    !normalized.endsWith(".gamalink.online") &&
    !normalized.endsWith(".localhost") &&
    !normalized.endsWith(".vercel.app") &&
    normalized !== "gamalink.online" &&
    labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
  );
}

function getImages(value: JsonValue): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.imagenes)) {
    return [];
  }
  return value.imagenes.filter((image): image is string => typeof image === "string");
}

export function LandingManager() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [landings, setLandings] = useState<LandingRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [content, setContent] = useState<JsonValue>(toJsonValue(DEFAULT_LANDING_CONTENT["bold-red"]));
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [newTemplate, setNewTemplate] = useState<LandingTemplateKey>("bold-red");
  const [newSlug, setNewSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedLanding = landings.find((landing) => landing.id === selectedId);
  const selectedCompany = companies.find((company) => company.id === companyId);

  useEffect(() => {
    const loadCompanies = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        setErrorMessage(`No se pudo verificar tu sesión: ${authError.message}`);
        setLoading(false);
        return;
      }
      if (!user) {
        setErrorMessage("Inicia sesión para administrar tus landing pages.");
        setLoading(false);
        return;
      }

      const superadmin = isSuperadminUserId(user.id);
      setIsSuperadmin(superadmin);

      let companyRows: { id: number; nombre_negocio: string | null }[] | null = null;
      if (superadmin) {
        const { data, error } = await supabase.from("gl_empresas").select("id, nombre_negocio").order("nombre_negocio");
        if (error) {
          setErrorMessage(`No se pudieron cargar las empresas: ${error.message}`);
          setLoading(false);
          return;
        }
        companyRows = data;
      } else {
        const { data: memberships, error: membershipError } = await supabase
          .from("gl_usuarios")
          .select("empresa_id")
          .eq("auth_id", user.id);
        if (membershipError) {
          setErrorMessage(`No se pudieron cargar tus empresas: ${membershipError.message}`);
          setLoading(false);
          return;
        }

        const companyIds = [...new Set((memberships ?? []).map((membership) => String(membership.empresa_id)))];
        if (companyIds.length === 0) {
          setErrorMessage("Tu usuario no está vinculado a una empresa de Gamalink.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from("gl_empresas").select("id, nombre_negocio").in("id", companyIds);
        if (error) {
          setErrorMessage(`No se pudieron cargar los datos de tus empresas: ${error.message}`);
          setLoading(false);
          return;
        }
        companyRows = data;
      }

      const options = (companyRows ?? []).map((company) => ({
        id: String(company.id),
        name: company.nombre_negocio || `Empresa ${company.id}`,
      }));
      if (options.length === 0) {
        setErrorMessage(
          superadmin
            ? "Aún no hay empresas registradas para configurar."
            : "No se encontraron los datos de tus empresas.",
        );
        setLoading(false);
        return;
      }

      setCompanies(options);
      setCompanyId(options[0]?.id ?? "");
      setLoading(false);
    };

    void loadCompanies();
  }, []);

  useEffect(() => {
    if (!companyId) {
      setLandings([]);
      setSelectedId("");
      return;
    }

    let cancelled = false;
    const loadLandings = async () => {
      setLoading(true);
      setErrorMessage("");
      setLandings([]);
      setSelectedId("");
      const { data, error } = await supabase
        .from("gl_landings")
        .select("id, empresa_id, template_key, slug, custom_domain, status, content, created_at, updated_at")
        .eq("empresa_id", companyId)
        .order("updated_at", { ascending: false });

      if (cancelled) {
        return;
      }
      if (error) {
        setErrorMessage(`No se pudieron cargar las landing pages. Revisa primero bd.sql: ${error.message}`);
        setLandings([]);
        setSelectedId("");
      } else {
        setLandings(data ?? []);
        setSelectedId(data?.[0]?.id ?? "");
      }
      setLoading(false);
    };

    void loadLandings();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    if (!selectedLanding) {
      return;
    }
    setSlug(selectedLanding.slug);
    setCustomDomain(selectedLanding.custom_domain ?? "");
    if (!isLandingContent(selectedLanding.template_key, selectedLanding.content)) {
      setErrorMessage("El contenido guardado no coincide con la plantilla. No lo edites hasta revisar los datos.");
      return;
    }
    setContent(toJsonValue(selectedLanding.content));
  }, [selectedLanding]);

  const updateSelectedLanding = async (updates: Record<string, unknown>) => {
    if (!selectedLanding) {
      return false;
    }

    const { error } = await supabase.from("gl_landings").update(updates).eq("id", selectedLanding.id);
    if (error) {
      setErrorMessage(`No se pudo guardar la landing: ${error.message}`);
      return false;
    }

    setLandings((current) =>
      current.map((landing) => (landing.id === selectedLanding.id ? { ...landing, ...updates } : landing)),
    );
    return true;
  };

  const saveLanding = async () => {
    if (!selectedLanding || !isLandingContent(selectedLanding.template_key, content)) {
      setErrorMessage("El contenido no tiene la estructura esperada para esta plantilla.");
      return;
    }
    if (!isValidSlug(slug)) {
      setErrorMessage("El subdominio debe usar letras minúsculas, números y guiones.");
      return;
    }
    if (!isValidDomain(customDomain)) {
      setErrorMessage("Escribe un dominio válido sin protocolo ni ruta, por ejemplo negocio.com.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const saved = await updateSelectedLanding({
      content,
      slug,
      custom_domain: customDomain || null,
    });
    if (saved) {
      setSuccessMessage("Cambios guardados.");
    }
    setSaving(false);
  };

  const changePublication = async (status: "draft" | "published") => {
    if (!selectedLanding) {
      return;
    }
    if (
      !isLandingContent(selectedLanding.template_key, content) ||
      !isValidSlug(slug) ||
      !isValidDomain(customDomain)
    ) {
      setErrorMessage("Corrige el contenido, subdominio y dominio antes de publicar.");
      return;
    }
    setSaving(true);
    setErrorMessage("");
    const saved = await updateSelectedLanding({
      content,
      slug,
      custom_domain: customDomain || null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });
    if (saved) {
      setSuccessMessage(status === "published" ? "Landing publicada." : "Landing retirada de publicación.");
    }
    setSaving(false);
  };

  const createLanding = async () => {
    if (!companyId || !isValidSlug(newSlug)) {
      setErrorMessage("Escribe un subdominio válido para crear la landing.");
      return;
    }
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const { data, error } = await supabase
      .from("gl_landings")
      .insert({
        empresa_id: companyId,
        template_key: newTemplate,
        slug: newSlug,
        content: cloneDefaultContent(newTemplate),
      })
      .select("id, empresa_id, template_key, slug, custom_domain, status, content, created_at, updated_at")
      .single();

    if (error) {
      setErrorMessage(`No se pudo crear la landing: ${error.message}`);
      setSaving(false);
      return;
    }

    setLandings((current) => [data, ...current]);
    setSelectedId(data.id);
    setSuccessMessage("Landing creada como borrador.");
    setSaving(false);
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files) {
      return;
    }
    if (!selectedLanding || !selectedCompany) {
      setErrorMessage("Selecciona una empresa y una landing antes de subir imágenes.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    const filesToUpload = Array.from(files);
    const remainingSlots = 5 - getImages(content).length;
    if (filesToUpload.length > remainingSlots) {
      setErrorMessage(`Solo puedes subir ${remainingSlots} imagen(es) más; el máximo es 5 por landing.`);
      return;
    }

    setSaving(true);
    let uploadFailed = false;
    let workingContent = content;
    try {
      for (const file of filesToUpload) {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          setErrorMessage(`${file.name}: solo se permiten PNG, JPG y JPEG.`);
          uploadFailed = true;
          break;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          setErrorMessage(`${file.name}: supera el límite de 5 MB.`);
          uploadFailed = true;
          break;
        }
        const currentImages = getImages(workingContent);
        if (currentImages.length >= 5) {
          setErrorMessage("Cada landing puede tener como máximo 5 imágenes.");
          uploadFailed = true;
          break;
        }

        const extension = file.type === "image/png" ? "png" : "jpg";
        const storagePath = `${selectedCompany.id}/${selectedLanding.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("gl-landing-images")
          .upload(storagePath, file, { contentType: file.type, upsert: false });
        if (uploadError) {
          setErrorMessage(`No se pudo subir ${file.name}: ${uploadError.message}`);
          uploadFailed = true;
          break;
        }

        const { data: imageData } = supabase.storage.from("gl-landing-images").getPublicUrl(storagePath);
        const nextContent = setAtPath(workingContent, ["imagenes"], [...currentImages, imageData.publicUrl]);
        if (!isLandingContent(selectedLanding.template_key, nextContent)) {
          const { error: removeError } = await supabase.storage.from("gl-landing-images").remove([storagePath]);
          if (removeError) {
            console.error("No se pudo limpiar una imagen no vinculada a la landing:", removeError.message);
          }
          setErrorMessage("La imagen no pudo asociarse al contenido de esta plantilla.");
          uploadFailed = true;
          break;
        }

        const saved = await updateSelectedLanding({ content: nextContent });
        if (!saved) {
          const { error: removeError } = await supabase.storage.from("gl-landing-images").remove([storagePath]);
          if (removeError) {
            console.error("No se pudo limpiar una imagen no guardada:", removeError.message);
          }
          uploadFailed = true;
          break;
        }
        workingContent = nextContent;
        setContent(nextContent);
      }
      if (!uploadFailed) {
        setSuccessMessage("Imágenes actualizadas.");
      }
    } catch (error) {
      setErrorMessage(
        `Falló la carga de imágenes: ${error instanceof Error ? error.message : "error de conexión desconocido."}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async (index: number) => {
    if (!selectedLanding) {
      return;
    }
    const images = getImages(content);
    if (typeof images[index] !== "string") {
      return;
    }

    const imageUrl = images[index];
    const nextContent = removeAtPath(content, ["imagenes", index]);
    if (!isLandingContent(selectedLanding.template_key, nextContent)) {
      setErrorMessage("No se pudo validar la imagen seleccionada.");
      return;
    }
    const saved = await updateSelectedLanding({ content: nextContent });
    if (!saved) {
      return;
    }
    setContent(nextContent);
    const storagePath = getImageStoragePath(imageUrl);
    if (storagePath) {
      const { error } = await supabase.storage.from("gl-landing-images").remove([storagePath]);
      if (error) {
        setErrorMessage(`La imagen se quitó de la landing, pero no se pudo borrar de Storage: ${error.message}`);
      }
    }
  };

  const setContentAtPath = (path: (string | number)[], value: JsonValue) => {
    setContent((current) => setAtPath(current, path, value));
  };

  const previewHost = selectedLanding?.custom_domain || `${selectedLanding?.slug}.gamalink.online`;

  if (loading && companies.length === 0) {
    return <p className="text-muted-foreground">Cargando configuración…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {errorMessage ? (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm" role="status">
          {successMessage}
        </div>
      ) : null}

      {isSuperadmin ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          Modo superadministrador: puedes administrar las landing pages de todas las empresas.
        </p>
      ) : null}

      {companies.length > 1 ? (
        <div className="max-w-sm space-y-2">
          <Label htmlFor="landing-company">Empresa</Label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            id="landing-company"
            onChange={(event) => setCompanyId(event.currentTarget.value)}
            value={companyId}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <div>
          <h2 className="font-semibold text-lg">Crear landing</h2>
          <p className="text-muted-foreground text-sm">
            {selectedCompany
              ? `Se creará para ${selectedCompany.name} y tendrá su propio subdominio.`
              : "Cada landing tendrá su propio subdominio y puede usar una plantilla distinta."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="new-template">Plantilla</Label>
            <select
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              id="new-template"
              onChange={(event) => setNewTemplate(event.currentTarget.value as LandingTemplateKey)}
              value={newTemplate}
            >
              {TEMPLATE_OPTIONS.map((template) => (
                <option key={template.key} value={template.key}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="new-slug">Subdominio</Label>
            <div className="flex items-center gap-2">
              <Input
                autoComplete="off"
                id="new-slug"
                maxLength={50}
                onChange={(event) => setNewSlug(slugify(event.currentTarget.value))}
                placeholder={slugify(selectedCompany?.name ?? "mi-negocio")}
                value={newSlug}
              />
              <span className="shrink-0 text-muted-foreground text-sm">.gamalink.online</span>
            </div>
          </div>
        </div>
        <Button disabled={saving || !companyId} onClick={createLanding} type="button">
          <Plus />
          Crear borrador
        </Button>
      </section>

      {landings.length > 0 ? (
        <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
          <div>
            <h2 className="font-semibold text-lg">
              {isSuperadmin && selectedCompany ? `Landing pages de ${selectedCompany.name}` : "Tus landing pages"}
            </h2>
            <p className="text-muted-foreground text-sm">Selecciona una landing para editar su contenido.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {landings.map((landing) => (
              <button
                aria-pressed={selectedId === landing.id}
                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 aria-pressed:border-primary"
                key={landing.id}
                onClick={() => setSelectedId(landing.id)}
                type="button"
              >
                <span className="block font-medium">{landing.slug}</span>
                <span className="block text-muted-foreground text-xs">
                  {TEMPLATE_OPTIONS.find((template) => template.key === landing.template_key)?.label ??
                    landing.template_key}
                  {" · "}
                  {landing.status === "published" ? "Publicada" : "Borrador"}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {selectedLanding && isLandingContent(selectedLanding.template_key, content) ? (
        <section className="space-y-6 rounded-xl border bg-card p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg">Editar landing</h2>
              <p className="text-muted-foreground text-sm">
                La plantilla controla el diseño; aquí solo cambias el contenido.
              </p>
            </div>
            {selectedLanding.status === "published" ? (
              <a
                className="inline-flex items-center gap-2 text-primary text-sm hover:underline"
                href={`https://${previewHost}`}
                rel="noreferrer"
                target="_blank"
              >
                Ver publicada <ExternalLink className="size-4" />
              </a>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landing-slug">Subdominio</Label>
              <Input id="landing-slug" onChange={(event) => setSlug(slugify(event.currentTarget.value))} value={slug} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landing-domain">Dominio propio (opcional)</Label>
              <Input
                autoCapitalize="none"
                id="landing-domain"
                onChange={(event) => setCustomDomain(event.currentTarget.value.trim().toLowerCase())}
                placeholder="www.negocio.com"
                value={customDomain}
              />
            </div>
          </div>

          <LandingContentEditor content={content} onChange={setContentAtPath} />

          <div className="space-y-3 rounded-lg border p-4">
            <div>
              <h3 className="font-medium">Imágenes</h3>
              <p className="text-muted-foreground text-sm">
                Hasta 5 imágenes PNG, JPG o JPEG; máximo 5 MB por archivo.
              </p>
            </div>
            <Label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              <ImagePlus className="size-4" />
              <Upload className="size-4" />
              Subir imágenes
              <input
                accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                className="sr-only"
                disabled={saving || getImages(content).length >= 5}
                multiple
                onChange={(event) => {
                  void uploadImages(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
                type="file"
              />
            </Label>
            {getImages(content).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {getImages(content).map((image, index) => (
                  <div className="relative aspect-square overflow-hidden rounded-md border" key={image}>
                    <Image
                      alt={`Imagen ${index + 1} del negocio`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      src={image}
                      unoptimized
                    />
                    <Button
                      aria-label={`Eliminar imagen ${index + 1}`}
                      className="absolute top-1 right-1"
                      onClick={() => void removeImage(index)}
                      size="icon-sm"
                      type="button"
                      variant="destructive"
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aún no hay imágenes.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button disabled={saving} onClick={saveLanding} type="button">
              <Save />
              Guardar cambios
            </Button>
            {selectedLanding.status === "published" ? (
              <Button disabled={saving} onClick={() => void changePublication("draft")} type="button" variant="outline">
                Retirar publicación
              </Button>
            ) : (
              <Button
                disabled={saving}
                onClick={() => void changePublication("published")}
                type="button"
                variant="outline"
              >
                Publicar landing
              </Button>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
