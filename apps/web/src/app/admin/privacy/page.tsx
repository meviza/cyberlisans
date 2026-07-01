'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { PrivacyActions } from '@/components/admin/privacy-actions';

export default function AdminPrivacyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="KVKK / GDPR"
        description="Veri dışa aktarma ve silme talepleri, onay istatistikleri"
        crumbs={[{ href: '/admin/privacy', label: 'KVKK / GDPR' }]}
      />
      <PrivacyActions />
    </div>
  );
}
