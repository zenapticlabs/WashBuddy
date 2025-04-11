import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

interface CustomPaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function CustomPagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
}: CustomPaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3);
            } else if (currentPage >= totalPages - 2) {
                pages.push(totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(currentPage - 1, currentPage, currentPage + 1);
            }
        }

        return pages;
    };

    return (
        <div className="flex justify-between flex-col md:flex-row">
            <div className="text-body-2 text-neutral-800 py-2 hidden md:block">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
            </div>
            <div className="w-fit">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationLink
                                onClick={() => onPageChange(1)}
                                className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <ChevronsLeftIcon className="w-4 h-4" />
                            </PaginationLink>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink
                                onClick={() => onPageChange(currentPage - 1)}
                                className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </PaginationLink>
                        </PaginationItem>

                        {currentPage > 3 && (
                            <>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            </>
                        )}

                        {getPageNumbers().map((pageNum) => (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    onClick={() => onPageChange(pageNum)}
                                    isActive={currentPage === pageNum}
                                    className={`cursor-pointer border-none ${currentPage === pageNum ? 'bg-blue-200' : ''}`}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        {currentPage < totalPages - 2 && (
                            <>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            </>
                        )}

                        <PaginationItem>
                            <PaginationLink
                                onClick={() => onPageChange(currentPage + 1)}
                                className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </PaginationLink>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink
                                onClick={() => onPageChange(totalPages)}
                                className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <ChevronsRightIcon className="w-4 h-4" />
                            </PaginationLink>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>

    );
}