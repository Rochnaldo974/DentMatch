"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveReplacementStep3 } from "@/app/actions/onboarding-remplacant";
import {
  qualifiedDentistStep3Schema,
  studentStep3Schema,
  residentStep3Schema,
  type QualifiedDentistStep3Input,
  type StudentStep3Input,
  type ResidentStep3Input,
} from "@/lib/validation/onboarding-remplacant";
import {
  PROFESSIONAL_STATUS_LABELS,
  RESIDENT_SPECIALTIES,
  type Option,
  type ProfessionalStatus,
} from "@/lib/data/reference";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { StepFooter, StepHeader } from "./step-shell";

const PRACTICE_MODES: Option[] = [
  { value: "liberal", label: "Libéral" },
  { value: "salarie", label: "Salarié" },
  { value: "mixte", label: "Mixte" },
  { value: "remplacements_uniquement", label: "Remplacements uniquement" },
  { value: "autre", label: "Autre" },
];

const STUDENT_YEARS: Option[] = [
  { value: "5e_annee_validee", label: "5e année validée" },
  { value: "6e_annee", label: "6e année" },
];

const INTERNSHIP_YEARS: Option[] = [
  { value: "1", label: "1re année" },
  { value: "2", label: "2e année" },
  { value: "3", label: "3e année" },
  { value: "4", label: "4e année" },
];

type StepProps = {
  data: ReplacementOnboardingData;
  onBack: () => void;
  onNext: () => void;
};

export function StepParcours({
  data,
  status,
  onBack,
  onNext,
}: StepProps & { status: ProfessionalStatus }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <StepHeader
          title="Parcours professionnel"
          description="Ces informations restent confidentielles : elles servent uniquement à la vérification de votre profil."
        />
        <Badge variant="secondary">
          {PROFESSIONAL_STATUS_LABELS[status]}
        </Badge>
      </div>
      {status === "qualified_dentist" ? (
        <QualifiedForm data={data} onBack={onBack} onNext={onNext} />
      ) : status === "student" ? (
        <StudentForm data={data} onBack={onBack} onNext={onNext} />
      ) : (
        <ResidentForm data={data} onBack={onBack} onNext={onNext} />
      )}
    </div>
  );
}

/* ------------------------- Chirurgien-dentiste diplômé ------------------------ */

type QualifiedFormValues = {
  rppsNumber: string;
  ordinalNumber: string;
  ordinalDepartment: string;
  graduationYear: number | string;
  university: string;
  currentPracticeMode: string;
  hasCps: boolean;
  cpsLastDigits: string;
  rcpInsurer: string;
  rcpExpirationDate: string;
};

