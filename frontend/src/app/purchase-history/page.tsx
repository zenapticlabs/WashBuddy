"use client";

import Topbar from "@/components/pages/main/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, CopyIcon, SearchIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { carWashTableData } from "@/mocks/carWashTableData";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { CustomPagination } from "@/components/molecule/CustomPagination";
import { getPaymentHistory } from "@/services/PaymentService";
import { PaymentHistory } from "@/types/payments";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`${getStatusColor(status)} rounded-full px-3 py-1 text-xs font-medium shadow-md`}>
      {status}
    </span>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const filters = ["Date", "Location", "Status"];
export default function PurchaseHistory() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const handlePageChange = (page: number) => setCurrentPage(page);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      const response = await getPaymentHistory();
      setPayments(response.data);
    };
    fetchPaymentHistory();
  }, []);

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
                      <TableHead>Amount</TableHead>
                      <TableHead>Wash Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice((currentPage - 1) * 10, currentPage * 10).map((payment) => (
                      <TableRow key={payment.id} className="text-body-1">
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {payment.carwash_name}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">

                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          ${Number(payment.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate flex items-center gap-2 justify-between">
                          {payment.carwash_code}
                          {payment.carwash_code && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                navigator.clipboard.writeText(payment.carwash_code);
                              }}
                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status || 'pending'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <CustomPagination
                currentPage={currentPage}
                totalItems={payments.length}
                pageSize={10}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
