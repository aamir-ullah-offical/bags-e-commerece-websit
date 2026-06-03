export interface WebSettings {
  storeName: string;
  storeTagline: string;
  contactEmail: string;
  contactPhone: string;
  storeAddress: string;
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonStyle: string;
  borderRadius: string;
  headingFont: string;
  bodyFont: string;
  logoMain: string;
  logoFooter: string;
  favicon: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  workingHours: string;
}

export interface StaticPage {
  content: string;
  seoTitle: string;
  metaDescription: string;
}

export interface NewsSubscriber {
  id: string;
  email: string;
  date: string;
}

export interface AdminProfile {
  profileImage: string;
  fullName: string;
  email: string;
}

// Pre-populated photo gallery for luxury purses/bags
export const PrePopulatedMedia = [
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", // Red Leather Purse
  "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80", // Brown Luxury Tote
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80", // Designer Wallet
  "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80", // High-end Satchel
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80", // Vintage Suitcase
  "https://images.unsplash.com/photo-1622560480654-d9c48c66a2b2?auto=format&fit=crop&w=600&q=80", // Elegant Leather Messenger
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", // Professional Laptop Backpack
  "https://images.unsplash.com/photo-1575032614061-39c87849201a?auto=format&fit=crop&w=600&q=80"  // Casual Handbag
];

const loadLocal = <T>(key: string, backup: T): T => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return backup;
    }
  }
  localStorage.setItem(key, JSON.stringify(backup));
  return backup;
};

