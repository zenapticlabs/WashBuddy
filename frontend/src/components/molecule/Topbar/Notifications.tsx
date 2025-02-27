import { Bell } from "lucide-react";

interface NotificationsProps {
  count?: number;
}

const Notifications: React.FC<NotificationsProps> = ({ count = 0 }) => {
  return (
    <div className="relative">
      <Bell size={24} className="text-neutral-900" />
      {count > 0 && (
        <span className="bg-[#FF6464] border border-white text-title-2 text-white absolute -top-2 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center z-10">
          {count}
        </span>
      )}
    </div>
  );
};

export default Notifications;
