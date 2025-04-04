import { CarWashPackage } from "@/types/CarServices";
import { CheckIcon, EyeIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CarWashTypes, WashTypes } from "@/utils/constants";
import { IconToggle } from "../ui/iconToggle";
import useMediaQuery from "@/hooks/useMediaQuery";

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
  const [selectedWashTypes, setSelectedWashTypes] = useState<number[]>([]);
  const [selectedCarWashType, setSelectedCarWashType] = useState<string>(
    CarWashTypes[0].value
  );
  const [packageName, setPackageName] = useState("");
  const [price, setPrice] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

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
        type: selectedCarWashType,
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

  const washTypesBySubclass = WashTypes.reduce((acc, washType) => {
    const subclass = washType.subclass;
    if (!acc[subclass]) {
      acc[subclass] = [];
    }
    acc[subclass].push(washType);
    return acc;
  }, {} as Record<string, typeof WashTypes>);

  const handleAddPackage = () => {
    handleCancel();
    setIsSheetOpen(true);
  };

  const getAutomaticPackages = () => {
    // return carwashPackages.filter((pkg) => pkg.type === CarWashTypes[0].value);
    return carwashPackages;
  };

  const getSelfServicePackages = () => {
    // return carwashPackages.filter((pkg) => pkg.type === CarWashTypes[1].value);
    return carwashPackages;
  };
  const handleDeletePackage = (id: number) => {
    setCarwashPackages(carwashPackages.filter((pkg) => pkg.id !== id));
  };
  return (
    <div className="">
      <Button className="mb-4" onClick={handleAddPackage}>
        <PlusIcon size={24} />
        Add Package
      </Button>

      <div className="text-title-1 font-semibold text-neutral-900 pb-2">
        Automatic
      </div>
      {getAutomaticPackages().length > 0 ? (
        <div className="mb-4 flex gap-2 border border-neutral-100 rounded-lg overflow-hidden">
          <Table className="">
            <TableHeader className="">
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                {Object.entries(washTypesBySubclass).map(([key, value]) => (
                  <TableHead key={key} className="">
                    {key}
                  </TableHead>
                ))}
                <TableHead className="">Price</TableHead>
                <TableHead className="">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getAutomaticPackages().map((pkg) => (
                <TableRow
                  key={pkg.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setIsSheetOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  {Object.entries(washTypesBySubclass).map(([key, value]) => (
                    <TableCell key={key} className="">
                      <div className="flex gap-2">
                        {value
                          .filter((washType) =>
                            pkg.wash_types.includes(Number(washType.id))
                          )
                          .map((washType) => (
                            <div key={washType.id}>
                              <Image
                                src={washType.icon}
                                alt={washType.name}
                                width={24}
                                height={24}
                              />
                            </div>
                          ))}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="">{pkg.price}</TableCell>
                  <TableCell className="">
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <TrashIcon size={24} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to delete this package?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 text-white hover:bg-red-600"
                              onClick={() => handleDeletePackage(pkg.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-body-2 text-neutral-500">
          No automatic packages found
        </div>
      )}

      {/* <div className="text-title-1 font-semibold text-neutral-900 py-2">
        Self-Service
      </div>
      {getSelfServicePackages().length > 0 ? (
        <div className="mb-4 flex gap-2 border border-neutral-200 rounded-lg overflow-hidden">
          <Table className="">
            <TableHeader className="">
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead className="">Price (per minutes)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSelfServicePackages().map((pkg) => (
                <TableRow
                  key={pkg.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setIsSheetOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell className="">
                    {pkg.price / (pkg.minutes || 1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-body-2 text-neutral-500">
          No self-service packages found
        </div>
      )} */}

      {/* Create/Edit Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild></SheetTrigger>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={`p-0 overflow-auto ${
            isMobile ? "h-[80vh]" : "min-w-[600px]"
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
              <div className="text-body-2 text-neutral-900">Name</div>
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

            <div className="flex gap-4 px-2 mb-4">
              {CarWashTypes.map((type) => (
                <IconToggle
                  key={type.value}
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
                      <div className="flex gap-2 flex-wrap">
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
                              src={washType.icon}
                              alt={washType.name}
                              width={36}
                              height={36}
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
                onClick={handleCancel}
                className="w-full mb-2"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              className="w-full mb-2"
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
