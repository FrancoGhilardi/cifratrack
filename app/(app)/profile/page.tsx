"use client";

import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { ProfileForm, ChangePasswordForm } from "@/features/profile/ui";
import {
  useProfile,
  useProfileMutations,
} from "@/features/profile/hooks/useProfile";
import { ErrorState } from "@/shared/ui/error-state";
import { FormSection } from "@/shared/ui/form-section";
import { FormFieldsSkeleton } from "@/shared/ui/form-fields-skeleton";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const { updateProfile, changePassword } = useProfileMutations();

  return (
    <PageContainer>
      <PageHeader
        title="Perfil"
        description="Actualiza tus datos y tu contraseña"
      />

      {error && (
        <ErrorState
          message={`Error al cargar perfil: ${error.message}`}
          className="max-w-3xl"
        />
      )}

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          <FormSection
            title="Datos personales"
            description="Nombre visible y datos basicos de tu cuenta."
          >
            <FormFieldsSkeleton rows={2} actionWidth={128} />
          </FormSection>
          <FormSection
            title="Cambiar contraseña"
            description="Actualiza tu clave sin salir de la sesión actual."
          >
            <FormFieldsSkeleton rows={3} actionWidth={160} />
          </FormSection>
        </div>
      )}

      {!isLoading && profile && (
        <div className="grid gap-6 md:grid-cols-2">
          <FormSection
            title="Datos personales"
            description="Modifica tu nombre visible. El email se mantiene solo lectura."
          >
            <ProfileForm
              profile={profile}
              onSubmit={async (data) => {
                await updateProfile.mutateAsync(data);
              }}
            />
          </FormSection>

          <FormSection
            title="Cambiar contraseña"
            description="Usa una contraseña nueva con mejor seguridad para tu cuenta."
          >
            <ChangePasswordForm
              onSubmit={async (data) => {
                await changePassword.mutateAsync(data);
              }}
            />
          </FormSection>
        </div>
      )}
    </PageContainer>
  );
}
