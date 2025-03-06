import { ICarServiceWashPackage } from "@/types/CarServices";

interface WashPackageProps {
  data: ICarServiceWashPackage;
}

const WashPackage: React.FC<WashPackageProps> = ({ data }) => {
  return (
    <div
      key={data.id}
      className="border border-neutral-100 p-2 rounded-lg flex-shrink-0 max-w-[150px]"
    >
      <div className="text-title-2 text-neutral-900">{data.name}</div>
      <div className="flex items-center gap-1 text-headline-5 my-1">
        <span className="text-neutral-900">${data.price}</span>
        {data.discount && (
          <span className="text-accent-green">
            ${data.price - data.discount}
          </span>
        )}
      </div>
      <div className="text-body-2 text-neutral-500">{data.description}</div>
    </div>
  );
};

export default WashPackage;
