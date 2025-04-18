import { Loader2 } from "lucide-react";

import { useState } from "react";
import ImageUploadZone from "../ui/imageUploadZone";
import { getPresignedUrl, uploadFile } from "@/services/UploadService";
import { toast } from "sonner";
import UploadedImageCard from "../ui/uploadedImageCard";

const NEXT_PUBLIC_STORAGE_ENDPOINT = process.env.NEXT_PUBLIC_STORAGE_ENDPOINT;
const NEXT_PUBLIC_STORAGE_BUCKET_NAME =
  process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME;
const MultiImageUploadZone = ({
  images,
  originalImages,
  image_type,
  title,
  required,
  handleAddImage,
  handleDeleteImage,
}: {
  images: any[];
  image_type: string;
  originalImages: any[];
  title?: string;
  required?: boolean;
  handleAddImage: (image_type: string, image_url: string) => void;
  handleDeleteImage: (image_url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  let image_urls = [""];
  image_urls = images
    .filter((image: any) => image.image_type == image_type)
    ?.map((image: any) => image.image_url);
  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    // const fileName = await uploadFileToS3(file);

    try {
      const sanitizedFileName = file.name.replace(/\s+/g, '_');
      const presignedUrl = await getPresignedUrl(sanitizedFileName);
      await uploadFile(presignedUrl.signed_url, file);
      const fileUrl = `${NEXT_PUBLIC_STORAGE_ENDPOINT}/object/public/${NEXT_PUBLIC_STORAGE_BUCKET_NAME}/${presignedUrl.path}`;

      // Add the uploaded image to your application state
      handleAddImage(image_type, fileUrl);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
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
            canDelete={!originalImages.some((img) => img.image_url === image)}
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
