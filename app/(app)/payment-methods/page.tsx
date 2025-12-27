'use client';

import { usePaymentMethods } from '@/features/payment-methods/hooks/usePaymentMethods';
import { PaymentMethodList } from '@/features/payment-methods/ui/payment-method-list';
import { PaymentMethodListSkeleton } from '@/features/payment-methods/ui/payment-method-list-skeleton';
import { PageHeader } from '@/shared/ui/page-header';
import { PageContainer } from '@/shared/ui/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/utils/error-messages';

/**
 * Página de administración de formas de pago
 */
export default function PaymentMethodsPage() {
  const { data: paymentMethods, isLoading, error } = usePaymentMethods();

  const friendlyErrorMessage = getFriendlyErrorMessage(error);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formas de pago"
        description="Gestiona las formas de pago para tus movimientos"
      />

      <PageContainer
        isLoading={isLoading}
        error={error}
        errorMessage={friendlyErrorMessage}
        loadingSkeleton={<PaymentMethodListSkeleton />}
      >
        <PaymentMethodList paymentMethods={paymentMethods || []} showCreateButton />
      </PageContainer>
    </div>
  );
}
