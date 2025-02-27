import Image, { StaticImageData } from "next/image";
import car1_img from "@/assets/car1.png";
import car2_img from "@/assets/car2.png";

const photos: StaticImageData[] = [car1_img, car2_img, car2_img, car2_img];
export interface CarWashAboutPhotosProps {}

const CarWashAboutPhotos: React.FC<CarWashAboutPhotosProps> = ({}) => {
  return (
    <>
      <div className="text-title-2 text-neutral-500 py-1">Photos</div>
      <div className="flex gap-2 overflow-hidden relative">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="w-24 h-24 bg-neutral-100 flex-shrink-0 rounded-lg overflow-hidden"
          >
            <Image
              src={photo}
              alt="photo"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-white" />
      </div>
    </>
  );
};

export default CarWashAboutPhotos;
