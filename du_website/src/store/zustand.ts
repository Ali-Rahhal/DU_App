import { CartItem } from "@/types/productTypes";
import {
  getCartItems,
  getCompanyStatus,
  getUserDetails,
  login,
  logout,
  removeFromCart,
  updateCartItem,
  switchCompany as switchCompanyApi,
} from "@/utils/apiCalls";
import { ROLES } from "@/utils/data";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Companies, CompanyId, CompanyConfig } from "@/utils/config_companies";

type AccountStore = {
  hydrated: boolean;

  cart: number;
  cartItems: CartItem[];

  name: string;
  code: string;
  firstName: string;
  lastName: string;
  pharmacy_name: string;
  moh_number: string;
  phone: string;
  email: string;
  address: string;

  permissions: string[];
  type: number | null;
  role: string | null;

  setHydrated: (v: boolean) => void;

  setAccount: (data: {
    name: string;
    pharmacy_name: string;
    code: string;
    moh_number: string;
    phone: string;
    email: string;
    address: string;
    cart: number;
    cartItems: any[];
  }) => void;

  refreshUserInfo: () => void;
  refreshCart: () => void;

  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;

  resetAccount: () => void;
};

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      cart: 0,
      cartItems: [],
      name: "",
      firstName: "",
      lastName: "",
      pharmacy_name: "",
      moh_number: "",
      code: "",
      phone: "",
      email: "",
      address: "",
      type: null,
      role: null,
      permissions: [],

      checkPermission: (permission) => {
        const state = get();
        if (state.role !== ROLES.SysUser) return true;
        return state.permissions.includes(permission);
      },

      checkRole: (role) => {
        const state = get();
        return state.role === role;
      },

      resetAccount: () =>
        set({
          cart: 0,
          cartItems: [],
          name: "",
          firstName: "",
          lastName: "",
          pharmacy_name: "",
          moh_number: "",
          code: "",
          phone: "",
          email: "",
          address: "",
          type: null,
          role: null,
          permissions: [],
        }),

      refreshUserInfo: async () => {
        if (!useAuthStore.getState().isAuth) return;

        try {
          const res = await getUserDetails();

          set({
            name: `${res.data.result.first_name} ${res.data.result.last_name || ""}`,
            firstName: res.data.result.first_name,
            lastName: res.data.result.last_name || "",
            pharmacy_name: res.data.result.pharmacy_name,
            moh_number: res.data.result.moh_number,
            code: res.data.result.code,
            phone: res.data.result.phone,
            email: res.data.result.email,
            address: res.data.result.address,
            type: res.data.result.type,
            role: res.data.result.role,
            permissions: res.data.result.permissions,
            cart: res.data.result.cart,
          });
        } catch (e) {
          useAuthStore.getState().logout();
          set({
            name: "",
            firstName: "",
            lastName: "",
            pharmacy_name: "",
            code: "",
            moh_number: "",
            phone: "",
            email: "",
            address: "",
            role: null,
            permissions: [],
            cart: 0,
          });
        }
      },

      refreshCart: async () => {
        if (!useAuthStore.getState().isAuth) return;

        try {
          const res = await getCartItems();
          const items = res.data?.result.products || [];

          const updatedItems = await Promise.all(
            items.map(async (item) => {
              let stock = item.stock;
              let itemCode = item.item_code;

              if (item.isExpiryDeal) {
                itemCode = item.parent_item_code;
              }

              if (!stock || stock === 0) {
                await removeFromCart(itemCode, item.isExpiryDeal);
                return null;
              }

              if (item.quantity > stock) {
                await updateCartItem(itemCode, stock, item.isExpiryDeal);
                return { ...item, quantity: stock };
              }

              return item;
            }),
          );

          const finalItems = updatedItems.filter(Boolean) as CartItem[];

          set({
            cartItems: finalItems,
            cart: finalItems.length,
          });
        } catch (e) {
          useAuthStore.getState().logout();
          set({ cartItems: [], cart: 0 });
        }
      },

      setAccount: ({
        name,
        pharmacy_name,
        code,
        moh_number,
        phone,
        email,
        address,
        cart,
      }) =>
        set({
          name,
          pharmacy_name,
          code,
          moh_number,
          phone,
          email,
          address,
          cart,
        }),
    }),
    {
      name: "accountCustomerPortalApp",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

type AuthStore = {
  token: string | null;
  isAuth: boolean;

  setToken: (token: string | null) => void;
  login: ({
    moh_number,
    password,
  }: {
    moh_number: string;
    password: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      isAuth: false,

      setToken: (token) => set({ token, isAuth: !!token }),
      login: async ({ moh_number, password }) => {
        const result = await login({ moh_number, password }).then((res) => {
          set({
            isAuth: true,
            token: res.data.result.token,
          });
          //refresh cart
          useAccountStore.getState().refreshCart();
          useAccountStore.setState({
            type: res.data.result.type,
            role: res.data.result.role,
            permissions: res.data.result.permissions,
          });
          return res;
        });

        return result;
      },
      logout: async () => {
        // Logout user code
        set({ isAuth: false, token: null });

        // reset company
        if (useCompanyStore.getState().companyDisabled) {
          useCompanyStore.setState({
            companyId: process.env.NEXT_PUBLIC_DEFAULT_COMPANY as CompanyId,
            companyDisabled: false,
          });
          document.cookie = `companyIdCustomerPortalApp=${process.env.NEXT_PUBLIC_DEFAULT_COMPANY}; path=/; max-age=31536000; SameSite=Lax`;
        }

        try {
          await logout();
        } catch (err) {
          console.log(err);
        }
      },
    }),
    {
      name: "authCustomerPortalApp",
    },
  ),
);

