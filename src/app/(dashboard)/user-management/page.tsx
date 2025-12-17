/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import StaffTable from "@/components/tables/StaffTable";
import CustomerTable from "@/components/tables/CustomerTable";
import { useStaff } from "@/hooks/useStaff";
import { useCustomers } from "@/hooks/useCustomers";
import { Users, UserCheck, UserCog, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/dialog/CustomDialog";
import StaffForm from "@/components/forms/StaffForm";
import CustomerForm from "@/components/forms/CustomerForm";

const Page = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'customers'>('staff');
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  // Fetch data
  const { data: staffResponse, isLoading: staffLoading } = useStaff({ page: 1, limit: 100 });
  const { data: customersResponse, isLoading: customersLoading } = useCustomers({ page: 1, limit: 100 });

  const staffData = staffResponse?.data || [];
  const customersData = customersResponse?.data || [];

  const isLoading = staffLoading || customersLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = staffData.length + customersData.length;
    const activeStaff = staffData.filter((s: any) => s.isActive !== false).length;
    const totalCustomers = customersData.length;

    return [
      {
        title: "Total Users",
        value: totalUsers,
        icon: Users,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Staff Members",
        value: staffData.length,
        icon: UserCog,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        title: "Customers",
        value: totalCustomers,
        icon: UserCheck,
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        title: "Active Staff",
        value: activeStaff,
        icon: TrendingUp,
        bgColor: "bg-amber-50",
        iconColor: "text-amber-600",
      },
    ];
  }, [staffData, customersData]);

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage staff members and customer accounts
          </p>
        </div>
        <Button
          onClick={() => activeTab === 'staff' ? setStaffDialogOpen(true) : setCustomerDialogOpen(true)}
          className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'staff' ? 'Add Staff' : 'Add Customer'}
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
                <Users className="h-4 w-4 text-brand-600" />
                User Categories
              </h3>

              {/* Filter Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(value: any) => setActiveTab(value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="staff"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <UserCog className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Staff Members</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {staffData.length} members
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="customers"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <UserCheck className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Customers</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {customersData.length} customers
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
        {activeTab === 'staff' ? (
          <StaffTable hideAddButton />
        ) : (
          <CustomerTable hideAddButton />
        )}
      </motion.div>

      {/* Staff Dialog */}
      <CustomDialog open={staffDialogOpen} toggleOpen={() => setStaffDialogOpen(!staffDialogOpen)} dialogWidth="sm:max-w-[700px]">
        <StaffForm closeDialog={() => setStaffDialogOpen(false)} />
      </CustomDialog>

      {/* Customer Dialog */}
      <CustomDialog open={customerDialogOpen} toggleOpen={() => setCustomerDialogOpen(!customerDialogOpen)} dialogWidth="sm:max-w-[700px]">
        <CustomerForm closeDialog={() => setCustomerDialogOpen(false)} />
      </CustomDialog>
    </div>
  );
};

export default Page;
