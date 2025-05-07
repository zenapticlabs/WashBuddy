"use client";

import Topbar from "@/components/pages/main/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, SearchIcon, InboxIcon, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { CustomPagination } from "@/components/molecule/CustomPagination";
import { getPaymentHistory } from "@/services/PaymentService";
import { PaymentHistory } from "@/types/payments";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/molecule/DateRangePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

const NoDataState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <InboxIcon className="w-12 h-12 text-neutral-300 mb-4" />
    <p className="text-neutral-500 text-body-1">No purchase history found</p>
  </div>
);

export default function PurchaseHistory() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const handlePageChange = (page: number) => setCurrentPage(page);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setIsLoading(true);
        const response = await getPaymentHistory();
        setPayments(response.data);
        setFilteredPayments(response.data);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentHistory();
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      let filtered = [...payments];

      // Apply search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter((payment) =>
          payment.carwash_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply date filter
      if (date?.from && date?.to) {
        filtered = filtered.filter((payment) => {
          const paymentDate = new Date(payment.created_at);
          return paymentDate >= date.from! && paymentDate <= date.to!;
        });
      }

      // Apply status filter
      if (selectedStatus) {
        filtered = filtered.filter((payment) =>
          payment.status?.toLowerCase() === selectedStatus.toLowerCase()
        );
      }

      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [date, payments, selectedStatus, searchQuery]);

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  const getPurchasePerPage = () => {
    return filteredPayments.slice((currentPage - 1) * 10, currentPage * 10);
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Topbar sideBarAlwaysOpen={true} />
        <div className="flex flex-col lg:ml-[210px] px-6 flex-1 overflow-hidden">
          <div className="w-full lg:w-[1024px] py-4 mx-auto h-full flex flex-col">
            <div className="text-headline-2 text-neutral-900 py-4">
              Your Purchase History
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
              <div className="flex md:items-center gap-2 md:flex-row flex-col">
                <DateRangePicker
                  date={date}
                  onDateChange={setDate}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="px-4 py-2 h-auto border-none w-fit"
                    >
                      {selectedStatus ? <StatusBadge status={selectedStatus} /> : <StatusBadge status="All Status" />}

                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem onClick={() => setSelectedStatus(null)}>
                      <StatusBadge status="All Status" />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>
                      <StatusBadge status="completed" />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("pending")}>
                      <StatusBadge status="pending" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative w-[300px] h-10">
                <SearchIcon className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder="Search purchase"
                  className="pl-9 h-full border-gray-300 py-2 text-sm h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="my-3 rounded-lg border border-neutral-100 overflow-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow className="text-title-2">
                      <TableHead>
                        <Checkbox />
                      </TableHead>
                      <TableHead>Car Wash Name</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Wash Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <LoadingSkeleton />
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-[300px]">
                          <NoDataState />
                        </TableCell>
                      </TableRow>
                    ) : (
                      getPurchasePerPage().map((payment) => (
                        <TableRow key={payment.id} className="text-body-2">
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {payment.carwash_name}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {!isLoading && (
                <CustomPagination
                  currentPage={currentPage}
                  totalItems={filteredPayments.length}
                  pageSize={10}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