export const adminService = {
  getContactInfo: (): ContactInfo => {
    return loadLocal("mds_contact_info", {
      phone: "+33 (0) 1 42 77 96 00",
      email: "concierge@maisonsac-luxury.com",
      address: "8 Rue des Francs-Bourgeois, 75003 Paris, France",
      mapUrl: "https://maps.google.com/maps?q=Paris+France&t=&z=13&ie=UTF8&iwloc=&output=embed",
      workingHours: "Mon - Sat: 10:00 AM - 7:00 PM | Sun: Closed"
    });
  },

  saveContactInfo: (data: ContactInfo) => {
    localStorage.setItem("mds_contact_info", JSON.stringify(data));
    adminService.syncPost("settings/contact", data);
  },

  getWebsiteSettings: (): WebSettings => {
    return loadLocal("mds_website_settings", {
      storeName: "MAISON SAC",
      storeTagline: "Exquisite Purses, Bags, Wallets, & Luxury Carryalls",
      contactEmail: "concierge@maisonsac-luxury.com",
      contactPhone: "+33 (0) 1 42 77 96 00",
      storeAddress: "8 Rue des Francs-Bourgeois, 75003 Paris, France"
    });
  },

  saveWebsiteSettings: (data: WebSettings) => {
    localStorage.setItem("mds_website_settings", JSON.stringify(data));
    adminService.syncPost("settings/website", data);
  },

  getAppearanceSettings: (): AppearanceSettings => {
    return loadLocal("mds_appearance_settings", {
      primaryColor: "#0c0a09",
      secondaryColor: "#d97706",
      accentColor: "#f59e0b",
      buttonStyle: "rounded-xl",
      borderRadius: "12px",
      headingFont: "Inter",
      bodyFont: "Inter",
      logoMain: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=400&q=80",
      logoFooter: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=400&q=80",
      favicon: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=100&q=80"
    });
  },

  saveAppearanceSettings: (data: AppearanceSettings) => {
    localStorage.setItem("mds_appearance_settings", JSON.stringify(data));
    adminService.syncPost("settings/appearance", data);
  },

  getStaticPages: (): Record<string, StaticPage> => {
    return loadLocal("mds_static_pages", {
      about: {
        content: `<h3>Crafted for the Global Connoisseur</h3><p>Maison Sac was established in the heart of Paris with a singular, unyielding vision – to craft leather bag masterpieces that unify modern utility with structural elegance. Every briefcase, rucksack, clutch, and travel valise is designed from premium full-grain calfskins, hand-selected buckles, and heavy-duty double stitching. Experience the meticulous craftsmanship of Parisian bags.</p>`,
        seoTitle: "About Our Parisian Luxury Leather Bag House | Maison Sac",
        metaDescription: "Read the history, heritage, and uncompromising craftsmanship values behind Maison Sac, makers of high-end wallets, travel bags, and rucksacks."
      },
      privacy: {
        content: `<h3>Your Sacred Confidentiality</h3><p>At Maison Sac, your confidentiality remains a core pillar. We gather basic contact information to process purchases and send updates with customer consent. All transaction channels are fortified via secure network encryption. We do not sell or lease customer records under any circumstances.</p>`,
        seoTitle: "Privacy Policy & Encrypted Purchase Protection | Maison Sac",
        metaDescription: "Your details are fully protected. Review our modern client data protocols and payment encryption safety policies."
      },
      terms: {
        content: `<h3>Luxury Acquisition Standards</h3><p>Purchases placed through Maison Sac represent custom binding acquisitions. Orders are processed within 24 hours. Returns are accepted within 30 days for unblemished goods accompanied by validation receipts of origin. Customer support resides in our Paris atelier.</p>`,
        seoTitle: "Terms of Acquirement & Returns Regulations | Maison Sac",
        metaDescription: "Review the shipping terms, purchase contract specifications, and priority return rules governing Maison Sac orders."
      },
      faqs: {
        content: `<h3>Frequently Answered Questions</h3><p><strong>Q: Where are Maison Sac products designed?</strong><br>A: All conceptual architectures, design prototypes, and selection processes are executed at our signature studio in Paris, France.<br><br><strong>Q: What leather grades do you employ?</strong><br>A: We work exclusively with certified full-grain skins and water-resistant premium hardware.<br><br><strong>Q: What is the delivery timeframe for global shipping?</strong><br>A: Priority express shipping takes 3-5 business days across Europe, Asia-Pacific, and the Americas.</p>`,
        seoTitle: "Frequently Answered Inquiries & Product Guides | Maison Sac",
        metaDescription: "Find immediate answers on leather sourcing details, lifetime warranties, and free express international shipping times."
      }
    });
  },

  saveStaticPages: (data: Record<string, StaticPage>) => {
    localStorage.setItem("mds_static_pages", JSON.stringify(data));
    adminService.syncPost("pages", data);
  },

  getSubscribers: (): NewsSubscriber[] => {
    return loadLocal("mds_subscribers", [
      { id: "sub-1", email: "gabrielle.royer@parisian.fr", date: "2026-05-12" },
      { id: "sub-2", email: "julien.marceau@vogue.fr", date: "2026-05-20" },
      { id: "sub-3", email: "elena.petrova@styling.co.uk", date: "2026-06-01" },
      { id: "sub-4", email: "takashi.sato@ginza-carry.jp", date: "2026-06-02" }
    ]);
  },

  saveSubscribers: (list: NewsSubscriber[]) => {
    localStorage.setItem("mds_subscribers", JSON.stringify(list));
    adminService.syncPost("subscribers/bulk", list);
  },

  getAdminProfile: (): AdminProfile => {
    return loadLocal("mds_admin_profile", {
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      fullName: "Charles Laurent",
      email: "admin@maisonsac-luxury.com"
    });
  },

  saveAdminProfile: (data: AdminProfile) => {
    localStorage.setItem("mds_admin_profile", JSON.stringify(data));
    adminService.syncPost("settings/admin-profile", data);
  },

  getMediaLibrary: (): string[] => {
    return loadLocal("mds_media_library", PrePopulatedMedia);
  },

  saveMediaLibrary: (list: string[]) => {
    localStorage.setItem("mds_media_library", JSON.stringify(list));
    adminService.syncPost("media/bulk", list);
  },

  // Perform post back to server endpoints
  syncPost: async (endpoint: string, payload: any) => {
    try {
      const isAuthentic = localStorage.getItem("at_is_authenticated") === "true";
      await fetch(`/api/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": isAuthentic ? "Bearer admin-token" : ""
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn(`Admin write back omitted: ${endpoint}`, err);
    }
  },

  // Synchronize admin listings upon boot
  initializeSync: async () => {
    try {
      const isAuthentic = localStorage.getItem("at_is_authenticated") === "true";
      const headers = {
        "Authorization": isAuthentic ? "Bearer admin-token" : ""
      };

      const cRes = await fetch("/api/v1/settings/contact");
      if (cRes.ok) localStorage.setItem("mds_contact_info", JSON.stringify(await cRes.json()));

      const wRes = await fetch("/api/v1/settings/website");
      if (wRes.ok) localStorage.setItem("mds_website_settings", JSON.stringify(await wRes.json()));

      const aRes = await fetch("/api/v1/settings/appearance");
      if (aRes.ok) localStorage.setItem("mds_appearance_settings", JSON.stringify(await aRes.json()));

      const pRes = await fetch("/api/v1/pages");
      if (pRes.ok) localStorage.setItem("mds_static_pages", JSON.stringify(await pRes.json()));

      const apRes = await fetch("/api/v1/settings/admin-profile");
      if (apRes.ok) localStorage.setItem("mds_admin_profile", JSON.stringify(await apRes.json()));

      const mRes = await fetch("/api/v1/media");
      if (mRes.ok) localStorage.setItem("mds_media_library", JSON.stringify(await mRes.json()));

      const sRes = await fetch("/api/v1/newsletter/subscribers", { headers });
      if (sRes.ok) localStorage.setItem("mds_subscribers", JSON.stringify(await sRes.json()));
    } catch (_) {
      console.warn("Bootstrap admin settings offline");
    }
  }
};
