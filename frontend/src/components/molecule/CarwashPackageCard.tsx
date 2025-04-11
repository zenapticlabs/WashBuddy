import { CarWashTypes, WashTypes, type CarwashPackage } from "@/utils/constants";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import Image from "next/image";
import { DeleteIcon, Trash2Icon, TrashIcon } from "lucide-react";
interface CarwashPackageCardProps {
    carwashPackage: CarwashPackage;
    onClick: () => void;
    onDelete: () => void;
}

const CarwashPackageCard: React.FC<CarwashPackageCardProps> = ({
    carwashPackage,
    onClick,
    onDelete
}) => {
    const washTypesData: any = carwashPackage.wash_types.map(id =>
        WashTypes.find(type => type.id === id)
    ).filter(Boolean);
    const washTypesBySubclass = washTypesData.reduce((acc: any, washType: any) => {
        const subclass = washType.subclass;
        if (!acc[subclass]) {
            acc[subclass] = [];
        }
        acc[subclass].push(WashTypes.find(type => type.id === washType.id));
        return acc;
    }, {});
    return (
        <div className="w-[260px] flex-shrink-0 border rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 cursor-pointer select-none" onClick={onClick}>
            <div className="flex justify-between">
                <div className="flex gap-3">
                    <div className="w-12 h-12 bg-blue-100 flex justify-center items-center rounded-lg">
                        {carwashPackage.category === CarWashTypes[0].value ? (
                            <Image src={AutomaticIcon} alt="Automatic" width={24} height={24} className="filter-blue-500" />
                        ) : (
                            <Image src={SelfServiceIcon} alt="Self Service" width={24} height={24} className="filter-blue-500" />
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-headline-5 font-semibold text-neutral-900">
                            {carwashPackage.name}
                        </div>
                        <div className="text-body-2 text-neutral-500">
                            Price: ${carwashPackage.price}
                        </div>
                    </div>
                </div>
                <div
                    className="flex gap-3 w-10 h-10 text-accent-red border border-accent-red rounded-lg justify-center items-center cursor-pointer hover:bg-accent-red hover:text-white transition-all duration-300"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <Trash2Icon size={24} />
                </div>
            </div>
            <div className="flex flex-col gap-4 pt-4">
                {Object.entries(washTypesBySubclass).map(([subclass, types]: any) => (
                    <div key={subclass} className="flex flex-col">
                        <div className="text-title-2 font-semibold text-neutral-900">
                            {subclass}
                        </div>
                        <ul className="list-disc flex flex-col pl-5">
                            {
                                types.map((type: any) => (
                                    <li key={type.id} className="list-item">
                                        <span className="text-body-3 text-neutral-500">
                                            {type.name}
                                        </span>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarwashPackageCard;
