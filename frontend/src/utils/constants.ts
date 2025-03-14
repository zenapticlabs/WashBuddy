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
    {
      label: "Recommended",
      value: "recommended",
    },
    {
      label: "Price (high to low)",
      value: "price_high_to_low",
    },
    {
      label: "Price (low to high)",
      value: "price_low_to_high",
    },
    {
      label: "Distance (near to far)",
      value: "distance_near_to_far",
    },
  ],
  [Car_Wash_Type.SELF_SERVICE]: [
    {
      label: "Price per minute (low to high)",
      value: "price_low_to_high",
    },
    {
      label: "Price per minute (high to low)",
      value: "price_high_to_low",
    },
    {
      label: "Distance (near to far)",
      value: "distance_near_to_far",
    },
  ],
};
