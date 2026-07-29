export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const ORDER_STATUSES = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export const ORDER_STATUS_FLOW = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
];

export const PAYMENT_STATUSES = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_METHODS = ["Cash On Delivery", "Card", "JazzCash", "EasyPaisa", "Bank Transfer"];

export const DISCOUNT_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};

export const SETTING_GROUPS = {
  CONTACT: "contact",
  WEBSITE: "website",
  APPEARANCE: "appearance",
  PAGES: "pages",
  MEDIA: "media",
  ADMIN_PROFILE: "admin_profile",
};

export const DEFAULT_PAGE_LIMIT = 12;
export const MAX_PAGE_LIMIT = 100;
