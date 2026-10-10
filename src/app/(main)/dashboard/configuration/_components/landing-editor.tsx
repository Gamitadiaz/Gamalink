"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { ArrowLeft, ExternalLink, ImagePlus, Save, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isLandingContent, type LandingRow, TEMPLATE_OPTIONS } from "@/lib/landings/model";
import { supabase } from "@/lib/sb/supabase_config";

import { type JsonValue, LandingContentEditor, removeAtPath, setAtPath, toJsonValue } from "./content-editor";
import {
  ALLOWED_IMAGE_TYPES,
  describeLandingError,
  getImageStoragePath,
  getImages,
  isValidDomain,
  isValidSlug,
  LANDING_COLUMNS,
  MAX_IMAGE_SIZE,
  slugify,
} from "./landing-utils";

export function LandingEditor({ landingId }: { landingId: string }) {
  const [landing, setLanding] = useState<LandingRow | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [content, setContent] = useState<JsonValue>(null);
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadLanding = async () => {
      // RLS solo devuelve la landing si es de tu empresa (o si eres superadmin).
      const { data, error } = await supabase
        .from("gl_landings")
        .select(LANDING_COLUMNS)
        .eq("id", landingId)
        .maybeSingle();
      if (cancelled) {
        return;
      }
      if (error) {
        setErrorMessage(`No se pudo cargar la landing: ${error.message}`);
        setLoading(false);
        return;
      }
      if (!data) {
        setErrorMessage("Esta landing no existe o no tienes acceso a ella.");
        setLoading(false);
        return;
      }

      setLanding(data);
      setSlug(data.slug);
      setCustomDomain(data.custom_domain ?? "");
      if (isLandingContent(data.template_key, data.content)) {
        setContent(toJsonValue(data.content));
      } else {
        setErrorMessage("El contenido guardado no coincide con la plantilla. No lo edites hasta revisar los datos.");
      }

      const { data: company } = await supabase
        .from("gl_empresas")
        .select("nombre_negocio")
        .eq("id", data.empresa_id)
        .maybeSingle();
      if (!cancelled) {
        setCompanyName(company?.nombre_negocio ?? "");
        setLoading(false);
      }
    };

    void loadLanding();
    return () => {
      cancelled = true;
    };
  }, [landingId]);

  const updateLanding = async (updates: Record<string, unknown>) => {
    if (!landing) {
      return false;
    }

    const { error } = await supabase.from("gl_landings").update(updates).eq("id", landing.id);
    if (error) {
      setErrorMessage(`No se pudo guardar la landing: ${describeLandingError(error)}`);
      return false;
    }

    setLanding((current) => (current ? { ...current, ...updates } : current));
    return true;
  };

  const saveLanding = async () => {
    if (!landing || !isLandingContent(landing.template_key, content)) {
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
    const saved = await updateLanding({
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
    if (!landing) {
      return;
    }
    if (!isLandingContent(landing.template_key, content) || !isValidSlug(slug) || !isValidDomain(customDomain)) {
      setErrorMessage("Corrige el contenido, subdominio y dominio antes de publicar.");
      return;
    }
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const saved = await updateLanding({
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

  const uploadImages = async (files: FileList | null) => {
    if (!files || !landing) {
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
        const storagePath = `${landing.empresa_id}/${landing.id}/${crypto.randomUUID()}.${extension}`;
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
        if (!isLandingContent(landing.template_key, nextContent)) {
          const { error: removeError } = await supabase.storage.from("gl-landing-images").remove([storagePath]);
          if (removeError) {
            console.error("No se pudo limpiar una imagen no vinculada a la landing:", removeError.message);
          }
          setErrorMessage("La imagen no pudo asociarse al contenido de esta plantilla.");
          uploadFailed = true;
          break;
        }

        const saved = await updateLanding({ content: nextContent });
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
    if (!landing) {
      return;
    }
    const images = getImages(content);
    if (typeof images[index] !== "string") {
      return;
    }

    const imageUrl = images[index];
    const nextContent = removeAtPath(content, ["imagenes", index]);
    if (!isLandingContent(landing.template_key, nextContent)) {
      setErrorMessage("No se pudo validar la imagen seleccionada.");
      return;
    }
    const saved = await updateLanding({ content: nextContent });
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

  const backLink = (
    <Link
      className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      href="/dashboard/configuration"
    >
      <ArrowLeft className="size-4" />
      Volver a landing pages
    </Link>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <p className="text-muted-foreground">Cargando landing…</p>
      </div>
    );
  }

  const previewHost = landing?.custom_domain ?? `${landing?.slug}.gamalink.online`;
  const templateLabel =
    TEMPLATE_OPTIONS.find((template) => template.key === landing?.template_key)?.label ?? landing?.template_key;

  return (
    <div className="flex flex-col gap-6">
      {backLink}

      {landing ? (
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-semibold text-2xl">{landing.slug}</h1>
            <p className="text-muted-foreground">
              {companyName ? `${companyName} · ` : ""}
              {templateLabel} · {landing.status === "published" ? "Publicada" : "Borrador"}
            </p>
          </div>
          {landing.status === "published" ? (
            <a
              className="inline-flex items-center gap-2 text-primary text-sm hover:underline"
              href={`https://${previewHost}`}
              rel="noreferrer"
              target="_blank"
            >
              Ver publicada <ExternalLink className="size-4" />
            </a>
          ) : null}
        </header>
      ) : null}

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

      {landing && isLandingContent(landing.template_key, content) ? (
        <section className="space-y-6 rounded-xl border bg-card p-4 md:p-6">
          <p className="text-muted-foreground text-sm">
            La plantilla controla el diseño; aquí solo cambias el contenido.
          </p>

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
            {landing.status === "published" ? (
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
