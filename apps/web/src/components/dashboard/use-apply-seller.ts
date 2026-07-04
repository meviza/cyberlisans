'use client';

import * as React from 'react';
import { ApiError } from '@/lib/api-client';
import type { ApplySellerPayload, ApplySellerResult } from '@/lib/api-client';

const SLUG_RE = /^[a-z0-9-]{3,40}$/;

export interface ApplySellerState {
  companyName: string;
  taxId: string;
  taxOffice: string;
  phone: string;
  websiteUrl: string;
  address: string;
  bio: string;
  slug: string;
  slugSuggestion: string;
  submitting: boolean;
  error: string | null;
  success: string | null;
}

const INITIAL_STATE: ApplySellerState = {
  companyName: '',
  taxId: '',
  taxOffice: '',
  phone: '',
  websiteUrl: '',
  address: '',
  bio: '',
  slug: '',
  slugSuggestion: '',
  submitting: false,
  error: null,
  success: null,
};

function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export interface UseApplySellerResult {
  state: ApplySellerState;
  setField: <K extends keyof ApplySellerState>(key: K, value: ApplySellerState[K]) => void;
  setSlug: (v: string) => void;
  onSlugConflict: () => void;
  submit: (api: (payload: ApplySellerPayload) => Promise<ApplySellerResult>) => Promise<boolean>;
}

export function useApplySeller(): UseApplySellerResult {
  const [state, setState] = React.useState<ApplySellerState>(INITIAL_STATE);

  React.useEffect(() => {
    const base = generateSlug(state.companyName);
    setState((s) => ({ ...s, slugSuggestion: base, slug: base }));
  }, [state.companyName]);

  const setField = React.useCallback(
    <K extends keyof ApplySellerState>(key: K, value: ApplySellerState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const setSlug = React.useCallback((v: string) => {
    setState((s) => ({ ...s, slug: v }));
  }, []);

  const onSlugConflict = React.useCallback(() => {
    setState((s) => {
      const match = s.slugSuggestion.match(/^(.*?)(\d*)$/);
      const stem = match && match[1] ? match[1].replace(/-$/, '') : s.slugSuggestion;
      const num = match && match[2] ? parseInt(match[2], 10) : 1;
      const next = `${stem}-${num + 1}`;
      return { ...s, slugSuggestion: next, slug: next };
    });
  }, []);

  const submit = React.useCallback(
    async (api: (payload: ApplySellerPayload) => Promise<ApplySellerResult>) => {
      setState((s) => ({ ...s, error: null, success: null }));

      if (!state.companyName.trim()) {
        setState((s) => ({ ...s, error: 'Şirket adı zorunlu' }));
        return false;
      }
      if (!state.taxId.trim()) {
        setState((s) => ({ ...s, error: 'Vergi/TC kimlik numarası zorunlu' }));
        return false;
      }
      if (!state.slug.trim()) {
        setState((s) => ({ ...s, error: 'Slug üretilemedi' }));
        return false;
      }
      if (!SLUG_RE.test(state.slug)) {
        setState((s) => ({ ...s, error: 'Slug 3-40 karakter, sadece a-z, 0-9 ve tire içermeli' }));
        return false;
      }
      if (state.bio.length > 500) {
        setState((s) => ({ ...s, error: 'Bio en fazla 500 karakter olabilir' }));
        return false;
      }
      if (state.websiteUrl && !/^https?:\/\/.+/.test(state.websiteUrl)) {
        setState((s) => ({
          ...s,
          error: 'Web sitesi geçerli bir URL olmalı (http(s):// ile başlamalı)',
        }));
        return false;
      }

      const payload: ApplySellerPayload = {
        companyName: state.companyName.trim(),
        taxId: state.taxId.trim(),
        slug: state.slug,
      };
      if (state.taxOffice.trim()) payload.taxOffice = state.taxOffice.trim();
      if (state.phone.trim()) payload.phone = state.phone.trim();
      if (state.websiteUrl.trim()) payload.websiteUrl = state.websiteUrl.trim();
      if (state.address.trim()) payload.address = state.address.trim();
      if (state.bio.trim()) payload.bio = state.bio.trim();

      setState((s) => ({ ...s, submitting: true }));
      try {
        const res = await api(payload);
        setState((s) => ({ ...s, success: res.message || 'Başvurunuz alındı!' }));
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.code === 'SLUG_TAKEN' || /slug/i.test(err.message)) onSlugConflict();
          setState((s) => ({ ...s, error: err.message }));
        } else {
          setState((s) => ({ ...s, error: 'Başvuru gönderilemedi. Lütfen tekrar deneyin.' }));
        }
        return false;
      } finally {
        setState((s) => ({ ...s, submitting: false }));
      }
    },
    [state, onSlugConflict],
  );

  return { state, setField, setSlug, onSlugConflict, submit };
}
