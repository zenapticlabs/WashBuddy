import { SidebarItems } from "@/utils/menuData";
import { GlobeIcon } from "lucide-react";
import { US } from "country-flag-icons/react/3x2";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sideBarAlwaysOpen?: boolean;
}

interface SidebarItem {
  label: string;
  value: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  isExternal?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onOpenChange,
  sideBarAlwaysOpen,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typically md breakpoint
    };

    checkWidth(); // Check on initial render
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const effectiveSidebarOpen = isMobile ? open : sideBarAlwaysOpen || open;

  const overlayClassName = `
    absolute top-[66px] left-0 
    w-full h-[calc(100vh-66px)] 
    z-40 transition-all duration-300
    ${isMobile
      ? open ? "bg-black/50" : "bg-transparent pointer-events-none"
      : !sideBarAlwaysOpen && open ? "bg-black/50" : "bg-transparent pointer-events-none"
    }
  `.trim();

  const handleSidebarClick = (item: SidebarItem) => {
    if (item.isExternal) {
      window.location.href = item.href;
      onOpenChange(false);
      return;
    }

    if (!user) {
      toast({
        title: "Please login to continue",
        description: "Please login to continue",
        variant: "destructive",
        action: <Button variant="destructive" className="border border-white" onClick={() => router.push("/login")}>Login</Button>,
      });
      return;
    }
    router.push(item.href);
    onOpenChange(false);
  };

  return (
    <>
      <div
        className={`absolute ${effectiveSidebarOpen ? "left-0" : "-left-full"
          } top-[66px] h-[calc(100vh-66px)] w-[210px] bg-white z-50 transition-all duration-300 p-3 flex justify-between flex-col border-r border-neutral-100`}
      >
        <div className="flex flex-col gap-2">
          {SidebarItems.map((item) => (
            <Button
              key={item.value}
              onClick={() => handleSidebarClick(item)}
              variant="ghost"
              className={`flex items-center justify-start gap-2 h-10 text-title-2 ${pathname === item.href ? "bg-blue-100" : "bg-white"
                } rounded-full px-4 hover:bg-blue-100 transition-all duration-300`}
            >
              <div className="text-neutral-900">
                {item.icon && <item.icon size={20} />}
              </div>
              <div className="text-neutral-900">{item.label}</div>
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 h-10 text-title-2 px-4">
            <div className="text-neutral-900">
              <GlobeIcon size={20} />
            </div>
            <div className="text-neutral-900">English</div>
          </div>
          <div className="flex items-center gap-2 h-10 text-title-2 px-4">
            <div className="text-neutral-900">
              <US className="w-5 h-5" />
            </div>
            <div className="text-neutral-900">USD</div>
          </div>
        </div>
      </div>
      <div
        className={overlayClassName}
        onClick={() => onOpenChange(false)}
      />
    </>
  );
};

export default Sidebar;
