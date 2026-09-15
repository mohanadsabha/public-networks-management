import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AllInvoicesTable } from "@/components/pages/finance";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { SearchField } from "@/components/ui/data";
import { Heading, Text } from "@/components/ui/typography";
import { useInvoicesListQuery } from "@/hooks/useInvoices";

export function InvoicesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useInvoicesListQuery(page, search);

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 50;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/finance"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span>
          {t("finance.invoices.backToFinance")}
        </Link>
        <Heading as="h1">{t("finance.invoices.title")}</Heading>
        <Text muted className="mt-2 max-w-3xl">
          {t("finance.invoices.subtitle")}
        </Text>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder={t("finance.invoices.searchPlaceholder")}
            ariaLabel={t("finance.invoices.search")}
            className="sm:max-w-sm"
          />
          <Text muted className="text-sm">
            {t("finance.invoices.count", { count: total })}
          </Text>
        </div>

        {isLoading ? (
          <LoadingState variant="section" />
        ) : isError ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
            <Text muted>{t("common.unexpectedError")}</Text>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
            <Text muted>{t("finance.invoices.empty")}</Text>
            <Text muted className="mt-2 text-sm">{t("finance.invoices.emptyHint")}</Text>
          </div>
        ) : (
          <AllInvoicesTable rows={rows} />
        )}

        {total > limit ? (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("finance.invoices.previous")}
            </Button>
            <Text muted className="self-center text-sm">
              {t("finance.invoices.pageOf", { page, total: totalPages })}
            </Text>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("finance.invoices.next")}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
