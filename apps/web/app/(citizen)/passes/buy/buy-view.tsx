"use client";

import { formatMoney, PassDto, PassTypeDto } from "@aptransit/shared";
import { Button, Card, EmptyState, ErrorState, Skeleton, ToneChip, toast } from "@aptransit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FlaskConical, HeartHandshake, Ticket, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { api, errorKey, isApiError } from "../../../../lib/api";
import { usePayment } from "../../../../lib/payments";
import { queryKeys } from "../../../../lib/query-keys";
import { serviceList } from "../../../../lib/service-list";

const PassTypes = z.array(PassTypeDto);

/**
 * /passes/buy (D-036): one card per pass with its price, validity, who it is for and one Buy
 * button. Demo prices carry a chip. The school pass goes through its eligibility flow first.
 */
export function BuyPassView() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const payment = usePayment();
  const [buying, setBuying] = useState<string | null>(null);

  const typesQuery = useQuery({
    queryKey: queryKeys.passTypes,
    queryFn: ({ signal }) => api("/pass-types", { schema: PassTypes, signal, redirectOn401: false }),
  });

  const create = useMutation({
    mutationFn: (passTypeId: string) => api("/passes", { method: "POST", body: { passTypeId }, schema: PassDto }),
  });

  const pick = (p: { nameEn: string; nameTe: string }) => (locale === "te" ? p.nameTe : p.nameEn);

  if (typesQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4" aria-busy="true">
        <span className="sr-only" role="status">
          {t("common.loading")}
        </span>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (typesQuery.isError || !typesQuery.data) {
    return (
      <ErrorState
        headingLevel="h1"
        title={t("passBuy.errorTitle")}
        message={t(errorKey(typesQuery.error, (k) => t.has(k)))}
        requestId={isApiError(typesQuery.error) ? typesQuery.error.requestId : undefined}
        retryLabel={t("common.retry")}
        onRetry={() => void typesQuery.refetch()}
      />
    );
  }

  const paid = typesQuery.data.filter((type) => type.kind !== "FREE_TRAVEL");
  const free = typesQuery.data.find((type) => type.kind === "FREE_TRAVEL");
  const busy = create.isPending || payment.state.phase === "working" || payment.state.phase === "checking";
  const failure = create.error ? t(errorKey(create.error, (k) => t.has(k))) : payment.state.errorKey ? t(payment.state.errorKey) : null;

  const buy = async (type: PassTypeDto) => {
    setBuying(type.id);
    let pass: PassDto;
    try {
      pass = await create.mutateAsync(type.id);
    } catch {
      return;
    }
    await payment.pay({
      passId: pass.id,
      name: t("passBuy.paymentName"),
      description: t("passBuy.paymentDescription", { name: pick(type) }),
      onConfirmed: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.passes });
        toast.success(t("passBuy.done"));
        router.push("/passes");
      },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <h1 className="text-h1 text-fg">{t("passBuy.title")}</h1>
      <p className="text-body text-muted">{t("passBuy.intro")}</p>

      {failure && (
        <p role="alert" className="text-small text-status-danger">
          {failure}
        </p>
      )}

      {paid.length === 0 && !free ? (
        <EmptyState icon={Ticket} headingLevel="h2" title={t("passBuy.emptyTitle")} hint={t("passBuy.emptyHint")} />
      ) : (
        <ul className="flex flex-col gap-3" aria-label={t("passBuy.choose")}>
          {paid.map((type) => {
            const name = pick(type);
            const amount = formatMoney(type.pricePaise, locale);
            return (
              <li key={type.id}>
                <Card padding="md" className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-h3 text-fg">{name}</h2>
                    <span className="text-h3 tabular-nums text-fg">{amount}</span>
                  </div>
                  {type.isDemo && <ToneChip tone="warning" size="sm" icon={FlaskConical} label={t("passBuy.demoPrice")} className="self-start" />}
                  <p className="text-body text-fg">{t(`passBuy.forWho.${type.kind}`)}</p>
                  <p className="text-small text-muted">
                    {type.validityMode === "UNTIL_DAY_END" ? t("passBuy.validityDay") : t("passBuy.validity", { days: type.durationDays })}
                  </p>
                  {type.groupSize > 1 && (
                    <p className="flex items-center gap-2 text-small text-fg">
                      <Users className="size-4 shrink-0" aria-hidden="true" />
                      {t("passBuy.covers", { count: type.groupSize })}
                    </p>
                  )}
                  <p className="text-small text-muted">{t("passBuy.services", { services: serviceList(type.eligibleServiceTypes, t, locale) })}</p>
                  {type.routeRestricted ? (
                    <Button asChild variant="secondary" className="mt-2">
                      <Link href="/passes/school">
                        {t("passBuy.schoolCta")}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="mt-2"
                      aria-label={t("passBuy.buyLabel", { name, amount })}
                      loading={busy && buying === type.id}
                      disabled={busy && buying !== type.id}
                      onClick={() => void buy(type)}
                    >
                      {t("passBuy.buy", { amount })}
                    </Button>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {paid.some((type) => type.isDemo) && <p className="text-small text-muted">{t("passBuy.demoNote")}</p>}

      {free && (
        <Card padding="md" className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-h3 text-fg">
            <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
            {t("passBuy.freeTitle")}
          </h2>
          <p className="text-small text-muted">{t("passBuy.freeHint")}</p>
          <Button asChild variant="secondary">
            <Link href="/free-travel">
              {t("passBuy.freeCta")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
