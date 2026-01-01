/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Package, AlertTriangle, CheckCircle, Layers, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialsTable } from "@/components/materials/materials-table";
import { AddMaterialDialog } from "@/components/materials/add-material-dialog";
import ItemTypeTable from "@/components/tables/ItemTypeTable";
import {
  useMaterials,
  useAvailableMaterials,
  useLowStockMaterials,
  useMaterialsSummary
} from "@/hooks/useMaterials";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { PermissionGuard } from "@/components/utils/PermissionGuard";
import { PermissionPresets } from "@/utils/permissions";

// Tab configuration with permissions
const ITEMS_TABS = [
  {
    value: 'materials',
    label: 'Materials',
    icon: Package,
    permission: 'raw-items:read',
  },
  {
    value: 'item-types',
    label: 'Item Types',
    icon: Tags,
    permission: 'item-type:read',
  },
] as const;

export default function ItemsManagementPage() {
  const { can } = usePermissionCheck();

  // Filter tabs based on permissions
  const visibleTabs = useMemo(
    () => ITEMS_TABS.filter(tab => can(tab.permission)),
    [can]
  );

  const [page, setPage] = useState(1);
  const [mainTab, setMainTab] = useState(visibleTabs[0]?.value || "materials");

  // Update active tab if current tab becomes invisible
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find(t => t.value === mainTab)) {
      setMainTab(visibleTabs[0]?.value);
    }
  }, [visibleTabs, mainTab]);
  const [filterTab, setFilterTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [limit, setLimit] = useState(20);

  // Only fetch materials data when on materials tab
  const { data: allMaterials, isLoading: allLoading } = useMaterials({
    page,
    limit,
    enabled: mainTab === "materials" && filterTab === "all"
  });
  const { data: availableMaterials, isLoading: availableLoading } = useAvailableMaterials({
    enabled: mainTab === "materials" && filterTab === "available"
  });
  const { data: lowStockMaterials, isLoading: lowStockLoading } = useLowStockMaterials({
    enabled: mainTab === "materials" && filterTab === "low-stock"
  });
  const { data: summary, isLoading: summaryLoading } = useMaterialsSummary({
    enabled: mainTab === "materials"
  });

  // Listen for custom event to open add dialog
  useEffect(() => {
    const handleOpenAddMaterial = () => setShowAddDialog(true);
    window.addEventListener('openAddMaterial', handleOpenAddMaterial as EventListener);
    return () => window.removeEventListener('openAddMaterial', handleOpenAddMaterial as EventListener);
  }, []);

  // Get data based on filter tab
  const getActiveData = () => {
    switch (filterTab) {
      case "available":
        return availableMaterials?.data || [];
      case "low-stock":
        return lowStockMaterials?.data || [];
      default:
        return allMaterials?.data || [];
    }
  };

  const getIsLoading = () => {
    switch (filterTab) {
      case "available":
        return availableLoading;
      case "low-stock":
        return lowStockLoading;
      default:
        return allLoading;
    }
  };

  const filteredData = getActiveData();

  // Apply search filter
  const searchFilteredData = searchTerm
    ? filteredData.filter((item: any) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredData;

  const totalPages = allMaterials?.totalPages || 1;

  const stats = [
    {
      title: "Total Materials",
      value: summary?.total || summary?.totalMaterials || 0,
      icon: Layers,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      loading: summaryLoading,
    },
    {
      title: "In Stock",
      value: summary?.inStock || summary?.inStockMaterials || 0,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      loading: summaryLoading,
    },
    {
      title: "Low Stock",
      value: summary?.lowStock || summary?.lowStockMaterials || lowStockMaterials?.total || 0,
      icon: AlertTriangle,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      loading: summaryLoading,
      alert: (summary?.lowStock || summary?.lowStockMaterials || lowStockMaterials?.total || 0) > 0,
    },
    {
      title: "Out of Stock",
      value: summary?.outOfStock || summary?.outOfStockMaterials || 0,
      icon: Package,
      color: "red",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      loading: summaryLoading,
    },
  ];

  // Show access restricted message if no visible tabs
  if (visibleTabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-600">
            You do not have permission to view any modules on this page.
          </p>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Items Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your raw materials inventory, types, and stock levels
          </p>
        </div>
        {mainTab === "materials" && (
          <PermissionGuard permissions={PermissionPresets.MATERIALS_CREATE}>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-brand-700 hover:bg-brand-800 shadow-lg shadow-brand-700/30 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </PermissionGuard>
        )}
      </motion.div>

      {/* Main Tabs - Materials vs Item Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs value={mainTab} onValueChange={(value) => setMainTab(value as typeof mainTab)} className="w-full">
          <TabsList className={`grid w-full ${
            visibleTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
          } lg:w-auto lg:inline-grid bg-gray-100 p-1 h-auto`}>
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 py-2.5"
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Conditional Tab Content - Only render active tab */}
        {mainTab === "materials" && (
          <div className="space-y-6 mt-6">
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
                    <Card className={`border-0 shadow-md hover:shadow-lg transition-all ${
                      stat.alert ? 'ring-2 ring-orange-200' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {stat.title}
                            </p>
                            {stat.loading ? (
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
            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Filter Label */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-brand-600" />
                      Filter by Stock Status
                    </h3>
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, code, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-gray-200 focus:border-brand-500 focus:ring-brand-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <Tabs
                    value={filterTab}
                    onValueChange={(value) => {
                      setFilterTab(value);
                      setPage(1);
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                      >
                        <Layers className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs sm:text-sm">All Materials</span>
                          {!summaryLoading && (summary?.total || summary?.totalMaterials || 0) > 0 && (
                            <span className="text-[10px] sm:text-xs opacity-80">
                              {summary?.total || summary?.totalMaterials} items
                            </span>
                          )}
                        </div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="available"
                        className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs sm:text-sm">In Stock</span>
                          {!summaryLoading && (summary?.inStock || summary?.inStockMaterials || 0) > 0 && (
                            <span className="text-[10px] sm:text-xs opacity-80">
                              {summary?.inStock || summary?.inStockMaterials} available
                            </span>
                          )}
                        </div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="low-stock"
                        className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs sm:text-sm">Low Stock</span>
                          {!lowStockLoading && (lowStockMaterials?.total || 0) > 0 && (
                            <span className="text-[10px] sm:text-xs opacity-80">
                              {lowStockMaterials?.total} alerts
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
                      Showing {searchFilteredData.length} of {filteredData.length} materials
                      {searchTerm && ` matching "${searchTerm}"`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Materials Table */}
            <MaterialsTable
              data={searchFilteredData}
              isLoading={getIsLoading()}
              page={page}
              totalPages={totalPages}
              totalItems={allMaterials?.total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}

        {mainTab === "item-types" && (
          <div className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-md bg-blue-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Tags className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">About Item Types</h3>
                      <p className="text-sm text-blue-700">
                        Item types categorize your raw materials (e.g., Fabric, Thread, Buttons).
                        Each type has a unit of measurement. Create types here first, then they&rsquo;ll
                        be available when adding new materials.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <ItemTypeTable />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Add Material Dialog */}
      <AddMaterialDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
