import { Separator } from "@/components/ui/separator";
import WashPackage from "@/components/molecule/WashPackage";
import Image, { StaticImageData } from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import car1_img from "@/assets/car1.png";
import car2_img from "@/assets/car2.png";
import { MockWashPackages } from "@/mocks";
import Link from "next/link";
import { CarWashResponse } from "@/types/CarServices";

const photos: StaticImageData[] = [car1_img, car2_img, car2_img, car2_img];

const CarWashAbout: React.FC<{ data: CarWashResponse }> = ({ data }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-hidden relative">
          {MockWashPackages.map((wp) => (
            <WashPackage key={wp.id} data={wp} />
          ))}
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-white" />
        </div>
      </div>
      <Separator />
      <div className="p-3 border border-neutral-100 rounded-xl">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="bg-accent-yellow w-6 h-6 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-2 text-neutral-900">+ 25 Points</span>
              <span className="w-4 h-4 border text-xs border-neutral-200 text-neutral-200 rounded-full flex items-center justify-center">
                i
              </span>
            </div>
          </div>
          <Link href={`/edit?id=${data.id}`} className="bg-blue-500 text-title-2 text-white rounded-md px-4 py-2">Update Info</Link>
        </div>
        <div className="text-body-3 text-neutral-500 pt-2">
          Wrong price? New photos? Upload a photo – earn points towards a free
          car wash! 🚗✨
        </div>
      </div>
      <Separator />
      <div className="text-title-2 text-neutral-500 py-1">Photos</div>
      <div className="flex gap-2 overflow-hidden relative">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="bg-neutral-100 flex-shrink-0 rounded-lg overflow-hidden"
          >
            <Image
              src={photo}
              alt="photo"
              className="w-24 h-24 object-cover"
            />
          </div>
        ))}
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-white" />
      </div>
    </div>
  );
};

export default CarWashAbout;
