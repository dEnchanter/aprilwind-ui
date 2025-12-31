/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    setValue,
  } = useForm<SizeDefFormData>({
    resolver: zodResolver(sizeDefSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      genderType: initialValues?.genderType || "",
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

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Size Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Size 8, Size 10, Size 12, etc."
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Enter the size name (e.g., &quot;Size 8&quot;, &quot;Size 10&quot;, &quot;Size 12&quot;)
        </p>
      </div>

      {/* Gender Type */}
      <div className="space-y-2">
        <Label htmlFor="genderType">
          Gender Type <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) => setValue("genderType", value)}
          defaultValue={initialValues?.genderType || ""}
        >
          <SelectTrigger id="genderType">
            <SelectValue placeholder="Select gender type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        {errors.genderType && (
          <p className="text-sm text-red-600">{errors.genderType.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Specify if this size is for male or female
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="e.g., Extra Small (XS) - Chest 32-34 inches, Small (S) - Chest 34-36 inches"
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
