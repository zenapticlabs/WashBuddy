import { CarWashPackage } from "@/types/CarServices";
import { PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect, useRef } from "react";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Car_Wash_Type_Value, CarWashTypes, WashTypes } from "@/utils/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import CarwashPackageCard from "../molecule/CarwashPackageCard";
import { CustomIconToggle } from "../ui/customIconToggle";
import { IWashType } from "@/types";
import { getWashTypes } from "@/services/WashType";

interface CarwashPackageProps {
  carwashPackages: CarWashPackage[];
  setCarwashPackages: (carwashPackages: CarWashPackage[]) => void;
}

export function CarwashPackage({
  carwashPackages,
  setCarwashPackages,
}: CarwashPackageProps) {
  const [selectedPackage, setSelectedPackage] = useState<CarWashPackage | null>(
    null
  );
  const [washTypes, setWashTypes] = useState<IWashType[]>([]);
  const [selectedWashTypes, setSelectedWashTypes] = useState<number[]>([]);
  const [selectedCarWashType, setSelectedCarWashType] = useState<string>(
    CarWashTypes[0].value
  );
  const [packageName, setPackageName] = useState("");
  const [price, setPrice] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWashTypes = async () => {
      const washTypes = await getWashTypes();
      setWashTypes(washTypes);
    };
    fetchWashTypes();
  }, []);
  // Add useEffect for touch event handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - (container.offsetLeft || 0);
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    // Add event listener with { passive: false } option
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMouseDown, startX, scrollLeft]);

  // Reset form when selected package changes
  useEffect(() => {
    if (selectedPackage) {
      setPackageName(selectedPackage.name);
      setPrice(selectedPackage.price.toString());
      setMinutes(selectedPackage.minutes?.toString() || "");
      setSelectedWashTypes(selectedPackage.wash_types || []);
    } else {
      setPackageName("");
      setPrice("");
      setMinutes("");
      setSelectedWashTypes([]);
    }
  }, [selectedPackage]);

  const handleSave = () => {
    if (!packageName || !price)
      return;

    if (selectedPackage) {
      // Update existing package
      const updatedPackage = {
        ...selectedPackage,
        category: selectedCarWashType,
        name: packageName,
        price: Number(price),
        minutes:
          selectedCarWashType === CarWashTypes[1].value
            ? Number(minutes)
            : undefined,
        wash_types:
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
        category: selectedCarWashType,
        id: carwashPackages.length + 1,
        name: packageName,
        price: Number(price),
        minutes:
          selectedCarWashType === CarWashTypes[1].value
            ? Number(minutes)
            : undefined,
        wash_types:
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

  const handleCancel = () => {
    setSelectedPackage(null);
    setPackageName("");
    setPrice("");
    setMinutes("");
    setSelectedWashTypes([]);
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

  const washTypesBySubclass = washTypes.filter((washType) => washType.category === CarWashTypes[0].value).reduce((acc, washType) => {
    const subclass = washType.subclass;
    if (!acc[subclass]) {
      acc[subclass] = [];
    }
    acc[subclass].push(washType);
    return acc;
  }, {} as Record<string, IWashType[]>);

  const handleAddPackage = () => {
    handleCancel();
    setIsSheetOpen(true);
  };

  const getAutomaticPackages = () => {
    // return carwashPackages.filter((pkg) => pkg.type === CarWashTypes[0].value);
    return carwashPackages;
  };

  // const getSelfServicePackages = () => {
  // return carwashPackages.filter((pkg) => pkg.type === CarWashTypes[1].value);
  // return carwashPackages;
  // };
  const handleDeletePackage = (id: number) => {
    setCarwashPackages(carwashPackages.filter((pkg) => pkg.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsMouseDown(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchEnd = () => {
    setIsMouseDown(false);
  };

  return (
    <div className="flex flex-col px-6 gap-2  py-4">
      <div className="flex md:flex-row flex-col justify-between pb-4 gap-4">
        <div className="text-title-1 text-[#262626]">
          Carwash Packages
        </div>
        <Button onClick={handleAddPackage}>
          <PlusIcon size={24} />
          Add Package
        </Button>
      </div>
      <div className="w-full max-w-full overflow-hidden">
        <div
          ref={containerRef}
          className="flex gap-4 cursor-grab active:cursor-grabbing flex-nowrap overflow-x-auto w-full max-w-[calc(100vw-48px)] pb-2 scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {getAutomaticPackages().length === 0 && (
            <div className="text-body-2 text-neutral-500">
              No carwash packages
            </div>
          )}
          {getAutomaticPackages().map((pkg) => (
            <CarwashPackageCard key={pkg.id} carwashPackage={pkg}
              washTypes={washTypes}
              onClick={() => {
                setSelectedPackage(pkg);
                setIsSheetOpen(true);
              }}
              onDelete={() => handleDeletePackage(pkg.id)}
            />
          ))}
        </div>

        {/* Create/Edit Form */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild></SheetTrigger>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className={`p-0 overflow-auto ${isMobile ? "h-[80vh]" : "min-w-[600px]"
              }`}
          >
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
                <div className="text-body-2 text-neutral-900">Package Name</div>
                <Input
                  placeholder="Name"
                  className="py-2"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>

              {selectedCarWashType === CarWashTypes[0].value && (
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
              )}

              <div className="flex flex-col px-2 gap-2 py-4">
                <div className="text-title-1 text-[#262626]">
                  Select Carwash Type
                </div>
                <div className="flex gap-2 w-full bg-[#F4F4F4] rounded-full">
                  {CarWashTypes.map((carWashType) => (
                    <div
                      key={carWashType.id}
                      className={`flex-1 flex items-center justify-center rounded-full py-2 px-3 text-title-2 cursor-pointer gap-2
                            ${(selectedCarWashType == carWashType.value) ?
                          "bg-blue-500 text-white" : "text-neutral-900"}`}
                      onClick={() => setSelectedCarWashType(carWashType.value)}
                    >
                      <Image src={carWashType.value == Car_Wash_Type_Value.AUTOMATIC ? AutomaticIcon : SelfServiceIcon} alt={carWashType.name} width={16} height={16} className={`${(selectedCarWashType == carWashType.value) ? "filter-white" : "filter-neutral-400"}`} />
                      {carWashType.name}
                    </div>
                  ))}
                </div>
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
                        <div className="flex gap-2 flex-wrap">
                          {types.map((washType) => (
                            <CustomIconToggle
                              key={washType.id}
                              label={washType.name}
                              icon={WashTypes.find((w) => w.name === washType.name)?.icon}
                              checked={selectedWashTypes.includes(Number(washType.id))}
                              onChange={() => toggleWashType(Number(washType.id))}
                            />
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
                  onClick={handleCancel}
                  className="w-full mb-2"
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                className="w-full mb-2"
                onClick={handleSave}
                disabled={!packageName || !price}
              >
                Save
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
