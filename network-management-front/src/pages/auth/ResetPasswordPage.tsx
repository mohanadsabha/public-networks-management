import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout";
import { InvalidResetToken, ResetPasswordForm } from "@/components/pages/auth";
import { Card } from "@/components/ui/cards";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  return (
    <AuthLayout>
      <Card className="w-full border-border/60 p-6 shadow-dropdown sm:p-8 md:p-10">
        {token ? <ResetPasswordForm token={token} /> : <InvalidResetToken />}
      </Card>
    </AuthLayout>
  );
}
