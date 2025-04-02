export const CAR_SERVICES_TYPE = {
  WASH_TYPE: "Wash Type",
  AMENITIES: "Amenities",
};

export const Car_Wash_Type = {
  AUTOMATIC: "Automatic",
  SELF_SERVICE: "Self Service",
};

export const Car_Wash_Type_Value = {
  AUTOMATIC: "automatic",
  SELF_SERVICE: "selfservice",
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

export const OPERATING_HOURS = Array.from({ length: 7 }, (_, index) => ({
  day_of_week: index,
  is_closed: false,
  opening_time: "06:00",
  closing_time: "18:00",
}));

export const DEFAULT_PAYLOAD = {
  operating_hours: OPERATING_HOURS,
  images: [],
  wash_types: [],
  amenities: [],
  phone: "",
  reviews_count: 0,
  reviews_average: 0,
  open_24_hours: true,
  verified: false,
};

export const FORM_CONFIG = [
  {
    name: "car_wash_name",
    label: "Name",
    type: "text",
    placeholder: "Enter car wash name",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    placeholder: "Enter phone number",
  },
  {
    name: "website",
    label: "Website",
    type: "text",
    placeholder: "Enter website",
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter email",
  },
];