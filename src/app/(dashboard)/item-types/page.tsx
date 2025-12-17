"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tags } from "lucide-react";
import ItemTypeTable from "@/components/tables/ItemTypeTable";

export default function ItemTypeManagementPage() {
  const [activeTab, setActiveTab] = useState("item-types");

  return (
    <div className="container mx-auto px-4 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Item Types Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage item types and categories for your materials
          </p>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="item-types" className="gap-2">
            <Tags className="h-4 w-4" />
            Item Types
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-2">
            <Package className="h-4 w-4" />
            Materials (Demo)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="item-types" className="space-y-4">
          <ItemTypeTable />
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Materials Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                This tab shows how you can integrate item types with materials.
                The item types you create will be available in the Add Material dialog.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}