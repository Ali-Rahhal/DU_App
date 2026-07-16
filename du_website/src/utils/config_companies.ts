export interface CompanyConfig {
  id: string;
  name: string;
  abreviation: string;
  logo: string;
  placeholder: string;
  favicon: string;
  about: string;

  transalations: {
    description: string;
    copyright: string;
  };

  social: {
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
    placeholder: process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE_DU,
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page_about.jpg",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
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
  // UPO: {
  //   id: "UPO",
  //   name: "Union Pharmaceutique d'Orient",
  //   abreviation: "UPO",
  //   logo: "/assets/img/UPO/logo.png",
  //   placeholder: process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE_DU,
  //   favicon: "/assets/img/UPO/favicon.ico",
  //   about: "/assets/img/UPO/extra/page_about.jpg",

  //   transalations: {
  //     description: "",
  //     copyright: "",
  //   },

  //   social: {
  //     facebook: "/",
  //     instagram: "/",
  //     linkedin: "/",
  //   },

  //   features: {
  //     survey: true,
  //     complaints: true,
  //     loyalty: false,
  //     expiryDeals: true,
  //   },
  // },
  // FDC: {
  //   id: "FDC",
  //   name: "Food & Drug Corporation",
  //   abreviation: "FDC",
  //   logo: "/assets/img/FDC/logo.png",
  //   placeholder: process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE_DU,
  //   favicon: "/assets/img/FDC/favicon.ico",
  //   about: "/assets/img/FDC/extra/page_about.jpg",

  //   transalations: {
  //     description: "",
  //     copyright: "",
  //   },

  //   social: {
  //     facebook: "/",
  //     instagram: "/",
  //     linkedin: "/",
  //   },

  //   features: {
  //     survey: true,
  //     complaints: true,
  //     loyalty: false,
  //     expiryDeals: true,
  //   },
  // },
  // SADCO: {
  //   id: "SADCO",
  //   name: "Sami Dandan & Co.",
  //   abreviation: "SADCO",
  //   logo: "/assets/img/SADCO/logo.png",
  //   placeholder: process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE_DU,
  //   favicon: "/assets/img/SADCO/favicon.ico",
  //   about: "/assets/img/SADCO/extra/page_about.jpg",

  //   transalations: {
  //     description: "",
  //     copyright: "",
  //   },

  //   social: {
  //     facebook: "/",
  //     instagram: "/",
  //     linkedin: "/",
  //   },

  //   features: {
  //     survey: true,
  //     complaints: true,
  //     loyalty: false,
  //     expiryDeals: true,
  //   },
  // },
  VI: {
    id: "VI",
    name: "Vitalait",
    abreviation: "Vitalait",
    logo: "/assets/img/VITALAIT/logo.png",
    placeholder: process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE_VI,
    favicon: "/assets/img/VITALAIT/favicon.ico",
    about: "/assets/img/VITALAIT/extra/page_about.jpg",

    transalations: {
      description: "company.description_vitalait",
      copyright: "company.copyright_vitalait",
    },

    social: {
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
