'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Spinner } from '@cyberlisans/ui/atoms';
import type { DealerLink } from '@/lib/dealer-types';

export function DealerLinkQRCode({ link }: { link: DealerLink }) {
  const router = useRouter();
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [svgString, setSvgString] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${encodeURIComponent(link.code)}`
      : `/?ref=${encodeURIComponent(link.code)}`;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [png, svg] = await Promise.all([
          QRCode.toDataURL(url, {
            width: 512,
            margin: 2,
            color: { dark: '#00F0FF', light: '#0a0a18' },
          }),
          QRCode.toString(url, {
            type: 'svg',
            margin: 1,
            color: { dark: '#00F0FF', light: '#00000000' },
          }),
        ]);
        if (cancelled) return;
        setDataUrl(png);
        setSvgString(svg);
      } catch (err) {
        if (!cancelled) setError('QR kod oluşturulamadı');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${link.code}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `qr-${link.code}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-2 inline-flex items-center gap-1 text-sm text-white/60 hover:text-cyber-cyan"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Geri
        </button>
        <h1 className="font-orbitron text-2xl font-black text-white">QR Kod</h1>
        <p className="text-sm text-white/60">
          <span className="font-mono text-cyber-cyan">{link.code}</span> kodlu linkin QR&apos;ı
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10">
            {error ? (
              <p className="text-sm text-cyber-magenta">{error}</p>
            ) : !dataUrl ? (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Spinner size="md" /> Yükleniyor...
              </div>
            ) : (
              <>
                <div className="rounded-md border border-cyber-cyan/30 bg-cyber-darker p-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                  <img
                    src={dataUrl}
                    alt={`QR for ${link.code}`}
                    className="h-64 w-64"
                    width={256}
                    height={256}
                  />
                </div>
                <p className="font-mono text-sm text-cyber-cyan">{url}</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={copy} variant="outline">
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-cyber-lime" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Kopyalandı' : 'Linki Kopyala'}
                  </Button>
                  <Button onClick={downloadPng} variant="outline">
                    <Download className="h-4 w-4" />
                    PNG
                  </Button>
                  <Button onClick={downloadSvg} variant="outline">
                    <Download className="h-4 w-4" />
                    SVG
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6 text-sm">
            <h2 className="font-orbitron text-lg font-bold text-white">Bilgi</h2>
            <div className="space-y-2 text-white/80">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Kod</span>
                <span className="font-mono text-cyber-cyan">{link.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">İndirim</span>
                <span className="text-cyber-magenta">%{link.discountPercent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Ürün</span>
                <span className="text-white">{link.productName ?? 'Tümü'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Kullanım</span>
                <span className="text-white">
                  {link.currentUses}
                  {link.maxUses != null && <span className="text-white/50"> / {link.maxUses}</span>}
                </span>
              </div>
            </div>
            <p className="border-t border-cyber-cyan/20 pt-3 text-xs text-white/50">
              QR&apos;ı okutarak müşterilerin linkinle ürün satın alabilir.
            </p>
            <Link
              href={`/dealer/links/${link.id}`}
              className="inline-flex items-center gap-1 text-sm text-cyber-cyan hover:text-cyber-magenta"
            >
              Link Detayları →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
