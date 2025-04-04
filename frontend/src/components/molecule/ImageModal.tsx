import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="absolute top-2 right-2 z-50">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </DialogHeader>
        <div className="relative w-full h-[90vh]">
          <Image
            src={imageUrl}
            alt={alt || "Enlarged image"}
            className="object-contain"
            fill
            quality={100}
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 