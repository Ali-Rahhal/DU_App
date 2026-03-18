import axios, { AxiosResponse } from "axios";
// export const publicApi = "http://localhost:5005/api";
// export const privateApi = "http://localhost:5005/api/auth";

// export const publicApi = "http://localhost:5005/api";
// export const privateApi = "http://localhost:5005/api/auth";
const publicApi = process.env.NEXT_PUBLIC_API_URL;
const privateApi = process.env.NEXT_PUBLIC_API_URL + "/auth";

const getCookieArray = (cookie: string) => {
  if (!cookie) return [];
  const cookieArray: {
    name: string;
    value: string;
  }[] = cookie?.split(";").map((cookie) => {
    const [name, value] = cookie.trim().split("=");
    return {
      name: name,
      value: value,
    };
  });
  return cookieArray;
};

const login = async ({
  code,
  password,
}: {
  code: string;
  password: string;
}) => {
  return await axios.post(
    publicApi + "/login",
    {
      code,
      password,
    },
    {
      withCredentials: true,
    },
  );
};
const logout = async () => {
  return await axios.post(publicApi + "/logout", {}, { withCredentials: true });
};

const getSurveys = async () => {
  return await axios.get(privateApi + "/survey/get_surveys", {
    withCredentials: true,
  });
};
const getSurveyElements = async (survey_id: string) => {
  return await axios.get(privateApi + "/survey/get_survey_elements", {
    params: {
      survey_id,
    },
    withCredentials: true,
  });
};

const saveSurvey = async (survey: any) => {
  return await axios.post(privateApi + "/survey/save_survey_answer", survey, {
    withCredentials: true,
  });
};
const saveComplaint = async (complaint: any) => {
  return await axios.post(
    privateApi + "/complaint/save_complaint_answer",
    complaint,
    {
      withCredentials: true,
    },
  );
};
const getUserComplaints = async () => {
  return await axios.get(privateApi + "/complaint/get-user-complaints", {
    withCredentials: true,
  });
};
// const register = async ({
//   email,
//   password,
//   first_name,
//   last_name,
//   phone_number,
// }: {
//   email: string;
//   password: string;
//   first_name: string;
//   last_name: string;
//   phone_number: string;
// }) => {
//   return await axios.post(publicApi + "/register", {
//     email,
//     password,
//     first_name,
//     last_name,
//     phone_number,
//   });
// };

// const verifyEmail = async (email: string, key: string): Promise<any> => {
//   return await axios.post(publicApi + "/verify_email", {
//     email,
//     key,
//   });
// };

// const sendVerify = async (email: string): Promise<any> => {
//   return await axios.post(publicApi + "/send_verify_email", {
//     email,
//   });
// };
const getUserDetails = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + "/user_details", {
    withCredentials: true,
  });
};
const forgotPassword = async (email: string): Promise<AxiosResponse> => {
  return await axios.post(publicApi + "/send_reset_email", {
    email,
  });
};
const validateResetCode = async (key: string): Promise<AxiosResponse> => {
  return await axios.post(publicApi + "/validate_reset_code", {
    key,
  });
};
const getDashboardData = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + "/dashboard_data", {
    withCredentials: true,
  });
};
// const changePasswordReset = async (
//   key: string,
//   password: string
// ): Promise<AxiosResponse> => {
//   return await axios.post(publicApi + "/change_password", {
//     key,
//     password,
//   });
// };
const changePassword = async (
  old_password: string,
  new_password: string,
  confirmed_password: string,
): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + "/change_password",
    {
      old_password,
      new_password,
      confirmed_password,
    },
    { withCredentials: true },
  );
};
const getProducts = async (
  filters: {
    skip?: number;
    take?: number;
    category_code?: string[];
    sub_category_code?: string;
    sort_by?: string;
    sort_direction?: string;
    min_price?: number;
    max_price?: number;
    onSale?: boolean;
    search?: string;
    onPromotionOnly?: boolean;
  },
  cookie?: string,
): Promise<AxiosResponse> => {
  const params = new URLSearchParams();

  params.append("skip", filters.skip.toString());
  params.append("take", filters.take ? filters.take.toString() : "10");

  const url = `/get_products?${params.toString()}`;

  return await axios.post(
    publicApi + url,
    {
      category_code: filters.category_code,
      sub_category_code: filters.sub_category_code,
      sort_by: filters.sort_by,
      sort_direction: filters.sort_direction,
      min_price: filters.min_price,
      max_price: filters.max_price,
      show_only_best_deals: filters.onSale,
      search: filters.search,
      onPromotionOnly: filters.onPromotionOnly,
    },
    {
      withCredentials: true,
      headers: {
        Cookie: cookie || "",
      },
    },
  );
};

