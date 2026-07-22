import { CartItem } from "@/types/productTypes";
import {
  getCartItems,
  getUserDetails,
  login,
  logout,
  removeFromCart,
  updateCartItem,
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
  phone: string;
  address: string;

  permissions: string[];
  type: number | null;
  role: string | null;

  setHydrated: (v: boolean) => void;

  setAccount: (data: {
    name: string;
    code: string;
    phone: string;
    address: string;
    cart: number;
    cartItems: any[];
  }) => void;

  refreshUserInfo: () => void;
  refreshCart: () => void;

  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
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
      code: "",
      phone: "",
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

      refreshUserInfo: async () => {
        if (!useAuthStore.getState().isAuth) return;

        try {
          const res = await getUserDetails();

          set({
            name: `${res.data.result.first_name} ${res.data.result.last_name || ""}`,
            firstName: res.data.result.first_name,
            lastName: res.data.result.last_name || "",
            code: res.data.result.code,
            phone: res.data.result.phone,
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
            code: "",
            phone: "",
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

      setAccount: ({ name, code, phone, address, cart }) =>
        set({ name, code, phone, address, cart }),
    }),
    {
      name: "account",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

type AuthStore = {
  token: string | null;
  isAuth: boolean;

  login: ({
    code,
    password,
  }: {
    code: string;
    password: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isAuth: false,
      login: async ({ code, password }) => {
        const result = await login({ code: code, password }).then((res) => {
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
          document.cookie = `companyId=${process.env.NEXT_PUBLIC_DEFAULT_COMPANY}; path=/; max-age=31536000; SameSite=Lax`;
        }

        try {
          await logout();
        } catch (err) {
          console.log(err);
        }
      },
    }),
    {
      name: "auth",
    },
  ),
);

type CompanyStore = {
  hydrated: boolean;
  companyDisabled: boolean;

  companyId: CompanyId;

  setCompany: (companyId: CompanyId) => void;

  setHydrated: (v: boolean) => void;

  getCompanyConfig: () => CompanyConfig;
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      companyDisabled: false,

      companyId: process.env.NEXT_PUBLIC_DEFAULT_COMPANY as CompanyId,

      setCompany: (companyId) => {
        set({ companyId });
      },

      setHydrated: (v) => set({ hydrated: v }),

      getCompanyConfig: () => {
        const state = get();

        return Companies[state.companyId];
      },
    }),
    {
      name: "company",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const company = Companies[state.companyId];

        if (!company || !company.enabled) {
          state.companyDisabled = true;
        }

        state?.setHydrated(true);
      },
    },
  ),
);
