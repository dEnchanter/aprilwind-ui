/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState } from "react";
import { Package, Hammer, Activity, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ProductDefinitionsTable } from "@/components/tables/ProductDefinitionsTable";
import { ProductForProductionsTable } from "@/components/tables/ProductForProductionsTable";
import { ProductionsTrackingTable } from "@/components/tables/ProductionsTrackingTable";
import CustomDialog from "@/components/dialog/CustomDialog";
import ProductDefForm from "@/components/forms/ProductDefForm";
import ProductForProductionForm from "@/components/forms/ProductForProductionForm";
import ProductionForm from "@/components/forms/ProductionForm";
import ProductDefDetailsSidebar from "@/components/sidebars/ProductDefDetailsSidebar";
import ProductForProductionDetailsSidebar from "@/components/sidebars/ProductForProductionDetailsSidebar";
import ProductionTrackingDetailsSidebar from "@/components/sidebars/ProductionTrackingDetailsSidebar";

export default function ProductionManagementPage() {
  const [activeTab, setActiveTab] = useState("product-definitions");
  const [searchTerm, setSearchTerm] = useState("");

  // Product Definitions
  const [showProductDefDialog, setShowProductDefDialog] = useState(false);
  const [editProductDef, setEditProductDef] = useState<any>(undefined);
  const [viewProductDef, setViewProductDef] = useState<any>(null);
  const [showProductDefSidebar, setShowProductDefSidebar] = useState(false);

  // Production Requests
  const [showProductForProductionDialog, setShowProductForProductionDialog] = useState(false);
  const [editProductForProduction, setEditProductForProduction] = useState<any>(undefined);
  const [viewProductForProduction, setViewProductForProduction] = useState<any>(null);
  const [showProductForProductionSidebar, setShowProductForProductionSidebar] = useState(false);

  // Production Tracking
  const [showProductionDialog, setShowProductionDialog] = useState(false);
  const [viewProductionTracking, setViewProductionTracking] = useState<any>(null);
  const [showProductionTrackingSidebar, setShowProductionTrackingSidebar] = useState(false);

  const getActiveTabConfig = () => {
    switch (activeTab) {
      case "product-definitions":
        return {
          title: "Product Definitions",
          description: "Define and manage product templates for your fashion items",
          buttonText: "Add Product Definition",
          onButtonClick: () => {
            setEditProductDef(undefined);
            setShowProductDefDialog(true);
          },
        };
      case "productions":
        return {
          title: "Production Requests",
          description: "Manage product requests for production batches",
          buttonText: "Create Production Request",
          onButtonClick: () => {
            setEditProductForProduction(undefined);
            setShowProductForProductionDialog(true);
          },
        };
      case "tracking":
        return {
          title: "Production Tracking",
          description: "Track and manage ongoing production activities",
          buttonText: "Create Production",
          onButtonClick: () => {
            setShowProductionDialog(true);
          },
        };
      default:
        return {
          title: "Production Management",
          description: "",
          buttonText: "Add",
          onButtonClick: () => {},
        };
    }
  };

  const activeConfig = getActiveTabConfig();

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
          <h1 className="text-3xl font-bold text-gray-900">{activeConfig.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeConfig.description}
          </p>
        </div>
        <Button
          onClick={activeConfig.onButtonClick}
          className="bg-brand-700 hover:bg-brand-800 shadow-lg shadow-brand-700/30 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeConfig.buttonText}
        </Button>
      </motion.div>

      {/* Tabs and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="product-definitions"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Package className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Definitions</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="productions"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Hammer className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Requests</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tracking"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Activity className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Tracking</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search Bar */}
              <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${
                      activeTab === "product-definitions"
                        ? "product definitions..."
                        : activeTab === "productions"
                        ? "production requests..."
                        : "productions..."
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-brand-500 focus:ring-brand-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="product-definitions" className="mt-0">
          <ProductDefinitionsTable
            searchTerm={searchTerm}
            onEdit={(productDef) => {
              setEditProductDef(productDef);
              setShowProductDefDialog(true);
            }}
            onView={(productDef) => {
              setViewProductDef(productDef);
              setShowProductDefSidebar(true);
            }}
          />
        </TabsContent>

        <TabsContent value="productions" className="mt-0">
          <ProductForProductionsTable
            searchTerm={searchTerm}
            onEdit={(production) => {
              setEditProductForProduction(production);
              setShowProductForProductionDialog(true);
            }}
            onView={(production) => {
              setViewProductForProduction(production);
              setShowProductForProductionSidebar(true);
            }}
          />
        </TabsContent>

        <TabsContent value="tracking" className="mt-0">
          <ProductionsTrackingTable
            searchTerm={searchTerm}
            onView={(production) => {
              setViewProductionTracking(production);
              setShowProductionTrackingSidebar(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Product Definition Dialog */}
      <CustomDialog
        open={showProductDefDialog}
        toggleOpen={() => {
          setShowProductDefDialog(false);
          setEditProductDef(undefined);
        }}
        dialogWidth="sm:max-w-[600px]"
      >
        <ProductDefForm
          closeDialog={() => {
            setShowProductDefDialog(false);
            setEditProductDef(undefined);
          }}
          initialValues={editProductDef}
        />
      </CustomDialog>

      {/* Product For Production Dialog */}
      <CustomDialog
        open={showProductForProductionDialog}
        toggleOpen={() => {
          setShowProductForProductionDialog(false);
          setEditProductForProduction(undefined);
        }}
        dialogWidth="sm:max-w-[700px]"
      >
        <ProductForProductionForm
          closeDialog={() => {
            setShowProductForProductionDialog(false);
            setEditProductForProduction(undefined);
          }}
          initialValues={editProductForProduction}
        />
      </CustomDialog>

      {/* Production Dialog */}
      <CustomDialog
        open={showProductionDialog}
        toggleOpen={() => {
          setShowProductionDialog(false);
        }}
        dialogWidth="sm:max-w-[700px]"
      >
        <ProductionForm
          closeDialog={() => {
            setShowProductionDialog(false);
          }}
        />
      </CustomDialog>

      {/* Product Definition Details Sidebar */}
      <ProductDefDetailsSidebar
        open={showProductDefSidebar}
        onClose={() => {
          setShowProductDefSidebar(false);
          setViewProductDef(null);
        }}
        productDef={viewProductDef}
      />

      {/* Production Request Details Sidebar */}
      <ProductForProductionDetailsSidebar
        open={showProductForProductionSidebar}
        onClose={() => {
          setShowProductForProductionSidebar(false);
          setViewProductForProduction(null);
        }}
        production={viewProductForProduction}
      />

      {/* Production Tracking Details Sidebar */}
      <ProductionTrackingDetailsSidebar
        open={showProductionTrackingSidebar}
        onClose={() => {
          setShowProductionTrackingSidebar(false);
          setViewProductionTracking(null);
        }}
        production={viewProductionTracking}
      />
    </div>
  );
}
