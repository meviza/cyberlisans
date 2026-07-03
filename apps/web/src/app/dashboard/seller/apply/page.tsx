'use client';

import * as React from 'react';
import { ApplySellerForm } from '@/components/dashboard/apply-seller-form';

export default function SellerApplyPage() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-8">
      <ApplySellerForm />
    </div>
  );
}
