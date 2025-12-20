/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Plus, Search, ClipboardList, CheckCircle, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductionOrdersTable } from "@/components/tables/ProductionOrdersTable";
import {
  useProductionOrders,
  useProductionOrderAnalytics,
  useDeleteProductionOrder,
} from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
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
import { ApproveOrderDialog } from "@/components/production-orders/ApproveOrderDialog";
import { RejectOrderDialog } from "@/components/production-orders/RejectOrderDialog";
import { AssignToProductionDialog } from "@/components/production-orders/AssignToProductionDialog";
import { CompleteOrderDialog } from "@/components/production-orders/CompleteOrderDialog";
import { DeliverOrderDialog } from "@/components/production-orders/DeliverOrderDialog";
import { CancelOrderDialog } from "@/components/production-orders/CancelOrderDialog";
import { ProductionOrderDetailsSidebar } from "@/components/production-orders/ProductionOrderDetailsSidebar";
import CustomDialog from "@/components/dialog/CustomDialog";
import ProductionOrderForm from "@/components/forms/ProductionOrderForm";

export default function ProductionOrdersPage() {
  const [page, setPage] = useState(1);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'in_production' | 'completed' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(20);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editOrder, setEditOrder] = useState<ProductionOrder | undefined>(undefined);
  const [viewOrder, setViewOrder] = useState<ProductionOrder | null>(null);
  const [showViewSidebar, setShowViewSidebar] = useState(false);

  // Workflow dialog states
  const [approveOrder, setApproveOrder] = useState<ProductionOrder | null>(null);
  const [rejectOrder, setRejectOrder] = useState<ProductionOrder | null>(null);
  const [assignOrder, setAssignOrder] = useState<ProductionOrder | null>(null);
  const [completeOrder, setCompleteOrder] = useState<ProductionOrder | null>(null);
  const [deliverOrder, setDeliverOrder] = useState<ProductionOrder | null>(null);
  const [cancelOrder, setCancelOrder] = useState<ProductionOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<ProductionOrder | null>(null);

  // Fetch data
  const statusFilter = filterTab === 'all' ? undefined : filterTab;
  const { data: ordersResponse, isLoading } = useProductionOrders({
    page,
    limit: 100,
    status: statusFilter,
  });
  const { data: analytics, isLoading: analyticsLoading } = useProductionOrderAnalytics();
  const deleteOrderMutation = useDeleteProductionOrder();

  const allOrders = ordersResponse?.data || [];

  // Get data based on filter tab
  const getActiveData = () => {
    switch (filterTab) {
      case "pending":
        return allOrders.filter((o: any) => o.status === "pending");
      case "approved":
        return allOrders.filter((o: any) => o.status === "approved");
      case "in_production":
        return allOrders.filter((o: any) => o.status === "in_production");
      case "completed":
        return allOrders.filter((o: any) => o.status === "completed");
      case "delivered":
        return allOrders.filter((o: any) => o.status === "delivered");
      default:
        return allOrders;
    }
  };

  const filteredData = getActiveData();

  // Apply search filter
  const searchFilteredData = searchTerm
    ? filteredData.filter((order: any) =>
        order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderDetails?.some((detail: any) =>
          detail.productName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : filteredData;

  // Calculate stats
  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o: any) => o.status === "pending").length;
    const inProductionOrders = allOrders.filter((o: any) => o.status === "in_production").length;
    const completedOrders = allOrders.filter((o: any) => o.status === "completed").length;

    return [
      {
        title: "Total Orders",
        value: analytics?.totalOrders || totalOrders,
        icon: ClipboardList,
        color: "blue",
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Pending Approval",
        value: analytics?.byStatus?.pending || pendingOrders,
        icon: Package,
        color: "yellow",
        bgColor: "bg-yellow-50",
        iconColor: "text-yellow-600",
      },
      {
        title: "In Production",
        value: analytics?.byStatus?.in_production || inProductionOrders,
        icon: TrendingUp,
        color: "purple",
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        title: "Completed",
        value: analytics?.byStatus?.completed || completedOrders,
        icon: CheckCircle,
        color: "green",
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      },
    ];
  }, [allOrders, analytics]);

  // Action handlers
  const handleView = (order: ProductionOrder) => {
    setViewOrder(order);
    setShowViewSidebar(true);
  };

  const handleEdit = (order: ProductionOrder) => {
    setEditOrder(order);
    setShowCreateDialog(true);
  };

  const handleApprove = (order: ProductionOrder) => {
    setApproveOrder(order);
  };

  const handleReject = (order: ProductionOrder) => {
    setRejectOrder(order);
  };

  const handleAssign = (order: ProductionOrder) => {
    setAssignOrder(order);
  };

  const handleComplete = (order: ProductionOrder) => {
    setCompleteOrder(order);
  };

  const handleDeliver = (order: ProductionOrder) => {
    setDeliverOrder(order);
  };

  const handleCancel = (order: ProductionOrder) => {
    setCancelOrder(order);
  };

  const handleDelete = (order: ProductionOrder) => {
    setDeleteOrder(order);
  };

  const confirmDelete = () => {
    if (deleteOrder?.id) {
      deleteOrderMutation.mutate(deleteOrder.id, {
        onSuccess: () => {
          setDeleteOrder(null);
        },
      });
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Production Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage custom production orders from customers
          </p>
        </div>
        <Button
          onClick={() => {
            setEditOrder(undefined);
            setShowCreateDialog(true);
          }}
          className="bg-brand-700 hover:bg-brand-800 shadow-lg shadow-brand-700/30 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
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
                      {analyticsLoading ? (
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
                  <ClipboardList className="h-4 w-4 text-brand-600" />
                  Filter by Status
                </h3>
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by order number, customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-brand-500 focus:ring-brand-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <Tabs
                value={filterTab}
                onValueChange={(value: any) => {
                  setFilterTab(value);
                  setPage(1);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md py-2 rounded-md transition-all duration-200"
                  >
                    <span className="text-xs sm:text-sm">All</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 rounded-md transition-all duration-200"
                  >
                    <span className="text-xs sm:text-sm">Pending</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 rounded-md transition-all duration-200"
                  >
                    <span className="text-xs sm:text-sm">Approved</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="in_production"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 rounded-md transition-all duration-200"
                  >
                    <span className="text-xs sm:text-sm">In Production</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 rounded-md transition-all duration-200"
                  >
                    <span className="text-xs sm:text-sm">Completed</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="delivered"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 rounded-md transition-all duration-200"
                  >
                    <span className="text-xs sm:text-sm">Delivered</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Active Filter Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-600"></div>
                <span>
                  Showing {searchFilteredData.length} of {filteredData.length} orders
                  {searchTerm && ` matching "${searchTerm}"`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Production Orders Table */}
      <ProductionOrdersTable
        data={searchFilteredData}
        isLoading={isLoading}
        page={page}
        limit={limit}
        totalPages={Math.ceil(searchFilteredData.length / limit)}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onView={handleView}
        onEdit={handleEdit}
        onApprove={handleApprove}
        onReject={handleReject}
        onAssign={handleAssign}
        onComplete={handleComplete}
        onDeliver={handleDeliver}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />

      {/* Create/Edit Order Dialog */}
      <CustomDialog
        open={showCreateDialog}
        toggleOpen={() => {
          setShowCreateDialog(false);
          setEditOrder(undefined);
        }}
        dialogWidth="sm:max-w-[800px]"
      >
        <ProductionOrderForm
          closeDialog={() => {
            setShowCreateDialog(false);
            setEditOrder(undefined);
          }}
          initialValues={editOrder}
        />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrder} onOpenChange={() => setDeleteOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Production Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {deleteOrder?.orderNo}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Workflow Dialogs */}
      <ApproveOrderDialog
        order={approveOrder}
        open={!!approveOrder}
        onClose={() => setApproveOrder(null)}
      />

      <RejectOrderDialog
        order={rejectOrder}
        open={!!rejectOrder}
        onClose={() => setRejectOrder(null)}
      />

      <AssignToProductionDialog
        order={assignOrder}
        open={!!assignOrder}
        onClose={() => setAssignOrder(null)}
      />

      <CompleteOrderDialog
        order={completeOrder}
        open={!!completeOrder}
        onClose={() => setCompleteOrder(null)}
      />

      <DeliverOrderDialog
        order={deliverOrder}
        open={!!deliverOrder}
        onClose={() => setDeliverOrder(null)}
      />

      <CancelOrderDialog
        order={cancelOrder}
        open={!!cancelOrder}
        onClose={() => setCancelOrder(null)}
      />

      {/* Details Sidebar */}
      <ProductionOrderDetailsSidebar
        order={viewOrder}
        open={showViewSidebar}
        onClose={() => {
          setShowViewSidebar(false);
          setViewOrder(null);
        }}
      />
    </div>
  );
}
