"use client";

import { useAuth } from "@/lib/auth-context";
import { ReportDialog } from "@/components/ui/report-dialog";

export function ArtistReportControl({ ownerUserId }: { ownerUserId: string }) {
  const { user } = useAuth();

  if (!user || user.id === ownerUserId) {
    return null;
  }

  return (
    <ReportDialog
      tipo="USUARIO"
      referenciaId={ownerUserId}
      triggerLabel="Denunciar"
    />
  );
}
