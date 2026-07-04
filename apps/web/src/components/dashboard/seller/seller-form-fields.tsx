import * as React from 'react';
import { SellerIdentityFields } from './seller-identity-fields';
import { SellerContactFields } from './seller-contact-fields';

export interface SellerFormFieldsProps {
  companyName: string;
  taxId: string;
  taxOffice: string;
  phone: string;
  websiteUrl: string;
  address: string;
  bio: string;
  disabled: boolean;
  onCompanyNameChange: (v: string) => void;
  onTaxIdChange: (v: string) => void;
  onTaxOfficeChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onWebsiteUrlChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onBioChange: (v: string) => void;
}

export function SellerFormFields(props: SellerFormFieldsProps) {
  const {
    companyName,
    taxId,
    taxOffice,
    phone,
    websiteUrl,
    address,
    bio,
    disabled,
    onCompanyNameChange,
    onTaxIdChange,
    onTaxOfficeChange,
    onPhoneChange,
    onWebsiteUrlChange,
    onAddressChange,
    onBioChange,
  } = props;

  return (
    <>
      <SellerIdentityFields
        companyName={companyName}
        taxId={taxId}
        taxOffice={taxOffice}
        disabled={disabled}
        onCompanyNameChange={onCompanyNameChange}
        onTaxIdChange={onTaxIdChange}
        onTaxOfficeChange={onTaxOfficeChange}
      />
      <SellerContactFields
        phone={phone}
        websiteUrl={websiteUrl}
        address={address}
        bio={bio}
        disabled={disabled}
        onPhoneChange={onPhoneChange}
        onWebsiteUrlChange={onWebsiteUrlChange}
        onAddressChange={onAddressChange}
        onBioChange={onBioChange}
      />
    </>
  );
}
