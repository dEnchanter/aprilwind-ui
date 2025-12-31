/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { InvoicesTable } from "@/components/tables/InvoicesTable";
import { useInvoices, useMarkInvoiceAsPaid, useCancelInvoice } from "@/hooks/useInvoices";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Page = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [markAsPaidInvoice, setMarkAsPaidInvoice] = useState<any>(null);
  const [cancelInvoice, setCancelInvoice] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Cancellation fields
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationNotes, setCancellationNotes] = useState('');
  const [restoreStock, setRestoreStock] = useState(true);

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'cheque' | 'other'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD
  const [paymentNotes, setPaymentNotes] = useState('');

  // Fetch invoices
  const { data: invoicesData, isLoading } = useInvoices();
  const invoices = invoicesData?.data || [];

  // Mutations
  const markAsPaidMutation = useMarkInvoiceAsPaid();
  const cancelInvoiceMutation = useCancelInvoice();

  // Get current user
  const currentUser = useCurrentUser();

  // Filter invoices based on active filter and search query
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Filter by status
    if (activeFilter !== 'all') {
      if (activeFilter === 'pending') {
        // Handle both 'pending' and 'open' status
        filtered = filtered.filter((invoice: any) =>
          invoice.status?.toLowerCase() === 'pending' || invoice.status?.toLowerCase() === 'open'
        );
      } else {
        filtered = filtered.filter((invoice: any) =>
          invoice.status?.toLowerCase() === activeFilter
        );
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((invoice: any) => {
        // Search in invoice number and customer details
        const matchesBasic = invoice.invoiceNo?.toLowerCase().includes(query) ||
          invoice.customer?.name?.toLowerCase().includes(query) ||
          invoice.customer?.email?.toLowerCase().includes(query);

        // Search in invoice items - new API structure uses 'items' instead of 'invoiceDetails'
        const itemsArray = Array.isArray(invoice.items) ? invoice.items : [];
        const matchesItems = itemsArray.some((item: any) =>
          item.productName?.toLowerCase().includes(query)
        );

        return matchesBasic || matchesItems;
      });
    }

    return filtered;
  }, [invoices, activeFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv: any) => inv.status?.toLowerCase() === 'paid').length;
    const pendingInvoices = invoices.filter((inv: any) =>
      inv.status?.toLowerCase() === 'pending' || inv.status?.toLowerCase() === 'open'
    ).length;
    const cancelledInvoices = invoices.filter((inv: any) => inv.status?.toLowerCase() === 'cancelled').length;

    // Calculate total revenue from paid invoices
    const totalRevenue = invoices
      .filter((inv: any) => inv.status?.toLowerCase() === 'paid')
      .reduce((sum: number, inv: any) => {
        // New API structure uses 'items' instead of 'invoiceDetails'
        const itemsArray = Array.isArray(inv.items) ? inv.items : [];
        const invoiceTotal = itemsArray.reduce((itemSum: number, item: any) => {
          const cost = parseFloat(item.cost || 0);
          const quantity = parseInt(item.quantity || 1);
          return itemSum + (cost * quantity);
        }, 0);
        return sum + (inv.total || invoiceTotal);
      }, 0);

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
    if (!markAsPaidInvoice?.id || !currentUser.staffId) {
      if (!currentUser.staffId) {
        toast.error('Unable to identify current user');
      }
      return;
    }

    const payload = {
      id: markAsPaidInvoice.id,
      receivedBy: currentUser.staffId,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      paymentDate: paymentDate || undefined,
      notes: paymentNotes.trim() || undefined,
    };

    console.log('Marking invoice as paid with payload:', payload);

    markAsPaidMutation.mutate(
      payload,
      {
        onSuccess: () => {
          setMarkAsPaidInvoice(null);
          setPaymentMethod('cash');
          setReferenceNumber('');
          setPaymentDate(new Date().toISOString().split('T')[0]);
          setPaymentNotes('');
        },
      }
    );
  };

  // Handle cancel invoice
  const confirmCancelInvoice = () => {
    console.log('confirmCancelInvoice called', {
      cancelInvoice,
      cancellationReason,
      currentUser,
      restoreStock
    });

    if (!cancelInvoice?.id) {
      console.error('No invoice ID');
      toast.error('No invoice selected');
      return;
    }

    if (!cancellationReason.trim()) {
      console.error('No cancellation reason');
      toast.error('Please provide a cancellation reason');
      return;
    }

    if (!currentUser.staffId) {
      console.error('No staff ID');
      toast.error('Unable to identify current user');
      return;
    }

    const payload = {
      id: cancelInvoice.id,
      cancelledBy: currentUser.staffId,
      reason: cancellationReason,
      restoreStock,
      notes: cancellationNotes.trim() || undefined,
    };

    console.log('Cancelling invoice with payload:', payload);

    cancelInvoiceMutation.mutate(
      payload,
      {
        onSuccess: (data) => {
          console.log('Cancel success:', data);
          setCancelInvoice(null);
          setCancellationReason('');
          setCancellationNotes('');
          setRestoreStock(true);
        },
        onError: (error) => {
          console.error('Cancel error:', error);
        },
      }
    );
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
      <AlertDialog open={!!markAsPaidInvoice} onOpenChange={() => {
        setMarkAsPaidInvoice(null);
        setPaymentMethod('cash');
        setReferenceNumber('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentNotes('');
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Invoice as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Record payment for invoice <strong>{markAsPaidInvoice?.invoiceNo}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            {(paymentMethod === 'transfer' || paymentMethod === 'card' || paymentMethod === 'cheque') && (
              <div className="space-y-2">
                <Label htmlFor="reference-number">
                  Reference Number {paymentMethod === 'transfer' ? <span className="text-red-500">*</span> : '(Optional)'}
                </Label>
                <Input
                  id="reference-number"
                  placeholder={
                    paymentMethod === 'transfer' ? 'e.g., TRF-2025-12345' :
                    paymentMethod === 'card' ? 'e.g., Transaction ID' :
                    'e.g., Cheque Number'
                  }
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            )}

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            {/* Payment Notes */}
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Any additional payment information..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkAsPaid}
              className="bg-green-600 hover:bg-green-700"
              disabled={markAsPaidMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {markAsPaidMutation.isPending ? 'Processing...' : 'Mark as Paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invoice Dialog */}
      <AlertDialog open={!!cancelInvoice} onOpenChange={() => {
        setCancelInvoice(null);
        setCancellationReason('');
        setCancellationNotes('');
        setRestoreStock(true);
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Cancel invoice <strong>{cancelInvoice?.invoiceNo}</strong>. Please provide a reason for cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Cancellation Reason */}
            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cancellation-reason"
                placeholder="e.g., Customer requested cancellation"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="cancellation-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="cancellation-notes"
                placeholder="Any additional information..."
                value={cancellationNotes}
                onChange={(e) => setCancellationNotes(e.target.value)}
                className="w-full resize-none"
                rows={3}
              />
            </div>

            {/* Restore Stock Checkbox */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Checkbox
                id="restore-stock"
                checked={restoreStock}
                onCheckedChange={(checked) => setRestoreStock(!!checked)}
              />
              <div className="flex-1">
                <Label
                  htmlFor="restore-stock"
                  className="text-sm font-medium text-blue-900 cursor-pointer"
                >
                  Restore product stock quantities
                </Label>
                <p className="text-xs text-blue-600 mt-0.5">
                  Products will become available for sale again
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Invoice</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelInvoice}
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancellationReason.trim() || cancelInvoiceMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {cancelInvoiceMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
