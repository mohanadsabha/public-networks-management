import { AuthLayout } from "@/components/layout";
import { LoginForm } from "@/components/pages/auth";
import { Card } from "@/components/ui/cards";

export function LoginPage() {
  return (
    <AuthLayout>
      <Card className="w-full border-border/60 p-6 shadow-dropdown sm:p-8 md:p-10">
        <LoginForm />
      </Card>
    </AuthLayout>
  );
}
