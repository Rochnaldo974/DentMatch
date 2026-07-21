"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { applyToJobPost } from "@/app/actions/applications";
import {
  applicationSchema,
  type ApplicationInput,
} from "@/lib/validation/application";
import { DEMO_MODE } from "@/lib/constants";

/**
 * Bouton principal « Candidater » avec Dialog de candidature.
 * La page serveur calcule `allowed`/`reason` via canApply (revérifié côté serveur).
 */
export function ApplyDialog({
  jobPostId,
  jobPostTitle,
  allowed,
  reason,
  alreadyApplied = false,
}: {
  jobPostId: string;
  jobPostTitle: string;
  allowed: boolean;
  reason?: string;
  alreadyApplied?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      message: "",
      confirmedAvailability: false,
      expectedCompensation: "",
      note: "",
      acceptTerms: false,
    } as unknown as ApplicationInput,
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ApplicationInput) {
    const result = await applyToJobPost(jobPostId, values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Candidature envoyée");
    setOpen(false);
    form.reset();
    router.refresh();
  }

  if (!allowed) {
    return (
      <div className="space-y-2">
        <Button className="w-full" disabled>
          <Send className="size-4" aria-hidden="true" />
          Candidater
        </Button>
        {reason ? (
          <p className="text-xs text-muted-foreground">{reason}</p>
        ) : null}
        {alreadyApplied ? (
          <Link
            href="/remplacant/candidatures"
            className="block text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Voir mes candidatures
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Send className="size-4" aria-hidden="true" />
          Candidater
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidater à cette annonce</DialogTitle>
          <DialogDescription>{jobPostTitle}</DialogDescription>
        </DialogHeader>

        {DEMO_MODE ? (
          <div className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning-foreground">
            Mode démonstration : les documents simulés permettent de tester le
            parcours mais ne constituent pas une vérification réelle.
          </div>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message de motivation</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Présentez-vous et expliquez pourquoi cette annonce vous intéresse…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmedAvailability"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-2.5">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal leading-snug">
                      Je confirme être disponible sur les dates de l&apos;annonce
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedCompensation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Rémunération attendue{" "}
                    <span className="font-normal text-muted-foreground">
                      (facultatif)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex. : rétrocession 50 %"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Note complémentaire{" "}
                    <span className="font-normal text-muted-foreground">
                      (facultatif)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-2.5">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal leading-snug">
                      J&apos;accepte que mes informations déclarées soient
                      transmises au cabinet pour l&apos;étude de ma candidature
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Envoi…" : "Envoyer ma candidature"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
