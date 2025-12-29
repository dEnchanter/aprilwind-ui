/* eslint-disable @typescript-eslint/no-explicit-any */
// components/forms/CustomerTypeForm.tsx
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from "../ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField } from "../ui/form";
import { z } from "zod";
import { CustomerTypeFormData, customerTypeSchema } from "@/schemas/customerTypeSchema";
import { cn } from "@/lib/utils";
import { useCreateCustomerType, useUpdateCustomerType } from "@/hooks/useCustomerType";

const CustomerTypeForm = ({ className, closeDialog, initialValues }: { className?: string, closeDialog: () => void, initialValues?: Partial<CustomerType> }) => {
  const createMutation = useCreateCustomerType();
  const updateMutation = useUpdateCustomerType();

  const form = useForm<z.infer<typeof customerTypeSchema>>({
    resolver: zodResolver(customerTypeSchema),
    defaultValues: {
      type: initialValues?.type || "", // Pre-populate with initial values if available
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit: SubmitHandler<CustomerTypeFormData> = async (data) => {
    if (initialValues?.id) {
      updateMutation.mutate(
        { id: initialValues.id, data },
        {
          onSuccess: () => {
            closeDialog();
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        },
      });
    }
  };

  return (
    <>
      <div className="font-medium">{initialValues ? 'Update' : 'Create'} Customer Type</div>
      <Form {...form}>
        <form 
          className={cn("space-y-6", className)} 
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <div>
                <Label>Customer Type</Label>
                <FormControl>
                  <Input placeholder="Customer Type" {...field} />
                </FormControl>
              </div>
            )}
          />
        
          <div className="flex items-center justify-end space-x-2">
            <Button type="button" size="lg" variant="outline" onClick={closeDialog} disabled={isLoading}>
              Cancel
            </Button>
            <CustomButton
              type="submit"
              size="lg"
              className=" bg-[#0F3F5F] hover:bg-[#0F3F5F]"
              isLoading={isLoading}
            >
               {initialValues?.id ? "Update Customer Type" : "Create Customer Type"}
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
};

export default CustomerTypeForm;
