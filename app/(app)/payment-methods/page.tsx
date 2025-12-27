'use client';

import { usePaymentMethods } from '@/features/payment-methods/hooks/usePaymentMethods';
import { PaymentMethodList } from '@/features/payment-methods/ui/payment-method-list';
import { PaymentMethodListSkeleton } from '@/features/payment-methods/ui/payment-method-list-skeleton';
import { ErrorState } from '@/shared/ui/error-state';
import { getFriendlyErrorMessage } from '@/shared/lib/utils/error-messages';

/**
 * Página de administración de formas de pago
 */
export default function PaymentMethodsPage() {
  const { data: paymentMethods, isLoading, error } = usePaymentMethods();

  const friendlyErrorMessage = getFriendlyErrorMessage(error);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Formas de pago</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las formas de pago para tus movimientos
        </p>
      </div>

      {/* Mensaje de error */}
      {error && !isLoading && (
        <ErrorState
          message={friendlyErrorMessage}
          showReloadButton
        />
      )}

      {/* Loading state */}
      {isLoading ? (
        <PaymentMethodListSkeleton />
      ) : (
        <PaymentMethodList paymentMethods={paymentMethods || []} showCreateButton />
      )}
    </div>
  );
}
