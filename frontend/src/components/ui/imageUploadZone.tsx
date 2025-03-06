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
    <>
      {title && (
        <div className="text-body-2">
          {title} {required && <span className="text-red-500">*</span>}
        </div>
      )}
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

export default ImageUploadZone;
