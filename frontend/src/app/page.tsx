import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox"
export default function Home() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Checkbox disabled checked={false}/>
    </div>
  );
}
