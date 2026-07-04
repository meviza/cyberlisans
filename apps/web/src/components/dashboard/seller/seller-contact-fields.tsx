import * as React from 'react';
import { Input, Label } from '@cyberlisans/ui/atoms';

export interface SellerContactFieldsProps {
  phone: string;
  websiteUrl: string;
  address: string;
  bio: string;
  disabled: boolean;
  onPhoneChange: (v: string) => void;
  onWebsiteUrlChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onBioChange: (v: string) => void;
}

export function SellerContactFields({
  phone,
  websiteUrl,
  address,
  bio,
  disabled,
  onPhoneChange,
  onWebsiteUrlChange,
  onAddressChange,
  onBioChange,
}: SellerContactFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+90 555 555 5555"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="websiteUrl">Web Sitesi</Label>
          <Input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => onWebsiteUrlChange(e.target.value)}
            placeholder="https://ornek.com"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="İstanbul, Türkiye"
          disabled={disabled}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">
          Hakkımda <span className="text-xs text-white/50">({bio.length}/500)</span>
        </Label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value.slice(0, 500))}
          placeholder="Mağazanız hakkında kısa bilgi"
          disabled={disabled}
          rows={3}
          className="flex w-full rounded-md border border-cyber-cyan/30 bg-cyber-bg/50 px-3 py-2 text-sm text-cyber-text placeholder:text-cyber-text-dim transition-all focus-visible:border-cyber-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50 disabled:opacity-50"
        />
      </div>
    </>
  );
}
