import { Separator } from "@/components/ui/separator";
import WashPackage from "@/components/molecule/WashPackage";
import Image from "next/image";
import { Star } from "lucide-react";
import { CarWashResponse } from "@/types/CarServices";
import { ImageModal } from "@/components/molecule/ImageModal";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";


const emptyImageURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIRshHRsdIR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export default function CarWashAbout({ data }: { data: CarWashResponse }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast()
  const router = useRouter();
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const sortedPackages = useMemo(() => {
    return [...data.packages].sort((a, b) => {
      // Get effective prices considering offers
      const getEffectivePrice = (pkg: any) => {
        if (!pkg.offer || pkg.offer.status !== 'ACTIVE') return parseFloat(pkg.price);

        // Skip geographical offers
        if (pkg.offer.offer_type === 'GEOGRAPHICAL') return parseFloat(pkg.price);

        // For time-dependent offers, check if current time is within range
        if (pkg.offer.offer_type === 'TIME_DEPENDENT') {
          const now = new Date();
          const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0') + ':' +
            now.getSeconds().toString().padStart(2, '0');

          if (currentTime >= pkg.offer.start_time && currentTime <= pkg.offer.end_time) {
            return parseFloat(pkg.offer.offer_price);
          }
        }
        if (pkg.offer.offer_type === 'ONE_TIME') {
          return parseFloat(pkg.offer.offer_price);
        }

        return parseFloat(pkg.price);
      };

      const priceA = getEffectivePrice(a);
      const priceB = getEffectivePrice(b);

      // First sort by price
      if (priceA !== priceB) {
        return priceA - priceB;
      }

      // Then sort alphabetically by name
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [data.packages]);

  const handleNavigateEditPage = () => {
    if (!user) {
      toast({
        title: "Please login to update your local carwash",
        description: "Login to update your local carwash and earn 25 points",
        variant: "destructive",
        action: <Button variant="destructive" className="border border-white" onClick={() => router.push("/login")}>Login</Button>
      })
      return;
    }
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
    const params = Object.fromEntries(urlParams.entries());
    if (params) {
      sessionStorage.setItem('dashboardFilters', JSON.stringify(params));
    }
    router.push(`/carwash?id=${data.id}`);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 relative">
          <div className="flex gap-2 overflow-x-auto pb-4 w-full max-w-[100vw] px-4 -mx-4">
            {sortedPackages.length > 0 && sortedPackages.map((wp) => (
              <WashPackage key={wp.id} data={wp} carWash={data} />
            ))}
            {sortedPackages.length === 0 && (
              <div className="text-body-3 text-neutral-500">
                There is no package yet
              </div>
            )}
          </div>
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-white" />
        </div>
        <Separator />
        <div className="p-3 border border-neutral-100 rounded-xl">
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-accent-yellow w-6 h-6 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-body-2 text-neutral-900">+ 25 Points</span>
                <span className="w-4 h-4 border text-xs border-neutral-200 text-neutral-200 rounded-full flex items-center justify-center">
                  i
                </span>
              </div>
            </div>
            <Button
              onClick={handleNavigateEditPage}
              className="bg-blue-500 text-title-2 text-white rounded-md px-4 py-2"
            >
              Update Info
            </Button>
          </div>
          <div className="text-body-3 text-neutral-500 pt-2">
            Wrong price? New photos? Upload a photo – earn points towards a free
            car wash! 🚗✨
          </div>
        </div>
        <Separator />
        <div className="text-title-2 text-neutral-500 py-1">Photos</div>
        <div className="grid grid-cols-4 gap-2">
          {data.images?.map((image, index) => (
            <div
              key={index}
              className="relative cursor-pointer group border border-neutral-100 rounded-xl overflow-hidden"
              onClick={() => handleImageClick(image.image_url)}
            >
              <Image
                src={image.image_url}
                alt="photo"
                className="w-24 h-24 object-cover transition-transform group-hover:scale-105"
                width={100}
                height={100}
                priority={true}
                loading="eager"
                quality={75}
                blurDataURL={emptyImageURL}
                placeholder="blur"
              />
              <div className="absolute -inset-2 bg-black opacity-0 group-hover:opacity-5 rounded transition-opacity" />
            </div>
          ))}
        </div>
        {data.images.length === 0 && (
          <div className="text-body-3 text-neutral-500">
            There is no photo yet
          </div>
        )}
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || emptyImageURL}
        alt="Car wash photo"
      />
    </>
  );
}
