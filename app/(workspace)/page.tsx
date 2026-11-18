import Link from "next/link";
import { Badge, Card, CardContent, Icon } from "@/components/ui";

export default function DashboardPage() {
  return (
    <Card className="rounded-3xl p-6">
      <CardContent className="flex flex-col items-start gap-4 py-4">
        <Badge variant="primary" mono>
          PHASE 1 AKTIF
        </Badge>
        <h1 className="font-display text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-ink">
          Dashboard Space Kanban
        </h1>
        <p className="max-w-xl font-sans text-[14px] font-medium leading-6 text-ink-muted">
          Fondasi database PostgreSQL, autentikasi Google OAuth, dan pengaturan
          tema/workspace sudah terpasang. Papan Space Kanban dan Proyek Aktif
          akan diisi pada Phase 2 &amp; Phase 3.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/prototype"
            className="inline-flex h-10 items-center gap-2 rounded-2xl border-2 border-primary-lip border-b-[5px] bg-primary px-4 font-display text-[14px] font-bold text-on-primary transition-all duration-100 hover:bg-primary-hover active:translate-y-[3px] active:border-b-2"
          >
            <Icon name="preview" size="sm" />
            Lihat Prototipe Interaktif
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