function QualifiedForm({ data, onBack, onNext }: StepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const rp = data.replacement;

  // Les coercitions du schéma rendent z.input différent de z.output :
  // on aligne le resolver sur les valeurs du formulaire (pattern du projet).
  const form = useForm<QualifiedFormValues>(
    {
      resolver: zodResolver(
        qualifiedDentistStep3Schema,
      ) as unknown as Resolver<QualifiedFormValues>,
      defaultValues: {
        rppsNumber: rp?.rpps_number ?? "",
        ordinalNumber: rp?.ordinal_number ?? "",
        ordinalDepartment: rp?.ordinal_department ?? "",
        graduationYear: rp?.graduation_year ?? "",
        university: rp?.university ?? "",
        currentPracticeMode: rp?.current_practice_mode ?? "",
        hasCps: rp?.has_cps ?? false,
        cpsLastDigits: rp?.cps_last_digits ?? "",
        rcpInsurer: rp?.rcp_insurer ?? "",
        rcpExpirationDate: rp?.rcp_expiration_date ?? "",
      },
    },
  );

  const hasCps = form.watch("hasCps");

  function onSubmit(values: QualifiedFormValues) {
    startTransition(async () => {
      const result = await saveReplacementStep3(
        "qualified_dentist",
        values as unknown as QualifiedDentistStep3Input,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="rppsNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro RPPS</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" maxLength={11} {...field} />
                </FormControl>
                <FormDescription>11 chiffres.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ordinalNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro ordinal (facultatif)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ordinalDepartment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conseil départemental d’inscription</FormLabel>
              <FormControl>
                <Input placeholder="Ex. : Conseil départemental de La Réunion" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année de diplôme</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1960}
                    max={new Date().getFullYear()}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Université</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="currentPracticeMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode d’exercice actuel</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisissez un mode d’exercice" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRACTICE_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
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
          name="hasCps"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card px-4 py-3">
              <div className="space-y-0.5 pr-4">
                <FormLabel>Carte CPS</FormLabel>
                <FormDescription>
                  Vous possédez une carte de professionnel de santé.
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

        {hasCps ? (
          <FormField
            control={form.control}
            name="cpsLastDigits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  4 derniers caractères de la carte CPS (facultatif)
                </FormLabel>
                <FormControl>
                  <Input maxLength={4} className="max-w-40" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="rcpInsurer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assureur RCP</FormLabel>
                <FormControl>
                  <Input placeholder="Ex. : MACSF" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rcpExpirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d’expiration RCP</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </Form>
  );
}

/* --------------------------- Étudiant autorisé à remplacer -------------------- */

type StudentFormValues = {
  university: string;
  studentYear: string;
  fifthYearValidated: boolean;
  hasCsct: boolean;
  csctDate: string;
  hospitalStatus: boolean;
  hospitalName: string;
  licenseExpirationDate: string;
};

function StudentForm({ data, onBack, onNext }: StepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const rp = data.replacement;

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(
      studentStep3Schema,
    ) as unknown as Resolver<StudentFormValues>,
    defaultValues: {
      university: rp?.university ?? "",
      studentYear: rp?.student_year ?? "",
      fifthYearValidated: rp?.fifth_year_validated ?? false,
      hasCsct: rp?.has_csct ?? false,
      csctDate: rp?.csct_date ?? "",
      hospitalStatus: rp?.hospital_status ?? false,
      hospitalName: rp?.hospital_name ?? "",
      licenseExpirationDate: rp?.license_expiration_date ?? "",
    },
  });

  const hospitalStatus = form.watch("hospitalStatus");

  function onSubmit(values: StudentFormValues) {
    startTransition(async () => {
      const result = await saveReplacementStep3(
        "student",
        values as unknown as StudentStep3Input,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Université</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année d’études</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisissez votre année" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STUDENT_YEARS.map((y) => (
                      <SelectItem key={y.value} value={y.value}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fifthYearValidated"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-snug">
                  J’ai validé ma 5e année d’études odontologiques
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasCsct"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-snug">
                  J’ai obtenu le certificat de synthèse clinique et
                  thérapeutique (CSCT)
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="csctDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d’obtention du CSCT</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="licenseExpirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Expiration de l’autorisation de remplacement
                </FormLabel>
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
          name="hospitalStatus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card px-4 py-3">
              <div className="space-y-0.5 pr-4">
                <FormLabel>Statut hospitalier</FormLabel>
                <FormDescription>
                  Vous exercez actuellement dans un établissement hospitalier.
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

        {hospitalStatus ? (
          <FormField
            control={form.control}
            name="hospitalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l’établissement</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </Form>
  );
}

/* ------------------------------ Interne en odontologie ------------------------ */

type ResidentFormValues = {
  university: string;
  residentSpecialty: string;
  internshipYear: string;
  fifthYearValidated: boolean;
  hasCsct: boolean;
  attachmentInstitution: string;
  hasExerciseAuthorization: boolean;
  licenseExpirationDate: string;
};

function ResidentForm({ data, onBack, onNext }: StepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const rp = data.replacement;

  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(
      residentStep3Schema,
    ) as unknown as Resolver<ResidentFormValues>,
    defaultValues: {
      university: rp?.university ?? "",
      residentSpecialty: rp?.resident_specialty ?? "",
      internshipYear: rp?.internship_year ?? "",
      fifthYearValidated: rp?.fifth_year_validated ?? false,
      hasCsct: rp?.has_csct ?? false,
      attachmentInstitution: rp?.attachment_institution ?? "",
      hasExerciseAuthorization: rp?.has_exercise_authorization ?? false,
      licenseExpirationDate: rp?.license_expiration_date ?? "",
    },
  });

  function onSubmit(values: ResidentFormValues) {
    startTransition(async () => {
      const result = await saveReplacementStep3(
        "resident",
        values as unknown as ResidentStep3Input,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FormField
          control={form.control}
          name="university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Université</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="residentSpecialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spécialité d’internat</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisissez votre spécialité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RESIDENT_SPECIALTIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
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
            name="internshipYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année d’internat</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisissez votre année" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTERNSHIP_YEARS.map((y) => (
                      <SelectItem key={y.value} value={y.value}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fifthYearValidated"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-snug">
                  J’ai validé ma 5e année d’études odontologiques
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasCsct"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-snug">
                  J’ai obtenu le certificat de synthèse clinique et
                  thérapeutique (CSCT)
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachmentInstitution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Établissement de rattachement</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasExerciseAuthorization"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-snug">
                  Je dispose d’une autorisation d’exercice en cours de validité
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenseExpirationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d’expiration de l’autorisation</FormLabel>
              <FormControl>
                <Input type="date" className="sm:max-w-60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </Form>
  );
}
