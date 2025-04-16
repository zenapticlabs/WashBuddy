import { CarWashPackage, CarWashResponse } from "@/types/CarServices";
import { WashTypes } from "@/utils/constants";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface WashPackageProps {
  data: CarWashPackage;
  carWash: CarWashResponse;
}

const emptyImageURL = "/images/empty-image.png";

const washTypesBySubclass = WashTypes.reduce((acc, washType) => {
  const subclass = washType.subclass;
  if (!acc[subclass]) {
    acc[subclass] = [];
  }
  acc[subclass].push(washType);
  return acc;
}, {} as Record<string, typeof WashTypes>);

const WashPackage: React.FC<WashPackageProps> = ({ data, carWash }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const imageUrl = carWash?.image_url || carWash?.images[0]?.image_url || emptyImageURL;

  const handleProceedToCheckout = () => {
    router.push(`/checkout?carWashId=${carWash.id}&packageId=${data.id}`);
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div
            key={data.id}
            className="border border-neutral-100 p-2 rounded-lg flex-shrink-0 w-[150px] cursor-pointer hover:border-accent-blue transition-all duration-300"
          >
            <div className="text-title-2 text-neutral-900">{data.name}</div>
            <div className="flex items-center gap-1 text-headline-5 my-1">
              <span className="text-neutral-900">${data.price}</span>
            </div>
            {/* <div className="text-body-2 text-neutral-500">{data.description}</div> */}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-80">
          <div className="text-title-2 text-neutral-900 mb-4">Wash Types</div>
          <div className="flex flex-col gap-4">
            {Object.entries(washTypesBySubclass).map(([subclass, types]) => (
              <div key={subclass} className="flex flex-col gap-2">
                <div className="text-body-2 font-semibold text-neutral-900">
                  {subclass}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {types.map((washType) => (
                    <div
                      key={washType.id}
                      className="flex flex-col items-center gap-1"
                    >
                      <Image
                        src={washType.icon}
                        alt={washType.name}
                        width={24}
                        height={24}
                        className={`${data.wash_types
                          .map((type: any) => type.id)
                          .includes(Number(washType.id))
                          ? "text-blue-500 opacity-100"
                          : "text-gray-300 opacity-30"
                          }`}
                      />
                      <span className="text-xs text-neutral-600 text-center max-w-[80px] line-clamp-2">
                        {washType.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => setIsModalOpen(true)}>Buy now</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0">
          <DialogHeader className="border-b border-neutral-100 pb-4 py-4 px-6">
            <DialogTitle className="text-headline-4">Your Purchase</DialogTitle>
          </DialogHeader>
          <div className="h-[300px] px-6 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="flex gap-2 flex-1">
                <Image src={carWash.image_url} alt={carWash.car_wash_name} width={48} height={48} />
                <div className="flex flex-col gap-1">
                  <div className="text-title-1 text-neutral-900">{carWash.car_wash_name}</div>
                  <div className="text-body-2 text-neutral-500">{carWash.formatted_address}</div>
                </div>
              </div>
              <div className="flex flex-col items-end border-l border-neutral-100 pl-4">
                <div className="text-title-1 text-neutral-900">{data.name}</div>
                <div className="text-headline-5 text-neutral-900">${data.price}</div>
              </div>
              <div></div>
            </div>
            <div className="flex justify-between">
              <div className="text-title-1 text-neutral-900">Total</div>
              <div className="text-headline-3 text-neutral-900">${data.price}</div>
            </div>
          </div>
          <DialogFooter className="py-4 px-6 border-t border-neutral-100">
            <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProceedToCheckout} className="w-full">
              Proceed to checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WashPackage;
