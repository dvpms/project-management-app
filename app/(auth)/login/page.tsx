import type { Metadata } from "next";
import { signInWithGoogleAction } from "@/actions/auth-actions";
import { Badge, Button, Card, CardContent, Icon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Masuk — Space Kanban",
  description: "Masuk dengan akun Google untuk mengelola proyek dan tugas harian.",
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md rounded-3xl p-4">
      <CardContent className="flex flex-col items-center gap-6 py-8 text-center">
        <Badge variant="primary" mono>
          WORKSPACE PRIBADI
        </Badge>

        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-primary-lip border-b-[5px] bg-primary text-on-primary">
          <Icon name="view_kanban" size="xl" />
        </div>

        <div>
          <h1 className="font-display text-[30px] font-extrabold leading-9 tracking-[-0.02em] text-ink">
            Space Kanban
          </h1>
          <p className="mt-2 font-sans text-[14px] font-medium leading-5 text-ink-muted">
            Santai &amp; Fokus. Kelola banyak proyek dan tugas harianmu secara
            sinkron dalam satu layar solid.
          </p>
        </div>

        <form action={signInWithGoogleAction} className="w-full">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full"
            leftIcon={<Icon name="login" size="md" />}
          >
            Masuk dengan Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
