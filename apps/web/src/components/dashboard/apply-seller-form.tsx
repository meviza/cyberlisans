'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { apiFetch } from '@/lib/api-client';
import type { ApplySellerResult } from '@/lib/api-client';
import { SellerFormFields } from './seller/seller-form-fields';
import { SellerSlugInput } from './seller/seller-slug-input';
import { FormAlert } from './seller/form-alert';
import { SubmitButton } from './seller/submit-button';
import { useApplySeller } from './use-apply-seller';

export function ApplySellerForm() {
  const router = useRouter();
  const { state, setField, setSlug, submit } = useApplySeller();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit((payload) =>
      apiFetch<ApplySellerResult>('/sellers/apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
    if (ok) setTimeout(() => router.push('/dashboard/seller'), 1200);
  };

  return (
    <AuthForm title="Satıcı Başvurusu" subtitle="Mağazanızı oluşturmak için bilgilerinizi girin">
      <form onSubmit={onSubmit} className="space-y-4">
        <SellerFormFields
          companyName={state.companyName}
          taxId={state.taxId}
          taxOffice={state.taxOffice}
          phone={state.phone}
          websiteUrl={state.websiteUrl}
          address={state.address}
          bio={state.bio}
          disabled={state.submitting}
          onCompanyNameChange={(v) => setField('companyName', v)}
          onTaxIdChange={(v) => setField('taxId', v)}
          onTaxOfficeChange={(v) => setField('taxOffice', v)}
          onPhoneChange={(v) => setField('phone', v)}
          onWebsiteUrlChange={(v) => setField('websiteUrl', v)}
          onAddressChange={(v) => setField('address', v)}
          onBioChange={(v) => setField('bio', v)}
        />
        <SellerSlugInput
          slug={state.slug}
          suggestion={state.slugSuggestion}
          disabled={state.submitting}
          onSlugChange={setSlug}
          onAcceptSuggestion={() => setSlug(state.slugSuggestion)}
        />
        <FormAlert error={state.error} success={state.success} />
        <SubmitButton submitting={state.submitting} />
        <p className="text-center text-xs text-white/50">
          Başvurunuz incelendikten sonra mağazanız aktif olacaktır.
        </p>
      </form>
    </AuthForm>
  );
}
