import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddWashNearbyBtnProps {
  onClick?: () => void;
}

const AddWashNearbyBtn: React.FC<AddWashNearbyBtnProps> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      className="rounded-full shadow-none text-title-2 text-blue-500 hover:text-blue-500"
      onClick={onClick}
    >
      <Plus size={24} />
      Add a WashNearby
    </Button>
  );
};

export default AddWashNearbyBtn;
