/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Search, AlertTriangle, Package } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { Skeleton } from "@/components/ui/skeleton";

interface SelectedMaterial {
  itemId: number;
  name: string;
  code: string;
  quantity: number;
  availableStock: number;
  unit: string;
  type: string;
}

interface MaterialPickerProps {
  value: Array<{ itemId: number; quantity: number }>;
  onChange: (materials: Array<{ itemId: number; quantity: number }>) => void;
  error?: string;
}

export function MaterialPicker({ value = [], onChange, error }: MaterialPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
  const { data: materialsResponse, isLoading } = useMaterials({ page: 1, limit: 100 });
  const allMaterials = materialsResponse?.data || [];

  // Initialize selected materials from value prop
  useEffect(() => {
    if (value && value.length > 0 && allMaterials.length > 0) {
      const materials = value.map((v) => {
        const material = allMaterials.find((m: any) => m.id === v.itemId);
        return {
          itemId: v.itemId,
          name: material?.name || "Unknown",
          code: material?.code || "",
          quantity: v.quantity,
          availableStock: material?.quantity || 0,
          unit: material?.type?.unit || "units",
          type: material?.type?.name || "",
        };
      });
      setSelectedMaterials(materials);
    }
  }, [value, allMaterials]);

  // Filter available materials (not already selected)
  const availableMaterials = allMaterials.filter(
    (material: any) =>
      !selectedMaterials.some((sm) => sm.itemId === material.id) &&
      (material.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.type?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addMaterial = (material: any) => {
    const newMaterial: SelectedMaterial = {
      itemId: material.id,
      name: material.name,
      code: material.code,
      quantity: 1,
      availableStock: material.quantity,
      unit: material.type?.unit || "units",
      type: material.type?.name || "",
    };

    const updated = [...selectedMaterials, newMaterial];
    setSelectedMaterials(updated);
    onChange(updated.map((m) => ({ itemId: m.itemId, quantity: m.quantity })));
    setSearchTerm("");
  };

  const removeMaterial = (itemId: number) => {
    const updated = selectedMaterials.filter((m) => m.itemId !== itemId);
    setSelectedMaterials(updated);
    onChange(updated.map((m) => ({ itemId: m.itemId, quantity: m.quantity })));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    const updated = selectedMaterials.map((m) =>
      m.itemId === itemId ? { ...m, quantity: Math.max(0.01, quantity) } : m
    );
    setSelectedMaterials(updated);
    onChange(updated.map((m) => ({ itemId: m.itemId, quantity: m.quantity })));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Materials</Label>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Materials *</Label>
        <p className="text-xs text-gray-500 mt-1">
          Select materials and specify quantities needed for this request
        </p>
      </div>

      {/* Selected Materials */}
      {selectedMaterials.length > 0 && (
        <div className="space-y-2">
          {selectedMaterials.map((material) => {
            const isLowStock = material.quantity > material.availableStock;
            const isOutOfStock = material.availableStock === 0;

            return (
              <Card
                key={material.itemId}
                className={`border ${
                  isOutOfStock
                    ? "border-red-200 bg-red-50"
                    : isLowStock
                    ? "border-orange-200 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Material Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{material.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {material.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Code: {material.code} · Available: {material.availableStock} {material.unit}
                      </p>
                      {isOutOfStock && (
                        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Out of stock</span>
                        </div>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <div className="flex items-center gap-1 text-orange-600 text-xs mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Insufficient stock (need {material.quantity - material.availableStock} more)</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Input */}
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={material.quantity}
                          onChange={(e) => updateQuantity(material.itemId, parseFloat(e.target.value) || 0)}
                          className="h-9 text-sm"
                          placeholder="Quantity"
                        />
                        <p className="text-xs text-gray-500 mt-1">{material.unit}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterial(material.itemId)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Material Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search materials by name, code, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Available Materials Dropdown */}
        {searchTerm && availableMaterials.length > 0 && (
          <Card className="max-h-64 overflow-y-auto">
            <CardContent className="p-2">
              {availableMaterials.slice(0, 10).map((material: any) => (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => addMaterial(material)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-sm">{material.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {material.type?.name}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      {material.code} · Stock: {material.quantity} {material.type?.unit}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {searchTerm && availableMaterials.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No materials found matching "{searchTerm}"</p>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Empty State */}
      {selectedMaterials.length === 0 && !searchTerm && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">No materials selected</h4>
            <p className="text-sm text-gray-500">Search and select materials to add to this request</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
