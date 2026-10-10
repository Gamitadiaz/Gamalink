"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChevronRight, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cloneDefaultContent, type LandingRow, type LandingTemplateKey, TEMPLATE_OPTIONS } from "@/lib/landings/model";
import { isSuperadminUserId } from "@/lib/landings/superadmin";
import { supabase } from "@/lib/sb/supabase_config";

import { describeLandingError, isValidSlug, LANDING_COLUMNS, slugify } from "./landing-utils";

type CompanyOption = { id: string; name: string };

export function LandingList() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [landings, setLandings] = useState<LandingRow[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<LandingTemplateKey>("bold-red");
  const [newSlug, setNewSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      return;
    }

    let cancelled = false;
    const loadLandings = async () => {
      setLoading(true);
      setErrorMessage("");
      setLandings([]);
      const { data, error } = await supabase
        .from("gl_landings")
        .select(LANDING_COLUMNS)
        .eq("empresa_id", companyId)
        .order("updated_at", { ascending: false });

      if (cancelled) {
        return;
      }
      if (error) {
        setErrorMessage(`No se pudieron cargar las landing pages: ${error.message}`);
      } else {
        setLandings(data ?? []);
      }
      setLoading(false);
    };

    void loadLandings();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const createLanding = async () => {
    if (!companyId || !isValidSlug(newSlug)) {
      setErrorMessage("Escribe un subdominio válido para crear la landing.");
      return;
    }
    setSaving(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from("gl_landings")
      .insert({
        empresa_id: companyId,
        template_key: newTemplate,
        slug: newSlug,
        content: cloneDefaultContent(newTemplate),
      })
      .select("id")
      .single();

    if (error) {
      setErrorMessage(`No se pudo crear la landing: ${describeLandingError(error)}`);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/configuration/${data.id}`);
  };

  if (loading && companies.length === 0) {
    return <p className="text-muted-foreground">Cargando landing pages…</p>;
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

      {selectedCompany ? (
        <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg">
                {isSuperadmin ? `Landing pages de ${selectedCompany.name}` : "Tus landing pages"}
              </h2>
              <p className="text-muted-foreground text-sm">Selecciona una landing para editar su contenido.</p>
            </div>
            {isSuperadmin && !showCreate ? (
              <Button onClick={() => setShowCreate(true)} size="sm" type="button" variant="outline">
                <Plus />
                Nueva landing
              </Button>
            ) : null}
          </div>

          {loading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}

          {!loading && landings.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {landings.map((landing) => (
                <Link
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-primary hover:bg-muted/50"
                  href={`/dashboard/configuration/${landing.id}`}
                  key={landing.id}
                >
                  <span>
                    <span className="block font-medium">{landing.slug}</span>
                    <span className="block text-muted-foreground text-xs">
                      {TEMPLATE_OPTIONS.find((template) => template.key === landing.template_key)?.label ??
                        landing.template_key}
                      {" · "}
                      {landing.status === "published" ? "Publicada" : "Borrador"}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : null}

          {!loading && landings.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {isSuperadmin ? "Esta empresa aún no tiene landing pages." : "Aún no tienes landing pages."}
            </p>
          ) : null}

          {isSuperadmin && showCreate ? (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">Nueva landing</h3>
                  <p className="text-muted-foreground text-sm">Se creará como borrador para {selectedCompany.name}.</p>
                </div>
                <Button
                  aria-label="Cancelar"
                  onClick={() => setShowCreate(false)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <X />
                </Button>
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
                      placeholder={slugify(selectedCompany.name)}
                      value={newSlug}
                    />
                    <span className="shrink-0 text-muted-foreground text-sm">.gamalink.online</span>
                  </div>
                </div>
              </div>
              <Button disabled={saving} onClick={createLanding} type="button">
                <Plus />
                Crear borrador
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
