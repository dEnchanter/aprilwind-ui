/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { InvoicesTable } from "@/components/tables/InvoicesTable";
import { useInvoices, useMarkInvoiceAsPaid, useCancelInvoice } from "@/hooks/useInvoices";
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  XCircle,
  Search,
  Receipt,
  Layers
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [markAsPaidInvoice, setMarkAsPaidInvoice] = useState<any>(null);
  const [cancelInvoice, setCancelInvoice] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch invoices
  const { data: invoicesData, isLoading } = useInvoices();
  const invoices = invoicesData?.data || [];

  // Mutations
  const markAsPaidMutation = useMarkInvoiceAsPaid();
  const cancelInvoiceMutation = useCancelInvoice();

  // Filter invoices based on active filter and search query
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter((invoice: any) =>
        invoice.status?.toLowerCase() === activeFilter
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((invoice: any) =>
        invoice.invoiceNo?.toLowerCase().includes(query) ||
        invoice.customer?.name?.toLowerCase().includes(query) ||
        invoice.customer?.email?.toLowerCase().includes(query) ||
        invoice.invoiceDetails?.productName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [invoices, activeFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv: any) => inv.status?.toLowerCase() === 'paid').length;
    const pendingInvoices = invoices.filter((inv: any) => inv.status?.toLowerCase() === 'pending').length;
    const cancelledInvoices = invoices.filter((inv: any) => inv.status?.toLowerCase() === 'cancelled').length;
    const totalRevenue = invoices
      .filter((inv: any) => inv.status?.toLowerCase() === 'paid')
      .reduce((sum: number, inv: any) => sum + (inv.invoiceDetails?.salePrice || 0), 0);

    return [
      {
        title: "Total Invoices",
        value: totalInvoices,
        icon: FileText,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Paid",
        value: paidInvoices,
        icon: CheckCircle,
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        title: "Pending",
        value: pendingInvoices,
        icon: Clock,
        bgColor: "bg-amber-50",
        iconColor: "text-amber-600",
      },
      {
        title: "Total Revenue",
        value: `₦${totalRevenue.toLocaleString()}`,
        icon: DollarSign,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
      },
    ];
  }, [invoices]);

  // Handle mark as paid
  const confirmMarkAsPaid = () => {
    if (!markAsPaidInvoice?.id) return;

    markAsPaidMutation.mutate(markAsPaidInvoice.id, {
      onSuccess: () => {
        setMarkAsPaidInvoice(null);
      },
    });
  };

  // Handle cancel invoice
  const confirmCancelInvoice = () => {
    if (!cancelInvoice?.id) return;

    cancelInvoiceMutation.mutate(cancelInvoice.id, {
      onSuccess: () => {
        setCancelInvoice(null);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage customer invoices and payments
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      )}
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Filter Label */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-brand-600" />
                  Filter by Status
                </h3>
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-brand-500 focus:ring-brand-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <Tabs
                value={activeFilter}
                onValueChange={(value: any) => {
                  setActiveFilter(value);
                  setPage(1);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Layers className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">All Invoices</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {invoices.length} total
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="paid"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Paid</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {invoices.filter((inv: any) => inv.status?.toLowerCase() === 'paid').length} paid
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Clock className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Pending</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {invoices.filter((inv: any) => inv.status?.toLowerCase() === 'pending').length} pending
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="cancelled"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Cancelled</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {invoices.filter((inv: any) => inv.status?.toLowerCase() === 'cancelled').length} cancelled
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </motion.div>

        {/* Invoices Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <InvoicesTable
            data={filteredInvoices}
            isLoading={isLoading}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onMarkAsPaid={setMarkAsPaidInvoice}
            onCancel={setCancelInvoice}
          />
        </motion.div>

      {/* Mark as Paid Dialog */}
      <AlertDialog open={!!markAsPaidInvoice} onOpenChange={() => setMarkAsPaidInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Invoice as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark invoice <strong>{markAsPaidInvoice?.invoiceNo}</strong> as paid?
              This action will update the payment status to paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkAsPaid}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invoice Dialog */}
      <AlertDialog open={!!cancelInvoice} onOpenChange={() => setCancelInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel invoice <strong>{cancelInvoice?.invoiceNo}</strong>?
              This action will mark the invoice as cancelled and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Invoice</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelInvoice}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Yes, Cancel Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
