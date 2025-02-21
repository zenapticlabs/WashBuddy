import { Separator } from "../../ui/separator";
import CarWashPackages from "./Components/CarWashPackages";
import CarWashUpdateInfo from "./Components/CarWashUpdateInfo";
import CarWashAboutPhotos from "./Components/CarWashAboutPhotos";

export interface CarWashAboutProps {}

const CarWashAbout: React.FC<CarWashAboutProps> = ({}) => {
  return (
    <div className="flex flex-col gap-3">
      <CarWashPackages />
      <Separator />
      <CarWashUpdateInfo />
      <Separator />
      <CarWashAboutPhotos />
    </div>
  );
};

export default CarWashAbout;
