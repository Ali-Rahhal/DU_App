import { useCompanyStore } from "@/store/zustand";

export const useCompanyAssets = () => {
  return useCompanyStore((state) => {
    const company = state.getCompanyConfig();

    return {
      companyHydrated: state.hydrated,
      companyDisabled: state.companyDisabled,
      companyStatusLoaded: state.companyStatusLoaded,
      checkCompanyEnabled: state.checkCompanyEnabled,
      companyId: state.hydrated ? company.id : "",
      companyName: state.hydrated ? company.name : "",
      companyAbreviation: state.hydrated ? company.abreviation : "",
      companyLogo: state.hydrated ? company.logo : "",
      companyPlaceholder: state.hydrated
        ? company.placeholder
        : "/assets/img/global/placeholder.png",
      companyFavicon: state.hydrated ? company.favicon : "",
      companyAboutImage: state.hydrated ? company.about : "",
      companyLocation: state.hydrated ? company.location : "",
      companyDescription: state.hydrated
        ? company.transalations.description
        : "company.place_holder",
      companyCopyright: state.hydrated
        ? company.transalations.copyright
        : "company.place_holder",
      companyEmail: state.hydrated ? company.social.email : "",
      companyPhone: state.hydrated ? company.social.phone : "",
      companyFacebook: state.hydrated ? company.social.facebook : "#",
      companyLinkedin: state.hydrated ? company.social.linkedin : "#",
      companyInstagram: state.hydrated ? company.social.instagram : "#",
    };
  });
};
