import * as React from 'react';
import { Input, Label } from '@cyberlisans/ui/atoms';

export interface SellerIdentityFieldsProps {
  companyName: string;
  taxId: string;
  taxOffice: string;
  disabled: boolean;
  onCompanyNameChange: (v: string) => void;
  onTaxIdChange: (v: string) => void;
  onTaxOfficeChange: (v: string) => void;
}

export function SellerIdentityFields({
  companyName,
  taxId,
  taxOffice,
  disabled,
  onCompanyNameChange,
  onTaxIdChange,
  onTaxOfficeChange,
}: SellerIdentityFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="companyName">Şirket Adı *</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          placeholder="Cyber Teknoloji A.Ş."
          disabled={disabled}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="taxId">Vergi No / TC *</Label>
          <Input
            id="taxId"
            value={taxId}
            onChange={(e) => onTaxIdChange(e.target.value)}
            placeholder="1234567890"
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="taxOffice">Vergi Dairesi</Label>
          <Input
            id="taxOffice"
            value={taxOffice}
            onChange={(e) => onTaxOfficeChange(e.target.value)}
            placeholder="Beşiktaş"
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}
