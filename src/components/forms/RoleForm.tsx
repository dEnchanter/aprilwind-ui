/* eslint-disable @typescript-eslint/no-explicit-any */
// components/forms/RoleForm.tsx
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react";
import { Form, FormControl, FormField } from "../ui/form";
import { Input } from "../ui/input";
import { Endpoint } from "@/services/api";
import { fetchPatch, fetchPost } from "@/services/fetcher";
import { toast } from "sonner";
import { z } from "zod";
import { RoleFormData, roleSchema } from "@/schemas/roleSchema";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const RoleForm = ({ className, closeDialog, initialValues }: { className?: string, closeDialog: () => void; initialValues?: Partial<Role> }) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      isLogin: initialValues?.isLogin ?? true,
    },
  });

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const onSubmit: SubmitHandler<RoleFormData> = async (data) => {
    setIsLoadingSubmit(true);

    const processedData = { ...data };

    try {
      if (initialValues?.id) {
        const responseData: any = await fetchPatch(`${Endpoint.UPDATE_ROLE(initialValues.id)}`, processedData);
        toast.success(responseData?.message || "Role updated successfully!");
      } else {
        const responseData: any = await fetchPost(Endpoint.CREATE_ROLE, processedData);
        toast.success(responseData?.message || "Role created successfully!");
      }

      // Invalidate roles query to refetch and show new/updated role immediately
      queryClient.invalidateQueries({ queryKey: ['roles'] });

      closeDialog();
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <>
      <div className="font-medium">{initialValues ? 'Update' : 'Create'} Role</div>
      <Form {...form}>
        <form 
          className={cn("space-y-6", className)} 
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <div>
                <Label>Name</Label>
                <FormControl>
                  <Input placeholder="Role Name" {...field} />
                </FormControl>
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <div>
                <Label>Description</Label>
                <FormControl>
                  <Input placeholder="Description" {...field} />
                </FormControl>
              </div>
            )}
          />

          {/* <FormField
            control={form.control}
            name="isLogin"
            render={({ field }) => (
              <div>
                <Label>Is Login</Label>
                <FormControl>
                  <Select value={String(field.value)} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Login Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
            )}
          /> */}
          
          <div className="flex items-center justify-end space-x-2">
            <Button type="button" size="lg" variant="outline" onClick={closeDialog}>Cancel</Button>
            <CustomButton
              type="submit"
              size="lg"
              className=" bg-[#0F3F5F] hover:bg-[#0F3F5F]"
              isLoading={isLoadingSubmit}
            >
              {initialValues?.id ? "Update Role" : "Create Role"}
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
};

export default RoleForm;