const getProduct = async (
  item_code: string,
  cookie?: string,
): Promise<AxiosResponse> => {
  return await axios.get(publicApi + `/get_product/${item_code}`, {
    headers: {
      Cookie: cookie || "",
    },
    withCredentials: true,
  });
};
const addToFavorite = async (item_code: string): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/add_to_favorite`,
    {
      item_code: item_code,
    },
    { withCredentials: true },
  );
};
const removeFromFavorite = async (
  item_code: string,
): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/remove_from_favorite`,
    {
      item_code: item_code,
    },
    { withCredentials: true },
  );
};
const addToCart = async (
  item_code: string,
  barcode: string,
  quantity: number,
): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/add_to_cart`,
    {
      item_code: item_code,
      barcode: barcode,
      quantity: quantity,
    },
    { withCredentials: true },
  );
};
const removeFromCart = async (item_code: string): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/remove_from_cart`,
    {
      item_code: item_code,
    },
    { withCredentials: true },
  );
};
const getCartItems = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_cart_items`, {
    withCredentials: true,
  });
};
const updateCartItem = async (
  item_code: string,
  quantity: number,
): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/update_cart_item`,
    {
      item_code: item_code,
      quantity: quantity,
    },
    { withCredentials: true },
  );
};
const getFavoriteItems = async ({
  skip,
  take,
}: {
  skip: number;
  take: number;
}): Promise<AxiosResponse> => {
  const params = new URLSearchParams();

  // if (filters.category_code)
  //   params.append("category_code", filters.category_code);
  // if (filters.sub_category_code)
  //   params.append("sub_category_code", filters.sub_category_code);
  params.append("skip", skip.toString());
  params.append("take", take ? take.toString() : "10");
  return await axios.get(
    privateApi + `/get_favorite_items?${params.toString()}`,
    {
      withCredentials: true,
    },
  );
};

const updateUserDetails = async ({
  first_name,
  last_name,
  phone_number,
  address,
}: {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
}): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/update_user_detail`,
    {
      first_name,
      last_name,
      phone_number,
      address,
    },
    { withCredentials: true },
  );
};
const placeOrder = async (): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/place_order`,
    {},
    { withCredentials: true },
  );
};
const getOrders = async (search?: string): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_orders`, {
    withCredentials: true,
    params: {
      search: search,
    },
  });
};
const getOrderDetails = async (order_id: string): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_order_details`, {
    params: {
      order_id,
    },
    withCredentials: true,
  });
};
const getOrder = async (order_id: string): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_order`, {
    params: {
      order_id,
    },
    withCredentials: true,
  });
};
const getComplaints = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/complaint/get-complaint-types`, {
    withCredentials: true,
  });
};
const getComplaintElements = async (complaint_id: string): Promise<any> => {
  return await axios.get(privateApi + `/complaint/get-complaint-elements`, {
    params: {
      complaint_id,
    },
    withCredentials: true,
  });
};
const getOpenInvoices = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_open_invoices`, {
    withCredentials: true,
  });
};
const getSalesOrder = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_sales_invoices`, {
    withCredentials: true,
  });
};
const getInvoiceDetails = async (
  invoice_no: string,
): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_invoice_details`, {
    params: {
      invoice_no: invoice_no,
    },
    withCredentials: true,
  });
};
const getProductPromotion = async (
  item_code: string,
): Promise<AxiosResponse> => {
  return await axios.get(
    publicApi + `/get_product_promotions?item_code=${item_code}`,
    {
      withCredentials: true,
    },
  );
};

const getShoppingCartPromotions = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/get_shopping_cart_promotions`, {
    withCredentials: true,
  });
};

// const { password, first_name, last_name, phone_number } = body;
const createChild = async ({
  password,
  first_name,
  last_name,
  phone_number,
}: {
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/child/create`,
    {
      password,
      first_name,
      last_name,
      phone_number,
    },
    { withCredentials: true },
  );
};
// child_id,
// password,
// first_name,
// last_name,
// phone_number,

const editChild = async ({
  child_id,
  password,
  first_name,
  last_name,
  phone_number,
}: {
  child_id: number;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/child/edit`,
    {
      child_id,
      password,
      first_name,
      last_name,
      phone_number,
    },
    { withCredentials: true },
  );
};

