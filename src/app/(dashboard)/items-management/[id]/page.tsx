/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, TrendingUp, TrendingDown, Edit, Trash2, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { useMaterial, useMaterialTransactions } from "@/hooks/useMaterials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddStockDialog } from "@/components/materials/add-stock-dialog";
import { AdjustStockDialog } from "@/components/materials/adjust-stock-dialog";
import { EditMaterialDialog } from "@/components/materials/edit-material-dialog";
import { DeleteMaterialDialog } from "@/components/materials/delete-material-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MaterialDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = parseInt(params.id as string);

  const { data: material, isLoading: materialLoading } = useMaterial(materialId);
  const { data: transactions, isLoading: transactionsLoading } = useMaterialTransactions(materialId);

  const [showAddStock, setShowAddStock] = useState(false);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (materialLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Material not found</h3>
          <p className="mt-1 text-sm text-gray-500">The material you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Button onClick={() => router.push("/items-management")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Materials
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStockStatus = (quantity: number, minStockLevel: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (quantity <= minStockLevel) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const status = getStockStatus(material.quantity, material.minStockLevel);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionTypeIcon = (type: string) => {
    if (type === "addition" || type === "increase") {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTransactionTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      addition: { label: "Stock Added", color: "bg-green-100 text-green-800" },
      increase: { label: "Increased", color: "bg-blue-100 text-blue-800" },
      decrease: { label: "Decreased", color: "bg-orange-100 text-orange-800" },
      usage: { label: "Used", color: "bg-purple-100 text-purple-800" },
      adjustment: { label: "Adjusted", color: "bg-gray-100 text-gray-800" },
    };
    const typeInfo = types[type] || { label: type, color: "bg-gray-100 text-gray-800" };
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/items-management")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Materials
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{material.name}</h1>
            {material.code && (
              <p className="text-sm text-gray-500 mt-1">Code: {material.code}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowAddStock(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
            <Button onClick={() => setShowAdjustStock(true)} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Adjust Stock
            </Button>
            <Button onClick={() => setShowEdit(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => setShowDelete(true)} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Material Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {material.quantity} {material.type?.unit || "units"}
            </div>
            <Badge className={`mt-2 ${status.color}`}>{status.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Min Stock Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {material.minStockLevel || 10} {material.type?.unit || "units"}
            </div>
            {material.quantity <= (material.minStockLevel || 10) && (
              <p className="text-sm text-yellow-600 mt-2">Below minimum level</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{material.type?.name || "N/A"}</div>
            <p className="text-sm text-gray-500 mt-1">Unit: {material.type?.unit || "units"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions?.total || transactions?.data?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {material.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{material.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : transactions?.data && transactions.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.data.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionTypeIcon(transaction.type)}
                          {getTransactionTypeBadge(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          transaction.type === "decrease" || transaction.type === "usage" || transaction.type === "removal"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}>
                          {transaction.type === "decrease" || transaction.type === "usage" || transaction.type === "removal"
                            ? "-"
                            : "+"}
                          {transaction.quantity} {material.type?.unit || "units"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.performedBy || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Transactions will appear here when stock is added or adjusted.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showAddStock && (
        <AddStockDialog
          material={material}
          open={showAddStock}
          onClose={() => setShowAddStock(false)}
        />
      )}
      {showAdjustStock && (
        <AdjustStockDialog
          material={material}
          open={showAdjustStock}
          onClose={() => setShowAdjustStock(false)}
        />
      )}
      {showEdit && (
        <EditMaterialDialog
          material={material}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showDelete && (
        <DeleteMaterialDialog
          material={material}
          open={showDelete}
          onClose={() => {
            setShowDelete(false);
          }}
        />
      )}
    </div>
  );
}
