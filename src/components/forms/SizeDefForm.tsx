/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sizeDefSchema, SizeDefFormData } from "@/schemas/sizeDefSchema";
import { useCreateSizeDef, useUpdateSizeDef } from "@/hooks/useSizeDefs";
import { SizeDef } from "@/types/size-def";
import { Loader2 } from "lucide-react";

interface SizeDefFormProps {
  closeDialog: () => void;
  initialValues?: SizeDef;
}

export default function SizeDefForm({ closeDialog, initialValues }: SizeDefFormProps) {
  const createMutation = useCreateSizeDef();
  const updateMutation = useUpdateSizeDef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SizeDefFormData>({
    resolver: zodResolver(sizeDefSchema),
    defaultValues: {
      size: initialValues?.size || undefined,
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    },
  });

  const onSubmit = (data: SizeDefFormData) => {
    if (initialValues?.id) {
      updateMutation.mutate(
        { id: initialValues.id, data },
        {
          onSuccess: () => {
            closeDialog();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          closeDialog();
        },
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {initialValues ? "Edit Size Definition" : "Create Size Definition"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {initialValues
            ? "Update the size definition details"
            : "Define a new size that can be used for products"}
        </p>
      </div>

      {/* Size Input */}
      <div className="space-y-2">
        <Label htmlFor="size">
          Size <span className="text-red-500">*</span>
        </Label>
        <Input
          id="size"
          type="number"
          step="0.01"
          placeholder="e.g., 10, 12, 14, 42, etc."
          {...register("size")}
        />
        {errors.size && (
          <p className="text-sm text-red-600">{errors.size.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Enter the numeric size value (can include decimals)
        </p>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name">Name (Optional)</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Small, Medium, Large, XL, etc."
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
        <p className="text-xs text-gray-500">
          A friendly name or label for this size (e.g., "Small", "Medium")
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="e.g., Medium, Large, Extra Large, or any additional notes..."
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={closeDialog}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-brand-700 hover:bg-brand-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialValues ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{initialValues ? "Update Size" : "Create Size"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