const getChildren = async (search?: string): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/child`, {
    withCredentials: true,
    params: {
      search,
    },
  });
};

const getPromotions = async (): Promise<AxiosResponse> => {
  return await axios.get(publicApi + `/promotions`, {
    withCredentials: true,
  });
};
const disableChild = async (child_id: number): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/child/disable`,
    {
      child_id,
    },
    { withCredentials: true },
  );
};
const enableChild = async (child_id: number): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/child/enable`,
    {
      child_id,
    },
    { withCredentials: true },
  );
};
const deleteChild = async (child_id: number): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/child/delete`,
    {
      child_id,
    },
    { withCredentials: true },
  );
};
const getAllChildPermissions = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/child/all_permissions`, {
    withCredentials: true,
  });
};
const updateChildPermissions = async ({
  child_id,
  permissionsIds,
}: {
  child_id: number;
  permissionsIds: number[];
}): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + `/child/update_permissions`,
    {
      child_id,
      permissionsIds,
    },
    { withCredentials: true },
  );
};

// User Management APIs
const getUsers = async (
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
): Promise<AxiosResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());
  if (search) params.append("search", search);

  return await axios.get(privateApi + `/users?${params.toString()}`, {
    withCredentials: true,
  });
};

const getUserById = async (id: number): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/users/${id}`, {
    withCredentials: true,
  });
};

const createUser = async (userData: {
  code?: string;
  first_name: string;
  last_name?: string;
  description?: string;
  password: string;
  type?: number;
  phone?: string;
  balance?: number;
  country?: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  is_active?: boolean;
  parent_id?: number;
  sequence?: number;
  role?: string;
}): Promise<AxiosResponse> => {
  return await axios.post(privateApi + `/users`, userData, {
    withCredentials: true,
  });
};

const updateUser = async (
  id: number,
  userData: {
    first_name?: string;
    last_name?: string;
    description?: string;
    password?: string;
    type?: number;
    phone?: string;
    balance?: number;
    country?: string;
    is_verified?: boolean;
    is_blocked?: boolean;
    is_active?: boolean;
    parent_id?: number;
    sequence?: number;
    role?: string;
  },
): Promise<AxiosResponse> => {
  return await axios.put(privateApi + `/users/${id}`, userData, {
    withCredentials: true,
  });
};

const toggleUserStatus = async (id: number): Promise<AxiosResponse> => {
  return await axios.patch(
    privateApi + `/users/${id}/toggle-status`,
    {},
    {
      withCredentials: true,
    },
  );
};

const getUserPermissions = async (userId: number): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/users/${userId}/permissions`, {
    withCredentials: true,
  });
};

const getAllPermissions = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + `/users/permissions/all`, {
    withCredentials: true,
  });
};

const updateUserPermissions = async (
  userId: number,
  permissionIds: number[],
): Promise<AxiosResponse> => {
  return await axios.put(
    privateApi + `/users/${userId}/permissions`,
    { permissionIds },
    { withCredentials: true },
  );
};

export {
  login,
  // register,
  // verifyEmail,
  // sendVerify,
  logout,
  forgotPassword,
  validateResetCode,
  getUserDetails,
  updateUserDetails,
  changePassword,
  getProducts,
  getProduct,
  addToFavorite,
  removeFromFavorite,
  addToCart,
  removeFromCart,
  getCartItems,
  updateCartItem,
  getFavoriteItems,
  placeOrder,
  getCookieArray,
  getOrders,
  getOrderDetails,
  getOrder,
  getDashboardData,
  getOpenInvoices,
  getSalesOrder,
  getInvoiceDetails,
  getPromotions,
  getProductPromotion,
  getShoppingCartPromotions,
  getSurveys,
  getSurveyElements,
  saveSurvey,
  getComplaints,
  getComplaintElements,
  saveComplaint,
  getUserComplaints,
  // createChild,
  // getChildren,
  // editChild,
  // updateChildPermissions,
  // getAllChildPermissions,
  // disableChild,
  // enableChild,
  // deleteChild,
  publicApi,
  privateApi,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  getUserPermissions,
  updateUserPermissions,
  getAllPermissions,
};
