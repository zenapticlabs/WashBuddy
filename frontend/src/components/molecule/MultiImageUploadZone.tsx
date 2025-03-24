import { Loader2 } from "lucide-react";

import { useState } from "react";
import ImageUploadZone from "../ui/imageUploadZone";
import { uploadFileToS3 } from "@/services/UploadService";
import { toast } from "sonner";
import { XIcon } from "lucide-react";
import Image from "next/image";
import UploadedImageCard from "../ui/uploadedImageCard";

const MultiImageUploadZone = ({
  images,
  image_type,
  title,
  required,
  handleAddImage,
  handleDeleteImage,
}: {
  images: any[];
  image_type: string;
  title: string;
  required?: boolean;
  handleAddImage: (image_type: string, image_url: string) => void;
  handleDeleteImage: (image_url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  let image_urls = [""];
  image_urls = images
    .filter((image: any) => image.image_type == image_type)
    ?.map((image: any) => image.image_url);
  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setUploadingFile(file);
    const fileName = await uploadFileToS3(file);
    toast.success("File uploaded successfully!");
    handleAddImage(image_type, fileName);
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {title && (
        <div className="text-body-2">
          {title} {required && <span className="text-red-500">*</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {image_urls?.map((image) => (
          <UploadedImageCard
            key={image}
            image_url={image}
            handleDeleteImage={handleDeleteImage}
          />
        ))}
        {uploading && (
          <div className="p-2 bg-neutral-50 rounded-lg w-32 h-32 relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        )}
      </div>
      <ImageUploadZone
        title={title}
        required={true}
        onFileChange={(file) => handleFileChange(file)}
      />
    </div>
  );
};

export default MultiImageUploadZone;
