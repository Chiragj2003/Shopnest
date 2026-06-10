export const DEFAULT_WA_TEMPLATE =
  "Hi! I want to order {product} (₹{price}) from {store}";

export function fillTemplate(
  template: string,
  vars: { product?: string; price?: string | number; store?: string }
) {
  return template
    .replaceAll("{product}", String(vars.product ?? ""))
    .replaceAll("{price}", String(vars.price ?? ""))
    .replaceAll("{store}", String(vars.store ?? ""));
}

export function waLink(whatsappNumber: string, message: string) {
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatINR(price: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(price);
}

export function cartMessage(
  storeName: string,
  items: Array<{ name: string; price: number; qty: number }>,
  total: number
) {
  const lines = items.map(
    (i) => `• ${i.name}${i.qty > 1 ? ` x${i.qty}` : ""} — ₹${formatINR(i.price * i.qty)}`
  );
  return [
    `Hi! I'd like to order from ${storeName}:`,
    "",
    ...lines,
    "",
    `Total: ₹${formatINR(total)}`,
  ].join("\n");
}

export function notifyMeMessage(storeName: string, productName: string) {
  return `Hi ${storeName}! Please notify me when "${productName}" is back in stock.`;
}
