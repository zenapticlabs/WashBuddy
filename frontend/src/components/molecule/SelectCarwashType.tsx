import { Car_Wash_Type_Value } from "@/utils/constants";

import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { CarServiceAmenity, CarServiceWashType } from "@/types";
interface SelectCarwashTypeProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    amenitiyOptions: CarServiceAmenity[];
    washTypeOptions: CarServiceWashType[];
    amenities: string[];
    washTypes: string[];
    setAmenities: (amenities: string[]) => void;
    setWashTypes: (washTypes: string[]) => void;
}

const SelectCarwashType: React.FC<SelectCarwashTypeProps> = ({
    label,
    checked,
    onChange,
    amenitiyOptions,
    washTypeOptions,
    amenities = [],
    washTypes = [],
    setAmenities,
    setWashTypes,
}) => {
    return (
        <>
            <Checkbox
                label={label}
                checked={checked}
                className="text-black"
                onChange={(value) => onChange(!!value)}
            />
            <Accordion
                type="single"
                collapsible
                className="w-full"
                value={checked ? "item-1" : ""}
            >
                <AccordionItem value="item-1">
                    <AccordionContent>
                        <div className="flex gap-4 py-4">
                            <div className="flex-1 flex flex-col gap-4 px-6">
                                <div className="text-title-1 text-[#262626]">
                                    Select amenities
                                </div>
                                {amenitiyOptions.map((amenity) => (
                                    <Checkbox
                                        key={amenity.id}
                                        label={amenity.name}
                                        checked={
                                            amenities?.includes(amenity.id)
                                        }
                                        onChange={() => {
                                            const newAmenities = amenities?.includes(amenity.id)
                                                ? amenities.filter(id => id !== amenity.id)
                                                : [...amenities, amenity.id];
                                            setAmenities(newAmenities);
                                        }}
                                        description={amenity.description}
                                    />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-4 px-6">
                                <div className="text-title-1 text-[#262626]">
                                    Select wash types
                                </div>
                                {washTypeOptions.map((washType) => (
                                    <Checkbox
                                        key={washType.id}
                                        label={washType.name}
                                        checked={
                                            washTypes?.includes(washType.id)
                                        }
                                        onChange={() => {
                                            const newWashTypes = washTypes?.includes(washType.id)
                                                ? washTypes?.filter(id => id !== washType.id)
                                                : [...washTypes, washType.id];
                                            setWashTypes(newWashTypes);
                                        }}
                                        description={washType.description}
                                    />
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};

export default SelectCarwashType;
