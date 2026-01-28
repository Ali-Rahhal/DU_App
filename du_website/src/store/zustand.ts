import { getCartItems, getUserDetails, login, logout } from "@/utils/apiCalls";
import { create } from "zustand";
import { persist } from "zustand/middleware";
type AccountSore = {
  cart: number;
  cartItems: any[];
  name: string;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  setAccount: ({
    name,
    code,
    phone,
    address,
    cart,
  }: {
    name: string;
    code: string;
    phone: string;
    address: string;
    cart: number;
    cartItems: any[];
  }) => void;
  refreshUserInfo: () => void;
  refreshCart: () => void;
};
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

export const useAccountStore = create<AccountSore>((set) => ({
  cart: 0,
  cartItems: [],
  name: "",
  firstName: "",
  lastName: "",
  code: "",
  phone: "",
  address: "",
  refreshUserInfo: async () => {
    if (!useAuthStore.getState().isAuth) return;
    getUserDetails()
      .then((res) => {
        set({
          name: `${res.data.result.first_name} ${
            res.data.result.last_name || ""
          }`,
          cart: res.data.result.cart,
          lastName: res.data.result.last_name || "",
          firstName: res.data.result.first_name,
          code: res.data.result.code,
          phone: res.data.result.phone,
          address: res.data.result.address,
        });
      })
      .catch(() => {
        useAuthStore.getState().logout();
        useAuthStore.setState({ isAuth: false, token: null });
        set({
          firstName: "",
          lastName: "",
          name: "",
          cart: 0,
          code: "",
          phone: "",
          address: "",
        });
      });
  },
  refreshCart: async () => {
    if (!useAuthStore.getState().isAuth) return;
    getCartItems()
      .then((res) => {
        set({
          cartItems: res.data?.result.products,
          cart: res.data?.result.products.length,
        });
      })
      .catch(() => {
        useAuthStore.getState().logout();
        useAuthStore.setState({ isAuth: false, token: null });
        set({ cartItems: [] });
      });
  },
  setAccount: ({ name, code, phone, address, cart }) =>
    set({ name, code, phone, address, cart }),
}));

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isAuth: false,
      login: async ({ code, password }) => {
        const result = await login({ code: code, password }).then((res) => {
          set({ isAuth: true, token: res.data.result.token });
          //refresh cart
          useAccountStore.getState().refreshCart();
          return res;
        });

        return result;
      },
      logout: async () => {
        // Logout user code
        set({ isAuth: false, token: null });
        try {
          await logout();
        } catch (err) {
          console.log(err);
        }
      },
    }),
    {
      name: "auth",
    }
  )
);
