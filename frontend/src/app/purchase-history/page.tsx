"use client";

import Topbar from "@/components/pages/main/Topbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, CopyIcon, SearchIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { carWashTableData } from "@/mocks/carWashTableData";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { CustomPagination } from "@/components/molecule/CustomPagination";
const filters = ["Date", "Location", "Status"];
export default function PurchaseHistory() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const totalItems = 90;
  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <>
      <div className="flex flex-col h-screen">
        <Topbar sideBarAlwaysOpen={true} />
        <div className="flex flex-col lg:ml-[210px] px-6 flex-1 overflow-hidden">
          <div className="w-full lg:w-[1024px] py-4 mx-auto h-full flex flex-col">
            <div className="text-headline-2 text-neutral-900 py-4">
              Your Purchase History
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
              <div className="flex items-center gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    variant="secondary"
                    className="rounded-full"
                  >
                    {filter}
                    <ChevronDownIcon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
              <div className="relative w-full lg:w-[250px] h-10">
                <SearchIcon className="absolute left-2 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder="Search purchase"
                  className="rounded-full pl-8 h-full"
                />
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="my-3 rounded-lg border border-neutral-100 overflow-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow className="text-title-1">
                      <TableHead>
                        <Checkbox />
                      </TableHead>
                      <TableHead>Car Wash Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Wash Code</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carWashTableData.map((cw) => (
                      <TableRow key={cw.id} className="text-body-1">
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {cw.carWashName}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {cw.location}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {cw.purchaseDate}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {cw.washCode}
                        </TableCell>
                        <TableCell>
                          <button className="text-neutral-200 hover:text-neutral-900 duration-300" >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <CustomPagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
