import { Skeleton } from "../ui/skeleton";

export function CarWashSkeleton() {
    return (
        <div className="p-3 border border-neutral-50 rounded-lg">
            <div className="flex gap-2 rounded-lg w-full">
                <Skeleton className="w-16 h-16 md:w-24 md:h-24 object-cover rounded" />
                <div className="flex flex-col justify-between flex-1">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="w-2/3 h-6 rounded" />
                        <Skeleton className="w-full h-6 rounded" />
                        <Skeleton className="w-1/3 h-6 rounded" />
                    </div>
                </div>
                <div className="hidden md:flex flex-col justify-between border-l border-neutral-50 pl-4">
                    <div className="flex flex-col gap-2 items-end">
                        <Skeleton className="w-20 h-4 object-cover rounded" />
                        <Skeleton className="w-16 h-4 object-cover rounded" />
                    </div>
                    <Skeleton className="w-24 h-4 object-cover rounded" />
                </div>
            </div>
        </div>
    );
}
