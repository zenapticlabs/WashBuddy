export const CAR_SERVICES_TYPE = {
  WASH_TYPE: "Wash Type",
  AMENITIES: "Amenities",
};

export const Car_Wash_Type = {
  AUTOMATIC: "Automatic",
  SELF_SERVICE: "Self Service",
};

export const SortBy = {
  [Car_Wash_Type.AUTOMATIC]: [
    "Recommended",
    "Price (low to high)",
    "Distance (near to far)",
  ],
  [Car_Wash_Type.SELF_SERVICE]: [
    "Price per minute (low to high)",
    "Price to start (low to high)",
    "Distance (near to far)",
  ],
};

