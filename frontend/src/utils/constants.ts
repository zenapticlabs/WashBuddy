import AirDryerIcon from "@/assets/wash-type-icons/Air dryer.svg";
import DryerIcon from "@/assets/wash-type-icons/dryer.svg";
import GraphineIcon from "@/assets/wash-type-icons/Graphine Sealant.svg";
import HotWaxIcon from "@/assets/wash-type-icons/Hot wax.svg";
import RainRepellantIcon from "@/assets/wash-type-icons/Rain Repellant.svg";
import TireShineIcon from "@/assets/wash-type-icons/Tire Shine.svg";
import TouchlessWashIcon from "@/assets/wash-type-icons/Touchless wash.svg";
import TripleFoamIcon from "@/assets/wash-type-icons/Triple foam.svg";
import UnderBodyFlushIcon from "@/assets/wash-type-icons/Underbody flush.svg";
import UnderBodySprayIcon from "@/assets/wash-type-icons/Underbody spray.svg";

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

export const CarWashTypes = [
  {
    id: 1,
    name: "Automatic",
    value: Car_Wash_Type_Value.AUTOMATIC,
  },
  {
    id: 2,
    name: "Self Service",
    value: Car_Wash_Type_Value.SELF_SERVICE,
  },
];

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
  automatic_car_wash: false,
  self_service_car_wash: false,
  images: [],
  wash_types: [],
  amenities: [],
  phone: "",
  reviews_count: 0,
  reviews_average: 0,
  packages: [],
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

export const ReviewSortBy = [
  {
    label: "Relevance",
    value: "relevance",
  },
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Highest",
    value: "highest",
  },
  {
    label: "Lowest",
    value: "lowest",
  },
];

export interface CarwashPackage {
  id?: number;
  name: string;
  price: number;
  washTypes: number[];
}

export const WashTypes = [
  {
    id: 1,
    status: "ACTIVE",
    name: "Touchless wash",
    description: "",
    category: "automatic",
    subclass: "Clean",
    created_by: null,
    updated_by: null,
    icon: TouchlessWashIcon,
  },
  {
    id: 2,
    status: "ACTIVE",
    name: "Tire soak",
    description: "",
    category: "automatic",
    subclass: "Clean",
    created_by: null,
    updated_by: null,
    icon: TireShineIcon,
  },
  {
    id: 3,
    status: "ACTIVE",
    name: "Underbody flush",
    description: "",
    category: "automatic",
    subclass: "Clean",
    created_by: null,
    updated_by: null,
    icon: UnderBodyFlushIcon,
  },
  {
    id: 5,
    status: "ACTIVE",
    name: "Triple foam / clear coat foam",
    description: "",
    category: "automatic",
    subclass: "Polish",
    created_by: null,
    updated_by: null,
    icon: TripleFoamIcon,
  },
  {
    id: 6,
    status: "ACTIVE",
    name: "Tire Shine",
    description: "",
    category: "automatic",
    subclass: "Polish",
    created_by: null,
    updated_by: null,
    icon: TireShineIcon,
  },
  {
    id: 7,
    status: "ACTIVE",
    name: "Wax Treatment",
    description: "",
    category: "automatic",
    subclass: "Polish",
    created_by: null,
    updated_by: null,
    icon: HotWaxIcon,
  },
  {
    id: 8,
    status: "ACTIVE",
    name: "Ceramic/Graphine Sealant",
    description: "",
    category: "automatic",
    subclass: "Polish",
    created_by: null,
    updated_by: null,
    icon: GraphineIcon,
  },
  {
    id: 9,
    status: "ACTIVE",
    name: "Rain Repellant",
    description: "",
    category: "automatic",
    subclass: "Polish",
    created_by: null,
    updated_by: null,
    icon: RainRepellantIcon,
  },
  {
    id: 10,
    status: "ACTIVE",
    name: "Dryer",
    description: "",
    category: "automatic",
    subclass: "Shine/Dry",
    created_by: null,
    updated_by: null,
    icon: DryerIcon,
  },
];
