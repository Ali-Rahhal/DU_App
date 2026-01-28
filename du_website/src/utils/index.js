export const roundOff = (number, count = 2) => {
  return parseFloat(number).toFixed(count);
};
export const discount = (price, oldPrice) =>
  oldPrice ? roundOff((100 * (oldPrice - price)) / oldPrice) : 0;
const dev = process.env.NODE_ENV !== "production";
export const server = "http://localhost:3000";

// Delete Product from List By Id
export const deleteProduct = (list, id) => {
  const filter = list.filter((item) => item._id !== id);
  return filter;
};

// Find Product Index From List
export const findProductIndex = (list, slug) => {
  const index = list.findIndex((item) => item.slug === slug);
  return index;
};
export const findProductIndexById = (list, id) => {
  const index = list.findIndex((item) => item._id === id);
  return index;
};

export const currenncyCodeToSymbol = (code) => {
  return code?.includes("USD") ? "$" : "L.L.";
};
export const statusIdToText = (status_id) => {
  //with themify icons
  const statusDictionary = [
    {
      id: 1,
      text: "DRAFT",
      //icon: "drafts",
      icon: "ti-pencil",
      color: "#868e96",
    },
    {
      id: 2,
      text: "SUBMITTED",
      //icon: "send",
      icon: "ti-share",
      color: "#1971c2",
    },
    {
      id: 3,
      text: "WAITING FOR APPROVAL",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 4,
      text: "AWAITING DELIVERY ",
      //icon: "check_circle_outline",
      icon: "ti-check",
      color: "#2f9e44",
    },
    {
      id: 5,
      text: "PENDING",
      //icon: "update",
      icon: "ti-timer",
      color: "#868e96",
    },
    {
      id: 7,
      text: "RECIEVED",
      //icon: "move_to_inbox",
      icon: "ti-package",
      color: "#2f9e44",
    },
    {
      id: 8,
      text: "DELIVERED",
      //icon: "local_shipping",
      icon: "ti-truck",
      color: "#2f9e44",
    },

    {
      id: 9,
      text: "REJECTED",
      //icon: "error_outline",
      icon: "ti-close",
      color: "#c92a2a",
    },

    {
      id: 10,
      text: "DELETED",
      //icon: "delete",
      icon: "ti-trash",
      color: "#c92a2a",
    },
    {
      id: 12,
      text: "PROCESSED",
      //icon: "settings",
      icon: "ti-settings",
      color: "#2f9e44",
    },
    {
      id: 14,
      text: "WAITING WAREHOUSEKEEPER",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 19,
      text: "WAITING FOR SALES MANAGER",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 21,
      text: "PREPARING",
      //icon: "settings",
      icon: "ti-settings",
      color: "#1971c2",
    },
    {
      id: 25,
      text: "ON CREDIT HOLD",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#c92a2a",
    },

    {
      id: 27,
      text: "DELIVERY HOLD",
      //icon: "departure_board",
      icon: "ti-alert",
      color: "#c92a2a",
    },
    {
      id: 30,
      text: "WAITING VALIDATION",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 31,
      text: "WAITING PACKING",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 32,
      text: "PICKING",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 33,
      text: "PACKING",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 34,
      text: "ASSIGNED",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#2f9e44",
    },
    {
      id: 35,
      text: "PACKED",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#2f9e44",
    },
    {
      id: 36,
      text: "PUT AWAY",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#2f9e44",
    },
    {
      id: 37,
      text: "WAITING DISPATCH",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 38,
      text: "DISPATCHED",
      //icon: "move_to_inbox",
      icon: "ti-package",
      color: "#1971c2",
    },
    {
      id: 39,
      text: "DISPATCHING",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#1971c2",
    },
    {
      id: 42,
      text: "UNDELIVERED",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#c92a2a",
    },
    {
      id: 43,
      text: "UNLOADED",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#2f9e44",
    },
    {
      id: 44,
      text: "RETURNED DELIVERY",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#c92a2a",
    },
    {
      id: 45,
      text: "PARTIALY DELIVERED",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#c92a2a",
    },
    {
      id: 46,
      text: "PARTIALY RETURNED",
      //icon: "error_outline",
      icon: "ti-alert",
      color: "#c92a2a",
    },
  ];
  const status = statusDictionary.find((item) => item.id === status_id);
  return status;
};
