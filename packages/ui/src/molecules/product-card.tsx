'use client';

import * as React from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../atoms';
import { cn } from '../utils/cn';

export interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  currency: 'TRY' | 'USD' | 'EUR';
  stock: number;
  brandName: string;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
  className?: string;
}

const currencySymbol: Record<Product['currency'], string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [glow, setGlow] = React.useState({ x: 50, y: 50 });
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -10, y: x * 10 });
    setGlow({ x: (x + 0.5) * 100, y: (y + 0.5) * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out',
      }}
      className={cn('group relative', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(0,255,255,0.2), transparent 50%)`,
        }}
      />
      <Card className="relative overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-cyber-bg-elevated">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-cyber-text-dim font-orbitron">
              NO IMG
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="magenta" size="sm">
              {product.brandName}
            </Badge>
          </div>
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-base line-clamp-2 group-hover:text-cyber-cyan transition-colors">
            {product.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron text-2xl font-bold text-cyber-cyan text-glow-cyan">
              {currencySymbol[product.currency]}
              {product.price.toLocaleString()}
            </span>
            <span className="text-xs text-cyber-text-dim">{product.currency}</span>
          </div>
          <div className="flex items-center justify-between">
            {inStock ? (
              <Badge variant={lowStock ? 'warning' : 'success'} size="sm">
                {lowStock ? `Son ${product.stock} adet` : 'Stokta'}
              </Badge>
            ) : (
              <Badge variant="danger" size="sm">
                Tükendi
              </Badge>
            )}
            <Button
              size="sm"
              variant="primary"
              disabled={!inStock}
              onClick={() => onAddToCart?.(product.id)}
            >
              {inStock ? <ShoppingCart className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              {inStock ? 'Sepete Ekle' : 'Tükendi'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ProductCard };
