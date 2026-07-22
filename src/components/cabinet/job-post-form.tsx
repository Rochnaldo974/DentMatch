"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  Eye,
  MapPin,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createJobPost, updateJobPost } from "@/app/actions/job-posts";
import { inviteCandidateToJobPost } from "@/app/actions/candidates";
import { jobPostSchema, type JobPostInput } from "@/lib/validation/job-post";
import {
  COMPENSATION_GUIDANCE,
  COMPENSATION_TYPES,
  CONTRACT_TYPES,
  EQUIPMENT,
  EXPERIENCE_LEVELS,
  LANGUAGES_SUGGESTIONS,
  REPLACEMENT_REASONS,
  REPLACEMENT_TYPES,
  SPECIALTIES,
  WORKING_DAYS,
} from "@/lib/data/reference";

const NONE = "__none__";

function optionLabel(
  options: { value: string; label: string }[],
  value: string | undefined | null,
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}

function previewDate(date: string | undefined): string | null {
  if (!date) return null;
  return format(new Date(date), "d MMMM yyyy", { locale: fr });
}

/** Rendu de l'annonce telle qu'un remplaçant la verrait. */
function JobPostPreview({
  values,
  city,
}: {
  values: JobPostInput;
  city: string | null;
}) {
  const specialtyLabel = optionLabel(SPECIALTIES, values.specialtyCode);
  const compensationLabel = optionLabel(
    COMPENSATION_TYPES,
    values.compensationType,
  );

  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">
            {values.title || "Annonce sans titre"}
          </h3>
          {values.urgent ? (
            <Badge
              variant="outline"
              className="border-warning/40 bg-warning-soft font-medium text-warning-foreground"
            >
              Urgent
            </Badge>
          ) : null}
          <Badge variant="secondary">
            {optionLabel(CONTRACT_TYPES, values.contractType)}
          </Badge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          {city ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {city}
            </span>
          ) : null}
          {values.startDate ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              Du {previewDate(values.startDate)}
              {values.endDate ? ` au ${previewDate(values.endDate)}` : null}
            </span>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <p>
          <span className="text-muted-foreground">Motif : </span>
          {optionLabel(REPLACEMENT_REASONS, values.replacementReason) ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Type : </span>
          {optionLabel(REPLACEMENT_TYPES, values.replacementType) ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Temps de travail : </span>
          {values.fullTime ? "Temps plein" : "Temps partiel"}
        </p>
        <p>
          <span className="text-muted-foreground">Postes : </span>
          {values.positionsCount}
        </p>
        {values.workingDays.length > 0 ? (
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Jours travaillés : </span>
            {values.workingDays
              .map((d) => optionLabel(WORKING_DAYS, d))
              .join(", ")}
          </p>
        ) : null}
        {values.scheduleText ? (
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Horaires : </span>
            {values.scheduleText}
          </p>
        ) : null}
        {values.applicationDeadline ? (
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">
              Candidatures jusqu&apos;au :{" "}
            </span>
            {previewDate(values.applicationDeadline)}
          </p>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-semibold">Profil recherché</h4>
        <p>
          <span className="text-muted-foreground">Spécialité : </span>
          {specialtyLabel ?? "Aucune spécialité exigée"}
        </p>
        {values.experienceRequired ? (
          <p>
            <span className="text-muted-foreground">Expérience : </span>
            {optionLabel(EXPERIENCE_LEVELS, values.experienceRequired)}
          </p>
        ) : null}
        {values.expectedProcedures ? (
          <p>
            <span className="text-muted-foreground">Actes attendus : </span>
            {values.expectedProcedures}
          </p>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-semibold">Rémunération</h4>
        <p>
          {compensationLabel ?? "—"}
          {values.compensationValue !== undefined &&
          values.compensationValue !== null
            ? ` — ${values.compensationValue}`
            : null}
        </p>
        {values.compensationDetails ? (
          <p className="text-muted-foreground">{values.compensationDetails}</p>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-semibold">Conditions</h4>
        <p>
          <span className="text-muted-foreground">Hébergement : </span>
          {values.accommodationProvided ? "Proposé" : "Non proposé"}
        </p>
        <p>
          <span className="text-muted-foreground">Transport : </span>
          {values.travelCovered ? "Pris en charge" : "Non pris en charge"}
        </p>
        {values.equipment.length > 0 ? (
          <p>
            <span className="text-muted-foreground">Équipements : </span>
            {values.equipment.map((e) => optionLabel(EQUIPMENT, e)).join(", ")}
          </p>
        ) : null}
        {values.software ? (
          <p>
            <span className="text-muted-foreground">Logiciel : </span>
            {values.software}
          </p>
        ) : null}
        {values.languages.length > 0 ? (
          <p>
            <span className="text-muted-foreground">Langues : </span>
            {values.languages.join(", ")}
          </p>
        ) : null}
        {values.practicalInfo ? (
          <p className="text-muted-foreground">{values.practicalInfo}</p>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-semibold">Description</h4>
        <p className="whitespace-pre-line">
          {values.description || "Aucune description pour le moment."}
        </p>
      </div>
    </div>
  );
}

/**
 * Formulaire de création / modification d'une annonce de remplacement.
 * Réutilisé par /cabinet/annonces/nouvelle et /cabinet/annonces/[id]/modifier.
 */
export function JobPostForm({
  defaultValues,
  jobPostId,
  cabinetCity,
  invite,
}: {
  defaultValues?: Partial<JobPostInput>;
  jobPostId?: string;
  cabinetCity?: string | null;
  /** Candidat à inviter automatiquement dès la publication de l'annonce. */
  invite?: { userId: string; name: string };
}) {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<JobPostInput>({
    resolver: zodResolver(jobPostSchema) as unknown as Resolver<JobPostInput>,
    defaultValues: {
      title: "",
      replacedPractitioner: "",
      replacementReason: "",
      contractType: "liberal",
      replacementType: "",
      startDate: "",
      endDate: "",
      workingDays: [],
      scheduleText: "",
      fullTime: true,
      specialtyCode: "",
      expectedProcedures: "",
      experienceRequired: "",
      compensationType: "",
      compensationValue: undefined,
      compensationDetails: "",
      accommodationProvided: false,
      travelCovered: false,
      urgent: false,
      positionsCount: 1,
      applicationDeadline: "",
      description: "",
      practicalInfo: "",
      equipment: [],
      software: "",
      languages: [],
      ...defaultValues,
    },
  });

  const { isSubmitting } = form.formState;

  // Fourchettes indicatives selon le type de rémunération sélectionné.
  const compensationType = form.watch("compensationType");
  const compensationGuidance = COMPENSATION_GUIDANCE[compensationType];
  const showCompensationValue =
    compensationType !== "a_discuter";

  async function submit(values: JobPostInput, publish: boolean) {
    const result = jobPostId
      ? await updateJobPost(jobPostId, values, publish)
      : await createJobPost(values, publish);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Invitation automatique du candidat à la publication (flux guidé).
    if (invite && publish && result.jobPostId) {
      const invitation = await inviteCandidateToJobPost(
        result.jobPostId,
        invite.userId,
      );
      if (invitation.error) {
        toast.warning(
          `Annonce publiée, mais l'invitation n'a pas pu être envoyée : ${invitation.error}`,
        );
      } else {
        toast.success(
          `Annonce publiée. Invitation envoyée à ${invite.name}.`,
        );
      }
    } else if (invite && !publish) {
      toast.success(
        `Annonce enregistrée en brouillon. ${invite.name} sera à inviter après publication (depuis « Trouver un remplaçant »).`,
      );
    } else {
      toast.success(
        publish
          ? "Annonce publiée. Elle est désormais visible par les remplaçants."
          : "Annonce enregistrée en brouillon.",
      );
    }
    router.push("/cabinet/annonces");
    router.refresh();
  }

  function generateTitle() {
    const specialtyLabel =
      optionLabel(SPECIALTIES, form.getValues("specialtyCode")) ??
      "Chirurgien-dentiste";
    const title = cabinetCity
      ? `Remplacement ${specialtyLabel} — ${cabinetCity}`
      : `Remplacement ${specialtyLabel}`;
    form.setValue("title", title, { shouldValidate: true });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => submit(values, false))}
        className="space-y-6"
        noValidate
      >
        {/* --------------------------- Le remplacement --------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Le remplacement</CardTitle>
            <CardDescription>
              Les informations essentielles de votre besoin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l&apos;annonce</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Remplacement Omnipratique — votre ville"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateTitle}
                    >
                      <Sparkles aria-hidden />
                      Générer
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="replacedPractitioner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Praticien remplacé (facultatif)</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr Martin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="replacementReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif du remplacement</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez un motif" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REPLACEMENT_REASONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="replacementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de remplacement</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REPLACEMENT_TYPES.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut proposé</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6 pt-1"
                      >
                        {CONTRACT_TYPES.map((o) => (
                          <FormItem
                            key={o.value}
                            className="flex items-center gap-2"
                          >
                            <FormControl>
                              <RadioGroupItem value={o.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {o.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="urgent"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Besoin urgent</FormLabel>
                    <FormDescription>
                      L&apos;annonce sera mise en avant avec un badge « Urgent ».
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* -------------------------- Dates et horaires -------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Dates et horaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date limite de candidature</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="workingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jours travaillés</FormLabel>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                    {WORKING_DAYS.map((day) => (
                      <label
                        key={day.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={field.value.includes(day.value)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, day.value]
                                : field.value.filter((v) => v !== day.value),
                            )
                          }
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="scheduleText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horaires (facultatif)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Ex. : 9h–12h30 / 14h–18h, samedi matin uniquement"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="fullTime"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <FormLabel>Temps plein</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="positionsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de postes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 1
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --------------------------- Profil recherché --------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Profil recherché</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="specialtyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spécialité (facultatif)</FormLabel>
                  <Select
                    value={field.value || NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Aucune spécialité exigée" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>
                        Aucune spécialité exigée
                      </SelectItem>
                      {SPECIALTIES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Une spécialité restreint les candidatures selon le statut du
                    remplaçant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="expectedProcedures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actes attendus (facultatif)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Ex. : soins conservateurs, prothèses, urgences"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experienceRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expérience souhaitée (facultatif)</FormLabel>
                    <Select
                      value={field.value || NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Indifférent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Indifférent</SelectItem>
                        {EXPERIENCE_LEVELS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------ Rémunération ----------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Rémunération</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="compensationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de rémunération</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPENSATION_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showCompensationValue ? (
              <FormField
                control={form.control}
                name="compensationValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Ex. : 50"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      {compensationGuidance ? (
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {compensationGuidance.unit}
                        </span>
                      ) : null}
                    </div>
                    {compensationGuidance ? (
                      <p className="text-xs text-muted-foreground">
                        {compensationGuidance.market}
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control}
              name="compensationDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Précisions (facultatif)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex. : rétrocession négociable"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ------------------------------- Conditions ------------------------------ */}
        <Card>
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="accommodationProvided"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Hébergement proposé</FormLabel>
                      <FormDescription>
                        Logement mis à disposition du remplaçant.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelCovered"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Transport pris en charge</FormLabel>
                      <FormDescription>
                        Frais de déplacement remboursés.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="practicalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informations pratiques (facultatif)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Accès, stationnement, restauration à proximité…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Équipements du cabinet</FormLabel>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                    {EQUIPMENT.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={field.value.includes(item.value)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, item.value]
                                : field.value.filter((v) => v !== item.value),
                            )
                          }
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="software"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logiciel du cabinet (facultatif)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex. : Logos, Julie…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langues utiles</FormLabel>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                      {LANGUAGES_SUGGESTIONS.map((lang) => (
                        <label
                          key={lang}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={field.value.includes(lang)}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked
                                  ? [...field.value, lang]
                                  : field.value.filter((v) => v !== lang),
                              )
                            }
                          />
                          {lang}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------- Description ----------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Présentez le remplacement, la patientèle et l&apos;organisation du
              cabinet (20 caractères minimum).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">
                    Description de l&apos;annonce
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Décrivez le contexte du remplacement, l'équipe, la patientèle…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* --------------------------------- Actions -------------------------------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" variant="outline" disabled={isSubmitting}>
            <Save aria-hidden />
            {isSubmitting ? "Enregistrement…" : "Enregistrer en brouillon"}
          </Button>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                <Eye aria-hidden />
                Aperçu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Aperçu de l&apos;annonce</DialogTitle>
                <DialogDescription>
                  Voici comment un remplaçant verra votre annonce.
                </DialogDescription>
              </DialogHeader>
              {previewOpen ? (
                <JobPostPreview
                  values={form.getValues()}
                  city={cabinetCity ?? null}
                />
              ) : null}
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            trigger={
              <Button type="button" disabled={isSubmitting}>
                <Send aria-hidden />
                {jobPostId ? "Enregistrer et publier" : "Publier l'annonce"}
              </Button>
            }
            title="Publier cette annonce ?"
            description="L'annonce sera visible par les remplaçants et pourra recevoir des candidatures."
            confirmLabel="Publier"
            onConfirm={async () => {
              await form.handleSubmit((values) => submit(values, true))();
            }}
          />
        </div>
      </form>
    </Form>
  );
}
