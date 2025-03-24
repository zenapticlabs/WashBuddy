import { XIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadZoneProps {
  title?: string;
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
    <div className="flex items-center justify-center w-full my-2">
      <label
        htmlFor={title}
        className="flex flex-col items-center justify-center w-full rounded-lg cursor-pointer hover:bg-neutral-50 border-dashed border-neutral-100 border-2"
      >
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-body-2 text-neutral-800">
            Drag & drop or{" "}
            <span className="text-blue-500 underline">Click here</span>
          </p>
        </div>
        <input
          id={title}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default ImageUploadZone;
