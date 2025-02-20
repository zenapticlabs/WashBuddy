import { MapPin } from "lucide-react";

interface MyLocationProps {
  count?: number;
}

const MyLocation: React.FC<MyLocationProps> = ({ count = 0 }) => {
  return (
    <span className="text-title-2 text-neutral-700 flex items-center gap-2">
      <MapPin size={24} />
      Downtown, NY
    </span>
  );
};

export default MyLocation;
