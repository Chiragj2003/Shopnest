export type Lang = "en" | "hi";

const en = {
    addToCart: "Add to Cart",
    added: "Added ✓",
    orderWhatsApp: "Order on WhatsApp",
    outOfStock: "Out of Stock",
    notifyMe: "Notify Me",
    payUpi: "Pay via UPI",
    total: "Total",
    items: "items",
    item: "item",
    checkout: "Checkout on WhatsApp",
    viewCart: "View Cart",
    clearCart: "Clear",
    scanToPay: "Scan with any UPI app to pay",
    copyUpi: "Copy UPI ID",
    copied: "Copied!",
    close: "Close",
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty — tap a product to add it.",
  remove: "Remove",
};

export type Labels = { [K in keyof typeof en]: string };

export const LABELS: Record<Lang, Labels> = {
  en,
  hi: {
    addToCart: "कार्ट में जोड़ें",
    added: "जोड़ा गया ✓",
    orderWhatsApp: "WhatsApp पर ऑर्डर करें",
    outOfStock: "स्टॉक ख़त्म",
    notifyMe: "उपलब्ध होने पर बताएं",
    payUpi: "UPI से भुगतान करें",
    total: "कुल",
    items: "आइटम",
    item: "आइटम",
    checkout: "WhatsApp पर चेकआउट करें",
    viewCart: "कार्ट देखें",
    clearCart: "हटाएं",
    scanToPay: "भुगतान के लिए किसी भी UPI ऐप से स्कैन करें",
    copyUpi: "UPI ID कॉपी करें",
    copied: "कॉपी हो गया!",
    close: "बंद करें",
    yourCart: "आपका कार्ट",
    emptyCart: "कार्ट खाली है — जोड़ने के लिए प्रोडक्ट पर टैप करें।",
    remove: "हटाएं",
  },
};
