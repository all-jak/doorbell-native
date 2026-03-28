import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import type { CartItem, ProductCard, ProductDetail, ProductVariant } from '@/lib/types';

const STORAGE_KEY = '@doorbell/cart';

type AddToCartOptions = {
  quantity?: number;
  variation?: ProductVariant | null;
};

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: ProductCard | ProductDetail, options?: AddToCartOptions) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const toCartKey = (productId: number, variationId?: number) =>
  variationId ? `${productId}:${variationId}` : String(productId);

const toVariationLabel = (variation?: ProductVariant | null) =>
  variation?.attributes.map((attribute) => attribute.option).join(' · ') ?? null;

const toCartItem = (
  product: ProductCard | ProductDetail,
  quantity: number,
  variation?: ProductVariant | null
): CartItem => ({
  key: toCartKey(product.id, variation?.id),
  productId: product.id,
  variationId: variation?.id,
  slug: product.slug,
  name: product.name,
  image: product.image,
  quantity,
  price: variation?.price ?? product.price,
  regularPrice: variation?.regularPrice ?? product.regularPrice,
  currency: product.currency,
  stockStatus: variation?.stockStatus ?? product.stockStatus,
  categorySlugs: product.categories.map((category) => category.slug),
  unitLabel: product.unitLabel,
  variationLabel: toVariationLabel(variation),
});

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCart = async () => {
      try {
        const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (!rawValue || !isMounted) {
          return;
        }

        const storedItems = JSON.parse(rawValue) as CartItem[];

        if (Array.isArray(storedItems)) {
          setItems(storedItems);
        }
      } catch {
        // Ignore malformed local state and continue with a fresh cart.
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    };

    void loadCart();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: ProductCard | ProductDetail, options?: AddToCartOptions) => {
      const quantity = options?.quantity ?? 1;
      const variation = options?.variation ?? null;
      const key = toCartKey(product.id, variation?.id);

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.key === key);

        if (existingItem) {
          return currentItems.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + quantity } : item
          );
        }

        return [...currentItems, toCartItem(product, quantity, variation)];
      });
    };

    const updateQuantity = (key: string, quantity: number) => {
      setItems((currentItems) =>
        currentItems
          .map((item) => (item.key === key ? { ...item, quantity: Math.max(quantity, 0) } : item))
          .filter((item) => item.quantity > 0)
      );
    };

    const removeItem = (key: string) => {
      setItems((currentItems) => currentItems.filter((item) => item.key !== key));
    };

    const clearCart = () => {
      setItems([]);
    };

    return {
      items,
      hydrated,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }

  return context;
};
