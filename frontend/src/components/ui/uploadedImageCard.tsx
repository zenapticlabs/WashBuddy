import { XIcon } from "lucide-react";
import Image from "next/image";

interface UploadedImageCardProps {
  image_url: string;
  handleDeleteImage: (image_url: string) => void;
  canDelete: boolean;
}

const UploadedImageCard: React.FC<UploadedImageCardProps> = ({
  image_url,
  handleDeleteImage,
  canDelete,
}) => {
  return (
    <div className="p-2 bg-neutral-50 rounded-lg w-32 h-32 relative">
      {canDelete && (
        <button
          className="absolute top-0 right-0 bg-white shadow-lg rounded-full p-1.5 cursor-pointer hover:bg-neutral-100"
          onClick={() => handleDeleteImage(image_url)}
        >
          <XIcon size={14} />
        </button>
      )}
      <Image
        src={image_url}
        alt="Uploaded"
        className="w-full h-full object-cover rounded-sm"
        width={1000}
        height={1000}
      />
    </div>
  );
};

export default UploadedImageCard;
