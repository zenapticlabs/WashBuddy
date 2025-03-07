import { SidebarItems } from "@/utils/menuData";
import { GlobeIcon } from "lucide-react";
import { US } from 'country-flag-icons/react/3x2'
import Link from "next/link";
import { usePathname } from "next/navigation";


interface SidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sideBarAlwaysOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onOpenChange, sideBarAlwaysOpen }) => {
    const pathname = usePathname();
    
    return (
        <>
            <div className={`absolute ${sideBarAlwaysOpen || open ? 'left-0' : '-left-full'} top-[66px] h-[calc(100vh-66px)] w-[210px] bg-white z-20 transition-all duration-300 p-3 flex justify-between flex-col border-r border-neutral-100`}>
                <div className="flex flex-col gap-2">
                    {SidebarItems.map((item) => (
                        <Link 
                            key={item.value} 
                            href={item.href} 
                            className={`flex items-center gap-2 h-10 text-title-2 ${pathname === item.href ? 'bg-blue-100' : 'bg-white'} rounded-full px-4 hover:bg-blue-100 transition-all duration-300`}
                        >
                            <div className="text-neutral-900">
                                {item.icon && <item.icon size={20} />}
                            </div>
                            <div className="text-neutral-900">{item.label}</div>
                        </Link>
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

            <div className={`${!sideBarAlwaysOpen && open ? 'bg-black/50' : 'bg-transparent pointer-events-none'} z-10 absolute top-[66px] left-0 w-full h-[calc(100vh-66px)] transition-all duration-300`} onClick={() => onOpenChange(false)}></div>
        </>
    );
};

export default Sidebar;
