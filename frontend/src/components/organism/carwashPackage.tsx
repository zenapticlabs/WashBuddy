import {
  CarServiceWashType,
  CarWashPackage,
  CarWashResponse,
} from "@/types/CarServices";
import {
  CarIcon,
  CheckIcon,
  DotIcon,
  MapPinIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { WashType } from "@/types";
import { CarWashTypes } from "@/utils/constants";
import { IconToggle } from "../ui/iconToggle";

const emptyImageURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIRshHRsdIR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

interface CarwashPackageProps {
  washTypes: CarServiceWashType[];
  carwashPackages: CarWashPackage[];
  setCarwashPackages: (carwashPackages: CarWashPackage[]) => void;
}

export function CarwashPackage({
  washTypes,
  carwashPackages,
  setCarwashPackages,
}: CarwashPackageProps) {
  const [selectedPackage, setSelectedPackage] = useState<CarWashPackage | null>(
    null
  );
  const [selectedWashTypes, setSelectedWashTypes] = useState<number[]>([]);
  const [selectedCarWashType, setSelectedCarWashType] = useState<string>(
    CarWashTypes[0].value
  );
  const [packageName, setPackageName] = useState("");
  const [price, setPrice] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Reset form when selected package changes
  useEffect(() => {
    if (selectedPackage) {
      setPackageName(selectedPackage.name);
      setPrice(selectedPackage.price.toString());
      setMinutes(selectedPackage.minutes?.toString() || "");
      setSelectedWashTypes(selectedPackage.washTypes || []);
    } else {
      setPackageName("");
      setPrice("");
      setMinutes("");
      setSelectedWashTypes([]);
    }
  }, [selectedPackage]);

  const handleSave = () => {
    if (
      !packageName ||
      !price ||
      (selectedCarWashType === CarWashTypes[0].value &&
        selectedWashTypes.length === 0) ||
      (selectedCarWashType === CarWashTypes[1].value && !minutes)
    )
      return;

    if (selectedPackage) {
      // Update existing package
      const updatedPackage = {
        ...selectedPackage,
        type: selectedCarWashType,
        name: packageName,
        price: Number(price),
        minutes:
          selectedCarWashType === CarWashTypes[1].value
            ? Number(minutes)
            : undefined,
        washTypes:
          selectedCarWashType === CarWashTypes[0].value
            ? selectedWashTypes
            : [],
      };
      setCarwashPackages(
        carwashPackages.map((pkg) =>
          pkg.id === selectedPackage.id ? updatedPackage : pkg
        )
      );
    } else {
      // Create new package
      const newPackage: CarWashPackage = {
        type: selectedCarWashType,
        id: carwashPackages.length + 1,
        name: packageName,
        price: Number(price),
        minutes:
          selectedCarWashType === CarWashTypes[1].value
            ? Number(minutes)
            : undefined,
        washTypes:
          selectedCarWashType === CarWashTypes[0].value
            ? selectedWashTypes
            : [],
      };
      setCarwashPackages([...carwashPackages, newPackage]);
    }

    // Reset form and close sheet
    setSelectedPackage(null);
    setPackageName("");
    setPrice("");
    setMinutes("");
    setSelectedWashTypes([]);
    setIsSheetOpen(false);
  };

  const handleDelete = () => {
    if (!selectedPackage) return;
    setCarwashPackages(
      carwashPackages.filter((pkg) => pkg.id !== selectedPackage.id)
    );
    setSelectedPackage(null);
    setIsSheetOpen(false);
  };

  const toggleWashType = (id: number) => {
    setSelectedWashTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const washTypesBySubclass = washTypes.reduce((acc, washType) => {
    const subclass = washType.subclass;
    if (!acc[subclass]) {
      acc[subclass] = [];
    }
    acc[subclass].push(washType);
    return acc;
  }, {} as Record<string, typeof washTypes>);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        {carwashPackages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => {
              setSelectedPackage(pkg);
              setIsSheetOpen(true);
            }}
            className="w-[120px] h-36 flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-blue-500 transition-all cursor-pointer"
          >
            <div className="text-title-2 font-semibold text-neutral-900 pb-4 flex-1 overflow-hidden">
              {pkg.name}
            </div>
            <div className="text-body-2 text-neutral-900 flex-1">
              {pkg.type}
            </div>
            {selectedCarWashType === CarWashTypes[1].value && (
              <div className="text-headline-5 font-semibold text-neutral-900 flex-1">
                ${pkg.price}
              </div>
            )}
            {selectedCarWashType === CarWashTypes[0].value && (
              <div className="text-headline-5 font-semibold text-neutral-900 flex-1">
                ${pkg.price} / {pkg.minutes} minutes
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            setSelectedPackage(null);
            setIsSheetOpen(true);
          }}
          className="w-[120px] h-36 flex items-center justify-center rounded-lg bg-blue-500 text-white"
        >
          <PlusIcon size={36} />
        </button>
      </div>

      {/* Create/Edit Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild></SheetTrigger>
        <SheetContent className="min-w-[600px] p-0 overflow-auto">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="flex justify-between">
              {selectedPackage ? "Edit Package" : "Create Package"}
              {selectedPackage && (
                <Button variant="outline" size="icon" onClick={handleDelete}>
                  <TrashIcon size={24} />
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="px-4">
            <div className="text-title-1 font-semibold my-3 px-2">
              General Information
            </div>
            <div className="flex flex-col gap-2 mb-3 px-2">
              <div className="text-body-2 text-neutral-900">Name</div>
              <Input
                placeholder="Name"
                className="py-2"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 mb-6 px-2">
              <div className="text-body-2 text-neutral-900">Price</div>
              <Input
                placeholder="Price"
                className="py-2"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="flex gap-4 px-2 mb-4">
              {CarWashTypes.map((type) => (
                <IconToggle
                  label={type.name}
                  icon={<CheckIcon size={10} />}
                  checked={selectedCarWashType === type.value}
                  onChange={(checked) => setSelectedCarWashType(type.value)}
                />
              ))}
            </div>
            {selectedCarWashType === CarWashTypes[0].value && (
              <div className="flex flex-col gap-4 px-2">
                <div className="text-title-1 font-semibold">Carwash Types</div>
                {Object.entries(washTypesBySubclass).map(
                  ([subclass, types]) => (
                    <div key={subclass} className="flex-1 flex flex-col gap-2">
                      <div className="text-body-2 font-semibold">
                        {subclass}
                      </div>
                      <div className="flex gap-2">
                        {types.map((washType) => (
                          <div
                            key={washType.id}
                            onClick={() => toggleWashType(Number(washType.id))}
                            className={`w-24 h-32 p-4 flex flex-col items-center rounded-lg cursor-pointer transition-all
                          ${
                            selectedWashTypes.includes(Number(washType.id))
                              ? "border-2 border-blue-500 bg-blue-50"
                              : "border-2 border-gray-200"
                          }`}
                          >
                            <Image
                              src={AutomaticIcon}
                              alt={washType.name}
                              width={24}
                              height={24}
                              className="flex-1"
                            />
                            <div className="text-xs w-full font-medium flex-1 text-center">
                              <span className="line-clamp-2">
                                {washType.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
            {selectedCarWashType === CarWashTypes[1].value && (
              <div className="flex flex-col gap-4 px-2">
                <div className="text-title-1 font-semibold">
                  Price per Minutes
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <div className="flex-1">
                    <div className="text-body-2 text-neutral-900 mb-2">
                      Price ($)
                    </div>
                    <Input
                      placeholder="Enter price"
                      className="py-2"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="text-title-2 text-neutral-500 pb-2">per</div>
                  <div className="flex-1">
                    <div className="text-body-2 text-neutral-900 mb-2">
                      Minutes
                    </div>
                    <Input
                      placeholder="Enter minutes"
                      className="py-2"
                      type="number"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <SheetFooter className="p-4">
            <SheetClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPackage(null);
                  setIsSheetOpen(false);
                }}
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={handleSave}
              disabled={
                !packageName ||
                !price ||
                (selectedCarWashType === CarWashTypes[0].value &&
                  selectedWashTypes.length === 0) ||
                (selectedCarWashType === CarWashTypes[1].value && !minutes)
              }
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
