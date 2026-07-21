"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportMyData } from "@/app/actions/settings";

export function ExportDataButton() {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await exportMyData();
      if (result.error || !result.data) {
        toast.error(result.error ?? "L'export a échoué.");
        return;
      }

      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dentmatch-donnees.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Vos données ont été téléchargées.");
    });
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isPending}>
      <Download aria-hidden="true" />
      {isPending ? "Préparation…" : "Exporter mes données"}
    </Button>
  );
}
