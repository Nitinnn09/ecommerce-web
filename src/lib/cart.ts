export type CartItem = {
  _id: string; // ✅ productId (Mongo ObjectId string)
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

// ✅ helper: id normalize (Mongo _id string)
const getId = (p: any): string => {
  const pid = p?._id || p?.id || p?.productId;
  return pid ? String(pid) : "";
};

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];

    // ✅ sanitize: ensure every item has _id and qty
    return arr
      .map((x: any) => ({
        _id: String(x?._id || ""),
        title: String(x?.title || ""),
        price: Number(x?.price || 0),
        oldPrice: x?.oldPrice ? Number(x.oldPrice) : undefined,
        discount: x?.discount,
        image: x?.image,
        desc: x?.desc,
        category: x?.category,
        qty: Number(x?.qty || 1),
      }))
      .filter((x: CartItem) => !!x._id); // ✅ drop invalid items
  } catch {
    return [];
  }
};

export const setCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
};

// ✅ optional utility: clear cart correctly
export const clearCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
};

export const addToCart = (p: any) => {
  const cart = getCart();

  const pid = getId(p);
  if (!pid) {
    // ✅ yahi root cause tha: p._id missing
    console.error("addToCart: Missing product id", p);
    throw new Error("Product id missing. Please reload and try again.");
  }

  const item: CartItem = {
    _id: pid, // ✅ always string id
    title: p?.title || "Product",
    price: Number(p?.price || 0),
    oldPrice: p?.oldPrice ? Number(p.oldPrice) : undefined,
    discount: p?.discount,
    image: p?.image,
    desc: p?.desc,
    category: p?.category,
    qty: 1,
  };

  const exists = cart.find((x) => String(x._id) === pid);

  const next = exists
    ? cart.map((x) => (String(x._id) === pid ? { ...x, qty: Number(x.qty || 1) + 1 } : x))
    : [...cart, item];

  setCart(next);
  return next;
};

export const updateQty = (_id: string, qty: number) => {
  const cart = getCart();
  const id = String(_id || "");
  const q = Number(qty || 1);

  const next =
    q <= 0
      ? cart.filter((x) => String(x._id) !== id)
      : cart.map((x) => (String(x._id) === id ? { ...x, qty: q } : x));

  setCart(next);
  return next;
};

export const cartTotal = (items: CartItem[]) => {
  return items.reduce((sum, x) => sum + Number(x.price || 0) * (Number(x.qty || 1)), 0);
};
