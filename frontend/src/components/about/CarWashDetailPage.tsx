import Image, { StaticImageData } from "next/image";
import carlogo from "@/assets/carlogo.jpg";
import { ArrowLeft, ArrowRight, Dot, MapPin, Phone, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICarServiceWashPackage } from "@/types/CarServices";
import { Button } from "@/components/ui/button";

import CarGeneralInfo from "./CarGeneralInfo";
import CarWashAbout from "./CarWashAbout/CarWashAbout";
import CarWashReviews from "./CarWashReviews/CarWashReviews";

export interface CarWashDetailPageProps {}

const CarWashDetailPage: React.FC<CarWashDetailPageProps> = ({}) => {
  return (
    <div className="w-[400px]">
      <div className="w-full h-[240px] overflow-hidden flex items-center justify-center rounded-t-xl">
        <Image src={carlogo} alt="logo" className="w-[400px] h-[400px]" />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <CarGeneralInfo />
        <Separator className="" />
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="bg-transparent w-full">
            <TabsTrigger value="about" className="w-full text-title-2">
              About
            </TabsTrigger>
            <TabsTrigger value="reviews" className="w-full text-title-2">
              Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            <CarWashAbout />
          </TabsContent>
          <TabsContent value="reviews">
            <CarWashReviews />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CarWashDetailPage;