type CompanyStore = {
  hydrated: boolean;
  companyDisabled: boolean;
  companyStatusLoaded: boolean;

  companyId: CompanyId;

  setCompany: (companyId: CompanyId) => void;
  setHydrated: (v: boolean) => void;
  getCompanyConfig: () => CompanyConfig;
  checkCompanyEnabled: () => Promise<void>;
  switchCompany: (companyId: CompanyId) => Promise<void>;
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      companyDisabled: false,
      companyStatusLoaded: false,

      companyId: process.env.NEXT_PUBLIC_DEFAULT_COMPANY as CompanyId,

      setCompany: (companyId) => {
        set({ companyId });
      },

      setHydrated: (v) => set({ hydrated: v }),

      getCompanyConfig: () => {
        const state = get();
        return Companies[state.companyId];
      },

      checkCompanyEnabled: async () => {
        const { companyId } = get();
        try {
          const res = await getCompanyStatus();
          const isEnabled = res.data.result[companyId] ?? false;
          set({ companyDisabled: !isEnabled, companyStatusLoaded: true });
        } catch {
          // fail closed: if we can't confirm the company is enabled, treat it as disabled
          set({ companyDisabled: true, companyStatusLoaded: true });
        }
      },

      switchCompany: async (companyId) => {
        // Server verifies access and sets the new auth + company cookies
        const res = await switchCompanyApi(companyId);

        // Replace the old company's token
        useAuthStore.getState().setToken(res.data.result.token);

        set({ companyId, companyDisabled: false });

        // Clear the old company's account data, then load the new one
        useAccountStore.getState().resetAccount();
        await useAccountStore.getState().refreshUserInfo();
        await useAccountStore.getState().refreshCart();
      },
    }),
    {
      name: "companyCustomerPortalApp",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state?.setHydrated(true);
      },
    },
  ),
);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

interface PWAInstallStore {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;

  setDeferredPrompt: (event: BeforeInstallPromptEvent | null) => void;

  setIsInstalled: (value: boolean) => void;
}

export const usePWAInstallStore = create<PWAInstallStore>((set) => ({
  deferredPrompt: null,
  isInstalled: false,

  setDeferredPrompt: (event) => set({ deferredPrompt: event }),

  setIsInstalled: (value) => set({ isInstalled: value }),
}));
