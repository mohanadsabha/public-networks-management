import { Building2, ExternalLink, Gauge, Hash, Phone, User, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomerKindBadge } from "@/components/pages/customers/CustomerKindBadge";
import { buttonBaseClassName, buttonSizes, buttonVariants } from "@/components/ui/buttons/buttonStyles";
import { ProfileHero } from "@/components/ui/profile";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/typography";
import { customerOwesMoney, getCustomerKind } from "@/lib/customerUtils";
import { formatMoney } from "@/lib/formatMoney";
import { subscriberProfilePath } from "@/lib/routePaths";
import { buildSpeedLabel, getSubscriberInitials } from "@/lib/subscriberUtils";
import type { Customer } from "@/types/customer";

interface CustomerProfileHeaderProps {
  customer: Customer;
  poolSpeedMbps?: number | null;
  expiring?: boolean;
  onSubscribersList?: boolean;
  stoppedWithNoDebt?: boolean;
}

export function CustomerProfileHeader({
  customer,
  poolSpeedMbps = null,
  expiring = false,
  onSubscribersList = false,
  stoppedWithNoDebt = false,
}: CustomerProfileHeaderProps) {
  const { t } = useTranslation();
  const kind = getCustomerKind(customer);
  const owesMoney = customerOwesMoney(customer);
  const hasUsername = Boolean(customer.username);
  const showSubscriberLink = hasUsername && !customer.isSuspended;

  const banner = (() => {
    if (stoppedWithNoDebt) {
      return <Text className="text-sm text-muted-foreground">{t("customers.profile.stoppedNoDebt")}</Text>;
    }
    if (expiring) {
      return (
        <Text className="text-sm text-muted-foreground">
          {t("customers.profile.expiringHint")}{" "}
          <Link to="/expiring" className="font-medium text-foreground underline-offset-2 hover:underline">
            {t("nav.items.expiring")}
          </Link>
        </Text>
      );
    }
    if (showSubscriberLink && onSubscribersList) {
      return <Text className="text-sm text-muted-foreground">{t("customers.profile.subscriberHint")}</Text>;
    }
    return undefined;
  })();

  const actions = showSubscriberLink ? (
    <Link
      to={subscriberProfilePath(customer.lineId, "stats")}
      className={cn(buttonBaseClassName, buttonVariants.outline, buttonSizes.sm)}
    >
      <ExternalLink className="h-4 w-4" />
      {t("customers.actions.viewSubscription")}
    </Link>
  ) : undefined;

  return (
    <ProfileHero
      backTo="/customers"
      backLabel={t("customers.profile.backToList")}
      initials={getSubscriberInitials(customer.fullName)}
      name={customer.fullName}
      badge={<CustomerKindBadge kind={kind} />}
      actions={actions}
      banner={banner}
      items={[
        {
          icon: Hash,
          label: t("subscribers.table.lineId"),
          value: customer.lineId,
          dir: "ltr",
          mono: true,
        },
        {
          icon: User,
          label: t("subscribers.table.username"),
          value: customer.username ?? t("customers.profile.noUsername"),
          dir: customer.username ? "ltr" : undefined,
          mono: Boolean(customer.username),
          valueClassName: customer.username ? undefined : "text-muted-foreground font-normal",
        },
        {
          icon: Phone,
          label: t("subscribers.table.phone"),
          value: customer.phone?.trim() || "—",
          dir: customer.phone ? "ltr" : undefined,
          mono: Boolean(customer.phone),
          valueClassName: customer.phone ? undefined : "text-muted-foreground font-normal",
        },
        {
          icon: Gauge,
          label: t("customers.assign.currentSpeed"),
          value: poolSpeedMbps ? buildSpeedLabel(poolSpeedMbps) : "—",
          valueClassName: poolSpeedMbps ? undefined : "text-muted-foreground font-normal",
        },
        {
          icon: Building2,
          label: t("customers.form.facilityType"),
          value: customer.facilityType?.trim() || "—",
          valueClassName: customer.facilityType ? undefined : "text-muted-foreground font-normal",
        },
        {
          icon: Wallet,
          label: t("customers.balance.currentBalance"),
          value: formatMoney(customer.balance),
          dir: "ltr",
          valueClassName: owesMoney ? "text-destructive" : undefined,
        },
      ]}
    />
  );
}
