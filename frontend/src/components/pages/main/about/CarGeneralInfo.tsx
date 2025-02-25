import { ArrowRight, Dot, MapPin, Phone, Star } from "lucide-react";

const CarGeneralInfo: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-headline-4 text-neutral-900">
          Clean & Shine Car Wash
        </div>
        <div className="flex items-center justify-center text-white gap-2 w-8 h-8 bg-blue-500 rounded-lg">
          <ArrowRight size={18} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-body-2 text-accent-green">Open</span>
        <span className="w-1 h-1 bg-[#D9D9D9] rounded-full"></span>
        <span className="text-body-2 text-neutral-500">Closes 17:00</span>
        <Star className="w-4 h-4 text-accent-yellow fill-accent-yellow" />
        <span className="text-title-2 text-accent-yellow">
          4.8
          <span className="pl-1 text-body-3 text-neutral-300">(123)</span>
        </span>
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-neutral-500" />
          <div className="flex items-center gap-0.5 text-body-2 text-neutral-500">
            123 Main St, Downtown, NY
            <Dot className="w-4 h-4 text-neutral-500" />
            1.2 miles
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-neutral-500" />
          <span className="text-body-2 text-neutral-500">+123 123 1234</span>
        </div>
      </div>
    </>
  );
};

export default CarGeneralInfo;
