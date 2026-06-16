export type Lang = "en" | "hi";

const en = {
    addToCart: "Add to Cart",
    add: "Add",
    added: "Added ✓",
    orderWhatsApp: "Order on WhatsApp",
    outOfStock: "Out of Stock",
    notifyMe: "Notify Me",
    total: "Total",
    items: "items",
    item: "item",
    checkout: "Checkout on WhatsApp",
    viewCart: "View Cart",
    clearCart: "Clear",
    close: "Close",
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty — tap a product to add it.",
  remove: "Remove",
  noProducts: "No products yet — check back soon!",
  poweredBy: "Powered by",
};

export type Labels = { [K in keyof typeof en]: string };

export const LABELS: Record<Lang, Labels> = {
  en,
  hi: {
    addToCart: "कार्ट में जोड़ें",
    add: "जोड़ें",
    added: "जोड़ा गया ✓",
    orderWhatsApp: "WhatsApp पर ऑर्डर करें",
    outOfStock: "स्टॉक ख़त्म",
    notifyMe: "उपलब्ध होने पर बताएं",
    total: "कुल",
    items: "आइटम",
    item: "आइटम",
    checkout: "WhatsApp पर चेकआउट करें",
    viewCart: "कार्ट देखें",
    clearCart: "हटाएं",
    close: "बंद करें",
    yourCart: "आपका कार्ट",
    emptyCart: "कार्ट खाली है — जोड़ने के लिए प्रोडक्ट पर टैप करें।",
    remove: "हटाएं",
    noProducts: "अभी कोई प्रोडक्ट नहीं — जल्द देखें!",
    poweredBy: "द्वारा निर्मित",
  },
};
