import { ShoppingBagIcon } from "lucide-react";
import { GiftIcon } from "lucide-react";
import { MailIcon } from "lucide-react";

export const SidebarItems = [
    {
        label: "Purchase History",
        value: "purchase-history",
        href: "/purchase-history",
        icon: ShoppingBagIcon,
    },
    {
        label: "Rewards",
        value: "rewards",
        href: "/rewards",
        icon: GiftIcon,
    },
    {
        label: "Email Support",
        value: "email-support",
        href: "mailto:support@washbuddy.com",
        icon: MailIcon,
        isExternal: true,
    },
];
