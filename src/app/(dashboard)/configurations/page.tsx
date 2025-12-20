/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import RoleTable from "@/components/tables/RoleTable";
import ItemTypeTable from "@/components/tables/ItemTypeTable";
import CustomerTypeTable from "@/components/tables/CustomerTypeTable";
import SizeDefTable from "@/components/tables/SizeDefTable";
import { useRoles } from "@/hooks/useRole";
import { useItemTypes } from "@/hooks/useItemTypes";
import { useCustomerType } from "@/hooks/useCustomerType";
import { useSizeDefs } from "@/hooks/useSizeDefs";
import { Settings, Shield, Tags, Users, Ruler, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/dialog/CustomDialog";
import RoleForm from "@/components/forms/RoleForm";
import ItemTypeForm from "@/components/forms/ItemTypeForm";
import CustomerTypeForm from "@/components/forms/CustomerTypeForm";
import SizeDefForm from "@/components/forms/SizeDefForm";

const Page = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'itemTypes' | 'customerTypes' | 'sizeDefs'>('roles');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [itemTypeDialogOpen, setItemTypeDialogOpen] = useState(false);
  const [customerTypeDialogOpen, setCustomerTypeDialogOpen] = useState(false);
  const [sizeDefDialogOpen, setSizeDefDialogOpen] = useState(false);

  // Fetch data only for the active tab to avoid permission errors
  const { data: rolesResponse, isLoading: rolesLoading } = useRoles({ enabled: activeTab === 'roles' });
  const { data: itemTypesResponse, isLoading: itemTypesLoading } = useItemTypes({ enabled: activeTab === 'itemTypes' });
  const { data: customerTypesResponse, isLoading: customerTypesLoading } = useCustomerType({ enabled: activeTab === 'customerTypes' });
  const { data: sizeDefsResponse, isLoading: sizeDefsLoading } = useSizeDefs({ enabled: activeTab === 'sizeDefs' });

  const rolesData = rolesResponse?.data || [];
  const itemTypesData = itemTypesResponse?.data || [];
  const customerTypesData = customerTypesResponse || [];
  const sizeDefsData = sizeDefsResponse?.data || [];

  // Only show loading for the active tab
  const isLoading = (activeTab === 'roles' && rolesLoading) ||
                    (activeTab === 'itemTypes' && itemTypesLoading) ||
                    (activeTab === 'customerTypes' && customerTypesLoading) ||
                    (activeTab === 'sizeDefs' && sizeDefsLoading);

  // Calculate statistics (only for fetched data)
  const stats = useMemo(() => {
    const totalConfigs = rolesData.length + itemTypesData.length + customerTypesData.length + sizeDefsData.length;

    return [
      {
        title: "Total Configs",
        value: totalConfigs,
        icon: Settings,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Roles",
        value: rolesData.length,
        icon: Shield,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        title: "Item Types",
        value: itemTypesData.length,
        icon: Tags,
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        title: "Customer Types",
        value: customerTypesData.length,
        icon: Users,
        bgColor: "bg-amber-50",
        iconColor: "text-amber-600",
      },
      {
        title: "Size Definitions",
        value: sizeDefsData.length,
        icon: Ruler,
        bgColor: "bg-indigo-50",
        iconColor: "text-indigo-600",
      },
    ];
  }, [rolesData, itemTypesData, customerTypesData, sizeDefsData]);

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'roles':
        return 'Add Role';
      case 'itemTypes':
        return 'Add Item Type';
      case 'customerTypes':
        return 'Add Customer Type';
      case 'sizeDefs':
        return 'Add Size Definition';
    }
  };

  const handleAddClick = () => {
    switch (activeTab) {
      case 'roles':
        setRoleDialogOpen(true);
        break;
      case 'itemTypes':
        setItemTypeDialogOpen(true);
        break;
      case 'customerTypes':
        setCustomerTypeDialogOpen(true);
        break;
      case 'sizeDefs':
        setSizeDefDialogOpen(true);
        break;
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
          <h1 className="text-3xl font-bold text-gray-900">Configurations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system configurations, roles, and types
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          {getAddButtonText()}
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Tab Label */}
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Settings className="h-4 w-4 text-brand-600" />
                Configuration Categories
              </h3>

              {/* Filter Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(value: any) => setActiveTab(value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="roles"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Shield className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Roles</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {rolesData.length} roles
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="itemTypes"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Tags className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Item Types</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {itemTypesData.length} types
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="customerTypes"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Users className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Customer Types</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {customerTypesData.length} types
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="sizeDefs"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Ruler className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Size Definitions</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {sizeDefsData.length} sizes
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

      {/* Table Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {activeTab === 'roles' && <RoleTable hideAddButton />}
        {activeTab === 'itemTypes' && <ItemTypeTable hideAddButton />}
        {activeTab === 'customerTypes' && <CustomerTypeTable hideAddButton />}
        {activeTab === 'sizeDefs' && <SizeDefTable hideAddButton />}
      </motion.div>

      {/* Role Dialog */}
      <CustomDialog open={roleDialogOpen} toggleOpen={() => setRoleDialogOpen(!roleDialogOpen)} dialogWidth="sm:max-w-[700px]">
        <RoleForm closeDialog={() => setRoleDialogOpen(false)} />
      </CustomDialog>

      {/* Item Type Dialog */}
      <CustomDialog open={itemTypeDialogOpen} toggleOpen={() => setItemTypeDialogOpen(!itemTypeDialogOpen)} dialogWidth="sm:max-w-[700px]">
        <ItemTypeForm closeDialog={() => setItemTypeDialogOpen(false)} />
      </CustomDialog>

      {/* Customer Type Dialog */}
      <CustomDialog open={customerTypeDialogOpen} toggleOpen={() => setCustomerTypeDialogOpen(!customerTypeDialogOpen)} dialogWidth="sm:max-w-[700px]">
        <CustomerTypeForm closeDialog={() => setCustomerTypeDialogOpen(false)} />
      </CustomDialog>

      {/* Size Definition Dialog */}
      <CustomDialog open={sizeDefDialogOpen} toggleOpen={() => setSizeDefDialogOpen(!sizeDefDialogOpen)} dialogWidth="sm:max-w-[500px]">
        <SizeDefForm closeDialog={() => setSizeDefDialogOpen(false)} />
      </CustomDialog>
    </div>
  );
};

export default Page;
