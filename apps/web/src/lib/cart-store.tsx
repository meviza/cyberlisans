'use client';

import * as React from 'react';

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  image: string;
  unitPrice: number;
  qty: number;
  maxQty: number;
};

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  refCode: string | null;
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setRefCode: (code: string | null) => void;
}

const STORAGE_KEY = 'cl_cart_v1';
const REF_KEY = 'cl_ref_v1';

const CartContext = React.createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (it): it is CartItem =>
        typeof it === 'object' &&
        it !== null &&
        typeof (it as CartItem).id === 'string' &&
        typeof (it as CartItem).slug === 'string' &&
        typeof (it as CartItem).title === 'string' &&
        typeof (it as CartItem).brand === 'string' &&
        typeof (it as CartItem).image === 'string' &&
        typeof (it as CartItem).unitPrice === 'number' &&
        typeof (it as CartItem).qty === 'number' &&
        typeof (it as CartItem).maxQty === 'number',
    );
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function loadRef(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('ref');
    if (fromQuery) {
      window.localStorage.setItem(REF_KEY, fromQuery);
      return fromQuery;
    }
    return window.localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

function saveRef(code: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (code) window.localStorage.setItem(REF_KEY, code);
    else window.localStorage.removeItem(REF_KEY);
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>({
    items: [],
    hydrated: false,
    refCode: null,
  });

  React.useEffect(() => {
    setState({ items: loadFromStorage(), hydrated: true, refCode: loadRef() });
  }, []);

  React.useEffect(() => {
    if (state.hydrated) saveToStorage(state.items);
  }, [state.items, state.hydrated]);

  React.useEffect(() => {
    if (state.hydrated) saveRef(state.refCode);
  }, [state.refCode, state.hydrated]);

  const addItem = React.useCallback((item: Omit<CartItem, 'qty'> & { qty?: number }) => {
    const qtyToAdd = item.qty ?? 1;
    setState((prev) => {
      const existing = prev.items.find((it) => it.id === item.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.id === item.id ? { ...it, qty: Math.min(it.maxQty, it.qty + qtyToAdd) } : it,
          ),
        };
      }
      return {
        ...prev,
        items: [...prev.items, { ...item, qty: Math.min(item.maxQty, qtyToAdd) }],
      };
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));
  }, []);

  const updateQty = React.useCallback((id: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items
        .map((it) => (it.id === id ? { ...it, qty: Math.max(1, Math.min(it.maxQty, qty)) } : it))
        .filter((it) => it.qty > 0),
    }));
  }, []);

  const clearCart = React.useCallback(() => {
    setState((prev) => ({ ...prev, items: [] }));
  }, []);

  const getTotal = React.useCallback((): number => {
    return state.items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
  }, [state.items]);

  const getItemCount = React.useCallback((): number => {
    return state.items.reduce((sum, it) => sum + it.qty, 0);
  }, [state.items]);

  const setRefCode = React.useCallback((code: string | null) => {
    setState((prev) => ({ ...prev, refCode: code }));
  }, []);

  const value = React.useMemo<CartContextValue>(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      refCode: state.refCode,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      getTotal,
      getItemCount,
      setRefCode,
    }),
    [
      state.items,
      state.hydrated,
      state.refCode,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      getTotal,
      getItemCount,
      setRefCode,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
