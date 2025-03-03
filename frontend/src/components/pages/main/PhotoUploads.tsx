import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface PhotoUploadsProps {}

interface ImageUploadZoneProps {
  title: string;
  required?: boolean;
  onFileChange?: (file: File | null) => void;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  title,
  required,
  onFileChange,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileChange?.(event.target.files[0]);
    }
  };

  return (
    <>
      <div className="text-body-2">
        {title} {required && <span className="text-red-500">*</span>}
      </div>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100"
        >
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-body-2 text-neutral-800">
              Drag & drop or{" "}
              <span className="text-blue-500 underline">Click here</span>
            </p>
            <p className="text-body-2 text-neutral-800">to upload your image</p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </>
  );
};

const PhotoUploads: React.FC<PhotoUploadsProps> = () => {
  return (
    <div className="px-6 py-6 flex flex-col gap-2 border-b">
      <div className="text-title-1">Photos</div>
      <div className="text-title-2">Site Photo</div>
      <ImageUploadZone title="Exterior photo of wash" required={true} />
      <Separator className="my-4" />
      <div className="text-title-2">Automatic wash</div>
      <ImageUploadZone title="Wash menu" required={true} />
      <ImageUploadZone title="Pay station or kiosk" required={true} />
      <ImageUploadZone title="Interior of wash bay" />
      <ImageUploadZone title="Amenitiy - such as air gun, vacuum, mat/pet station" />
      <Separator className="my-4" />
      <div className="text-title-2">Self-service bay</div>
      <ImageUploadZone title="Pay statino or kiosk" required={true} />
      <ImageUploadZone title="Wash bay photo" />
      <ImageUploadZone title="Amenitiy - such as changer, vending machines, vacuums" />
    </div>
  );
};

export default PhotoUploads;
