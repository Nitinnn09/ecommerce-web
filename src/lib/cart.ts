export type CartItem = {
  _id: string;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  image?: string;
  desc?: string;
  category?: string;
  qty: number;
};

const KEY = "cart_v1";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const setCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const addToCart = (p: any) => {
  const cart = getCart();
  const item: CartItem = {
    _id: p._id,
    title: p.title,
    price: Number(p.price || 0),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
    discount: p.discount,
    image: p.image,
    desc: p.desc,
    category: p.category,
    qty: 1,
  };

  const exists = cart.find((x) => x._id === item._id);

  const next = exists
    ? cart.map((x) => (x._id === item._id ? { ...x, qty: (x.qty || 1) + 1 } : x))
    : [...cart, item];

  setCart(next);
  return next;
};

export const updateQty = (_id: string, qty: number) => {
  const cart = getCart();
  const next =
    qty <= 0 ? cart.filter((x) => x._id !== _id) : cart.map((x) => (x._id === _id ? { ...x, qty } : x));
  setCart(next);
  return next;
};

export const cartTotal = (items: CartItem[]) => {
  return items.reduce((sum, x) => sum + Number(x.price || 0) * (x.qty || 1), 0);
};
