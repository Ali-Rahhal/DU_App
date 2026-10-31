export interface CompanyConfig {
  id: string;
  name: string;
  abreviation: string;
  logo: string;
  placeholder: string;
  favicon: string;
  about: string;
  location: string;

  transalations: {
    description: string;
    copyright: string;
  };

  social: {
    email: string;
    phone: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };

  features: {
    survey: boolean;
    complaints: boolean;
    loyalty: boolean;
    expiryDeals: boolean;
  };
}

export const Companies = {
  DU: {
    id: "DU",
    name: "Droguerie de L'Union Pharmaceutical Company",
    abreviation: "DU",
    logo: "/assets/img/DU/logo.png",
    placeholder: "/assets/img/DU/product/PlaceholderImage.jpg",
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",
    location: "",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
      email: "",
      phone: "",
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  UPO: {
    id: "UPO",
    name: "Union Pharmaceutique d'Orient",
    abreviation: "UPO",
    logo: "/assets/img/UPO/logo.png",
    placeholder: "/assets/img/DU/product/PlaceholderImage.jpg",
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",
    location: "",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
      email: "",
      phone: "",
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  FDC: {
    id: "FDC",
    name: "Food & Drug Corporation",
    abreviation: "FDC",
    logo: "/assets/img/FDC/logo.png",
    placeholder: "/assets/img/DU/product/PlaceholderImage.jpg",
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",
    location: "",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
      email: "",
      phone: "",
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  SADCO: {
    id: "SADCO",
    name: "Sami Dandan & Co.",
    abreviation: "SADCO",
    logo: "/assets/img/SADCO/logo.png",
    placeholder: "/assets/img/SADCO/product/PlaceholderImage.jpeg",
    favicon: "/assets/img/SADCO/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",
    location:
      "https://www.google.com/maps/dir/Current+Location/33.872428407228696,35.49355722927045",

    transalations: {
      description: "company.description_sadco",
      copyright: "company.copyright_sadco",
    },

    social: {
      email: "info@sadco.com.lb",
      phone: "+961 1 855 560",
      facebook:
        "https://www.facebook.com/people/SADCO-Sami-Dandan-Co/100057607323297/",
      instagram: "https://www.instagram.com/sadco.lb?xtok=N3RyOGl5aHZkdzl6",
      linkedin: "https://www.linkedin.com/company/sadco-sal/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  VI: {
    id: "VI",
    name: "Vitalait",
    abreviation: "Vitalait",
    logo: "/assets/img/VITALAIT/logo.png",
    placeholder: "/assets/img/VITALAIT/product/PlaceholderImage.jpg",
    favicon: "/assets/img/VITALAIT/favicon.ico",
    about: "/assets/img/VITALAIT/extra/page-about.jpg",
    location: "",

    transalations: {
      description: "company.description_vitalait",
      copyright: "company.copyright_vitalait",
    },

    social: {
      email: "",
      phone: "",
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: false,
      complaints: false,
      loyalty: true,
      expiryDeals: true,
    },
  },
};

export type CompanyId = keyof typeof Companies;
