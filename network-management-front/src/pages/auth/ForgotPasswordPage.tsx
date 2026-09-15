import { AuthLayout } from "@/components/layout";
import { ForgotPasswordForm } from "@/components/pages/auth";
import { Card } from "@/components/ui/cards";

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Card className="w-full border-border/60 p-6 shadow-dropdown sm:p-8 md:p-10">
        <ForgotPasswordForm />
      </Card>
    </AuthLayout>
  );
}
