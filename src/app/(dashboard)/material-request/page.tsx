/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useCallback } from "react";
import { Plus, Search, Clock, CheckCircle2, XOctagon, FileX, Layers, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  useMaterialRequests,
} from "@/hooks/useMaterialRequest";
import { MaterialRequestsTable } from "@/components/tables/MaterialRequestsTable";
import CustomDialog from "@/components/dialog/CustomDialog";
import MaterialRequestForm from "@/components/forms/MaterialRequestForm";

export default function MaterialRequestPage() {
  const [page, setPage] = useState(1);
  const [filterTab, setFilterTab] = useState<'all' | MaterialRequestStatus>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMaterialRequest, setEditMaterialRequest] = useState<Partial<MaterialRequest> | undefined>(undefined);
  const [limit, setLimit] = useState(20);

  // Fetch all material requests with a high limit to get all records for client-side filtering
  const { data: materialRequestsResponse, isLoading } = useMaterialRequests({ page: 1, limit: 1000 });

  const allMaterialRequests = materialRequestsResponse?.data || [];

  const handleEdit = useCallback((request: MaterialRequest) => {
    setEditMaterialRequest(request);
    setShowAddDialog(true);
  }, []);

  // Get data based on filter tab
  const getActiveData = () => {
    switch (filterTab) {
      case "pending":
        return allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'pending');
      case "approved":
        return allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'approved');
      case "rejected":
        return allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'rejected');
      case "cancelled":
        return allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'cancelled');
      default:
        return allMaterialRequests;
    }
  };

  const filteredData = getActiveData();

  // Apply search filter
  const searchFilteredData = searchTerm
    ? filteredData.filter((request: MaterialRequest) =>
        request.requester?.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.approvalStatus?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredData;

  // Status counts
  const statusCounts = {
    all: allMaterialRequests.length,
    pending: allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'pending').length,
    approved: allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'approved').length,
    rejected: allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'rejected').length,
    cancelled: allMaterialRequests.filter((r: MaterialRequest) => r.approvalStatus === 'cancelled').length,
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
          <h1 className="text-3xl font-bold text-gray-900">Material Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage material requests for production and track approval status
          </p>
        </div>
        <Button
          onClick={() => {
            setEditMaterialRequest(undefined);
            setShowAddDialog(true);
          }}
          className="bg-brand-700 hover:bg-brand-800 shadow-lg shadow-brand-700/30 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Request
        </Button>
      </motion.div>

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
                    placeholder="Search by requester or status..."
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
                <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Layers className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">All Requests</span>
                      {!isLoading && statusCounts.all > 0 && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {statusCounts.all} total
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Clock className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Pending</span>
                      {!isLoading && statusCounts.pending > 0 && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {statusCounts.pending} requests
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Approved</span>
                      {!isLoading && statusCounts.approved > 0 && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {statusCounts.approved} requests
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="rejected"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <XOctagon className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Rejected</span>
                      {!isLoading && statusCounts.rejected > 0 && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {statusCounts.rejected} requests
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="cancelled"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <FileX className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Cancelled</span>
                      {!isLoading && statusCounts.cancelled > 0 && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {statusCounts.cancelled} requests
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Active Filter Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-600"></div>
                <span>
                  Showing {searchFilteredData.length} of {filteredData.length} material requests
                  {searchTerm && ` matching "${searchTerm}"`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Material Requests Table */}
      <MaterialRequestsTable
        data={searchFilteredData}
        isLoading={isLoading}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onEdit={handleEdit}
      />

      {/* Add/Edit Material Request Dialog */}
      <CustomDialog
        open={showAddDialog}
        toggleOpen={() => {
          setShowAddDialog(false);
          setEditMaterialRequest(undefined);
        }}
        dialogWidth="sm:max-w-[700px]"
      >
        <MaterialRequestForm
          closeDialog={() => {
            setShowAddDialog(false);
            setEditMaterialRequest(undefined);
          }}
          initialValues={editMaterialRequest}
        />
      </CustomDialog>
    </div>
  );
}
