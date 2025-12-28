'use client';

import { useState } from 'react';
import { PageHeader } from '@/shared/ui/page-header';
import { PageContainer } from '@/shared/ui/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/utils/error-messages';
import { useRecurringRules } from '@/features/recurring/hooks/useRecurringRules';
import { RecurringRulesList } from '@/features/recurring/ui/recurring-rules-list';
import { RecurringRulesSkeleton } from '@/features/recurring/ui/recurring-rules-skeleton';
import { useRecurringRuleMutations } from '@/features/recurring/hooks/useRecurringRuleMutations';
import { Month } from '@/shared/lib/date';
import { RecurringGenerateCard } from '@/features/recurring/ui/recurring-generate-card';

export default function RecurringPage() {
  const { data: rules, isLoading, error } = useRecurringRules();
  const { generateRecurringTransactions } = useRecurringRuleMutations();
  const [targetMonth, setTargetMonth] = useState(Month.current().toString());

  const friendlyError = getFriendlyErrorMessage(error);
  const generateError = getFriendlyErrorMessage(generateRecurringTransactions.error);

  const handleGenerate = () => {
    if (targetMonth) {
      generateRecurringTransactions.mutate(targetMonth);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurrentes"
        description="Configura ingresos o egresos que se repiten cada mes y genera las transacciones automáticamente."
      />

      <RecurringGenerateCard
        month={targetMonth}
        onMonthChange={setTargetMonth}
        onGenerate={handleGenerate}
        isLoading={generateRecurringTransactions.isPending}
        errorMessage={generateError}
      />

      <PageContainer
        isLoading={isLoading}
        error={error}
        errorMessage={friendlyError}
        loadingSkeleton={<RecurringRulesSkeleton />}
      >
        <RecurringRulesList rules={rules ?? []} />
      </PageContainer>
    </div>
  );
}
