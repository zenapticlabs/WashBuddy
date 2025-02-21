import { ICarServiceWashPackage } from "@/types/CarServices";

const washPackages: ICarServiceWashPackage[] = [
  {
    id: "1",
    name: "Wash Package 1",
    price: 10,
    discount: 5,
    description: "Basic wash with soap and water",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "2",
    name: "Wash Package 2",
    price: 20,
    description: "Basic wash with soap and water",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "3",
    name: "Wash Package 3",
    price: 20,
    description: "Waxing and polishing",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export interface CarWashPackagesProps {}

const CarWashPackages: React.FC<CarWashPackagesProps> = ({}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-hidden relative">
        {washPackages.map((wp) => (
          <div
            key={wp.id}
            className="border border-neutral-100 w-[150px] p-2 rounded-lg flex-shrink-0"
          >
            <div className="text-title-2 text-neutral-900">{wp.name}</div>
            <div className="flex items-center gap-1 text-headline-5 my-1">
              <span className="text-neutral-900">${wp.price}</span>
              {wp.discount && (
                <span className="text-accent-green">
                  ${wp.price - wp.discount}
                </span>
              )}
            </div>
            <div className="text-body-2 text-neutral-500">{wp.description}</div>
          </div>
        ))}
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-white" />
      </div>
    </div>
  );
};

export default CarWashPackages;
