import { MapPin, MenuIcon } from "lucide-react";

interface MenuButtonProps {
  onClick?: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => {
  return (
    <div
      className="p-2 rounded-full cursor-pointer"
      onClick={onClick}
    >
      <MenuIcon size={24} className="text-neutral-900" />
    </div>
  );
};

export default MenuButton;
