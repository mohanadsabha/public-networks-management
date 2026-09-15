import { useTranslation } from "react-i18next";
import { Heading, Text } from "@/components/ui/typography";

interface PlaceholderPageProps {
  titleKey: string;
}

export function PlaceholderPage({ titleKey }: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Heading as="h1">{t(titleKey)}</Heading>
      <Text muted>{t("pages.underDevelopment")}</Text>
    </div>
  );
}
