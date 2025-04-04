"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, Crosshair, Loader2, MapPin, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperatingHoursRange } from "@/components/molecule/OperatingHoursRange";
import { Input } from "@/components/ui/input";
import { useEffect, useState, Suspense } from "react";
import { Toaster, toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import useLocationData from "@/hooks/useLocationData";
import {
  createCarwash,
  getCarwashById,
  updateCarwash,
} from "@/services/CarwashService";
import AddressAutoComplete from "@/components/molecule/AddressAutoComplete";
import { RadarAddress } from "radar-sdk-js/dist/types";
import Topbar from "@/components/pages/main/Topbar";
import { useAmenities } from "@/hooks/useAmenities";
import { useWashTypes } from "@/hooks/useWashTypes";
import { DEFAULT_PAYLOAD, FORM_CONFIG } from "@/utils/constants";
import { Switch } from "@/components/ui/switch";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ImageUploadZone from "@/components/ui/imageUploadZone";
import { getPresignedUrl, uploadFile } from "@/services/UploadService";
import MultiImageUploadZone from "@/components/molecule/MultiImageUploadZone";
import UploadedImageCard from "@/components/ui/uploadedImageCard";
import { IconToggle } from "@/components/ui/iconToggle";
import { CarwashPackage } from "@/components/organism/carwashPackage";

const NEXT_PUBLIC_STORAGE_ENDPOINT = process.env.NEXT_PUBLIC_STORAGE_ENDPOINT;
const NEXT_PUBLIC_STORAGE_BUCKET_NAME =
  process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME;
const CarWashContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carwashId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const { locationData, error, loading, fetchLocationData } = useLocationData();
  const [isEdit, setIsEdit] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<any>(null);
  const [formData, setFormData] = useState<any>(DEFAULT_PAYLOAD);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadingSitePhoto, setUploadingSitePhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<"use_gps" | "enter_address">(
    "use_gps"
  );
  const {
    amenities,
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useAmenities();
  const {
    washTypes,
    isLoading: washTypesLoading,
    error: washTypesError,
  } = useWashTypes();

  useEffect(() => {
    if (locationData) {
      setAddress(locationData);
    }
  }, [locationData]);

  useEffect(() => {
    if (carwashId) {
      setFetchLoading(true);
      getCarwashById(carwashId)
        .then((data) => {
          const modifiedData = {
            ...data,
            packages: data.packages.map(
              (pkg: { id: number; wash_types: any[] }) => ({
                ...pkg,
                wash_types: pkg.wash_types.map(
                  (wash_type: any) => wash_type.id
                ),
              })
            ),
          };
          setFormData(modifiedData);
          setIsEdit(true);
          setFetchLoading(false);
        })
        .catch((error) => {
          toast.error("Error fetching car wash by id");
          router.push("/carwash");
          setFetchLoading(false);
        });
    } else {
      setFetchLoading(false);
    }
  }, [carwashId]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let payload = { ...DEFAULT_PAYLOAD, ...formData };
      if (!isEdit) {
        setErrorMessage({
          ...errorMessage,
          location: address ? null : "Please enter a valid address",
        });
        if (!address) return;
        payload = { ...payload, ...address };
      }
      let response;
      if (isEdit) {
        response = await updateCarwash(carwashId || "", payload);
      } else {
        console.log(payload);
        response = await createCarwash(payload);
      }
      toast.success(
        isEdit
          ? "Car wash updated successfully!"
          : "Car wash created successfully!"
      );
      router.push(`/`);
    } catch (error) {
      toast.error(
        isEdit
          ? "Failed to update car wash. Please try again."
          : "Failed to create car wash. Please try again.",
        {
          style: {
            backgroundColor: "#dc2626", // red-600
            color: "white",
            border: "none",
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = async () => {
    fetchLocationData();
  };

  const handleSelectAddress = (address: RadarAddress | null) => {
    if (address) {
      setAddress(address);
    }
  };

  const handleUploadSitePhoto = async (file: File | null) => {
    if (!file) return;
    setUploadingSitePhoto(true);
    try {
      const presignedUrl = await getPresignedUrl(file.name);
      const uploadResponse = await uploadFile(presignedUrl.signed_url, file);
      const fileName = `${NEXT_PUBLIC_STORAGE_ENDPOINT}/object/public/${NEXT_PUBLIC_STORAGE_BUCKET_NAME}/${presignedUrl.path}`;
      toast.success("File uploaded successfully!");
      setFormData((prevData: any) => ({
        ...prevData,
        image_url: fileName,
      }));
      setUploadingSitePhoto(false);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploadingSitePhoto(false);
    }
  };

  const handleDeleteSitePhoto = () => {
    setFormData((prevData: any) => ({
      ...prevData,
      image_url: null,
    }));
  };

  const handleUploadImage = (image_type: string, image_url: string) => {
    setFormData((prevData: any) => ({
      ...prevData,
      images: [...prevData.images, { image_type, image_url }],
    }));
  };
  const handleDeleteImage = (image_url: string) => {
    setFormData((prevData: any) => ({
      ...prevData,
      images: prevData.images.filter(
        (image: any) => image.image_url != image_url
      ),
    }));
  };
  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col h-screen">
        <Topbar sideBarAlwaysOpen={true} />
        <div className="flex flex-col md:ml-[210px] flex-1 overflow-hidden">
          {fetchLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="w-full md:w-[750px] mx-auto text-headline-2 text-neutral-900 py-4 px-6">
                {isEdit ? "Edit Carwash" : "Create Carwash"}
              </div>
              <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-auto">
                <div className="w-full md:w-[750px] mx-auto">
                  <div className="">
                    <div className="text-body-2 text-neutral-900 px-6 py-2">
                      Upload the following and we will reimburse you for a basic
                      wash at this site. Your contributions help keep your
                      community car wash running!
                    </div>
                    <div className="px-6 py-2 text-body-2 text-neutral-900">
                      Would you like Paypal or Venmo to your email address or
                      phone number?
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 px-6 py-4 ">
                    {FORM_CONFIG.map((field) => (
                      <div className="" key={field.name}>
                        <div className="text-title-1 text-[#262626] pb-2">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </div>
                        <Input
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChangeInput}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="px-3 py-2.5"
                        />
                        {errorMessage && errorMessage[field.name] && (
                          <p className="text-body-2 mt-1 text-red-500">
                            {errorMessage[field.name]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 ">
                    <div className="text-title-1 text-[#262626]">Location</div>
                    <Tabs defaultValue="use_gps" className="w-full">
                      <TabsList className="bg-transparent w-full">
                        <TabsTrigger
                          value="use_gps"
                          className="w-full text-title-2"
                          onClick={() => setActiveTab("use_gps")}
                        >
                          <Crosshair size={20} className="mr-2" /> Use GPS
                        </TabsTrigger>
                        <TabsTrigger
                          value="enter_address"
                          className="w-full text-title-2"
                          onClick={() => setActiveTab("enter_address")}
                        >
                          <MapPin size={20} className="mr-2" /> Enter Address
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="use_gps">
                        <div className="text-body-2 text-neutral-900 mb-3">
                          Automatically detect your location using GPS.
                        </div>
                        <div className="flex justify-between items-center">
                          <Button
                            variant="outline"
                            className="text-blue-500 border-blue-500 rounded-full  hover:bg-blue-500 hover:text-white"
                            onClick={handleDetectLocation}
                          >
                            <Crosshair size={20} className="mr-2" />
                            Detect Location
                          </Button>
                          {loading && (
                            <p className="pt-2 text-neutral-600">Loading...</p>
                          )}
                          {error && <p>Error: {error}</p>}

                          <div className="text-body-2 text-neutral-900">
                            {locationData?.formatted_address ||
                              formData.formatted_address}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="enter_address" className="pt-2">
                        <AddressAutoComplete onSelect={handleSelectAddress} />
                      </TabsContent>
                    </Tabs>
                    {errorMessage && errorMessage.location && (
                      <p className="text-body-2 mt-1 text-red-500">
                        {errorMessage.location}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col px-6 gap-2  py-4">
                    <div className="text-title-1 text-[#262626] py-5">
                      Select Carwash Type
                    </div>
                    <div className="flex gap-2">
                      <IconToggle
                        label="Automatic car wash"
                        icon={<CheckIcon size={10} />}
                        checked={formData.automatic_car_wash}
                        onChange={(checked) =>
                          setFormData({
                            ...formData,
                            automatic_car_wash: !!checked,
                          })
                        }
                      />
                      <IconToggle
                        label="Self-service car wash"
                        icon={<CheckIcon size={10} />}
                        checked={formData.self_service_car_wash}
                        onChange={(checked) =>
                          setFormData({
                            ...formData,
                            self_service_car_wash: !!checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col px-6 gap-2  py-4">
                    <div className="text-title-1 text-[#262626] py-5">
                      Select Amenities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => (
                        <IconToggle
                          key={amenity.id}
                          label={amenity.name}
                          icon={<CheckIcon size={10} />}
                          checked={formData.amenities.includes(amenity.id)}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              amenities: checked
                                ? [...formData.amenities, amenity.id]
                                : formData.amenities.filter(
                                    (id: any) => id !== amenity.id
                                  ),
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col px-6 gap-2  py-4">
                    <div className="text-title-1 text-[#262626] py-5">
                      Carwash Packages
                    </div>
                    <CarwashPackage
                      carwashPackages={formData.packages}
                      setCarwashPackages={(carwashPackages) =>
                        setFormData({
                          ...formData,
                          packages: carwashPackages,
                        })
                      }
                    />
                  </div>
                  <div className="px-6 flex flex-col py-4">
                    <div className="text-title-1 text-[#262626] pb-6">
                      Operating Hours
                    </div>
                    <div className="h-7 flex items-center">
                      <Switch
                        label="Open 24 hours"
                        checked={formData.open_24_hours}
                        onCheckedChange={(value) =>
                          setFormData({ ...formData, open_24_hours: value })
                        }
                      />
                    </div>
                    <OperatingHoursRange
                      open_24_hours={formData.open_24_hours}
                      operatingHours={formData.operating_hours}
                      setOperatingHours={(operating_hours) =>
                        setFormData({ ...formData, operating_hours })
                      }
                    />
                  </div>
                  <div className="px-6 flex flex-col gap-1">
                    <div className="text-title-1 text-[#262626]">Photos</div>
                    <div className="text-title-2 text-neutral-900 py-3">
                      Site Photo
                    </div>

                    {uploadingSitePhoto ? (
                      <div className="p-2 bg-neutral-50 rounded-lg w-32 h-32 relative flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      formData.image_url && (
                        <UploadedImageCard
                          image_url={formData.image_url}
                          handleDeleteImage={handleDeleteSitePhoto}
                        />
                      )
                    )}
                    <ImageUploadZone
                      title="Exterior photo of wash"
                      required={true}
                      onFileChange={(file) => handleUploadSitePhoto(file)}
                    />
                    <MultiImageUploadZone
                      image_type="Menu"
                      title="Menu photo"
                      images={formData.images}
                      handleAddImage={handleUploadImage}
                      handleDeleteImage={handleDeleteImage}
                    />
                    <MultiImageUploadZone
                      image_type="Station"
                      title="Station photo"
                      images={formData.images}
                      handleAddImage={handleUploadImage}
                      handleDeleteImage={handleDeleteImage}
                    />
                    <MultiImageUploadZone
                      image_type="Exterior"
                      title="Exterior photo"
                      images={formData.images}
                      handleAddImage={handleUploadImage}
                      handleDeleteImage={handleDeleteImage}
                    />
                    <MultiImageUploadZone
                      image_type="Interior"
                      title="Interior photo"
                      images={formData.images}
                      handleAddImage={handleUploadImage}
                      handleDeleteImage={handleDeleteImage}
                    />
                  </div>
                  <div className="px-6 pb-10 flex flex-col gap-2"></div>
                  <div className="px-6 pb-10 flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        router.push(`/`);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const Page: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <CarWashContent />
    </Suspense>
  );
};

export default Page;
