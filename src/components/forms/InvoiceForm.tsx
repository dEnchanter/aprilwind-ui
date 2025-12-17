// components/forms/InvoiceForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react";
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Endpoint } from "@/services/api";
import { fetchPatch, fetchPost } from "@/services/fetcher";
import { toast } from "sonner";
import { z } from "zod";
import { InvoiceFormData, invoiceSchema } from "@/schemas/invoiceSchema"; // Assuming invoiceSchema is defined
import { useStaff } from "@/hooks/useStaff"; // Custom hook for fetching staff members
import { useCustomers } from "@/hooks/useCustomer";

interface InvoiceFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
  initialValues?: Partial<Invoice>;
}

const InvoiceForm = ({ className, closeDialog, initialValues }: InvoiceFormProps) => {
  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNo: initialValues?.invoiceNo || "",
      invoiceDetails: initialValues?.invoiceDetails || {},
      customerId: initialValues?.customerId || 0,
      generatedById: initialValues?.generatedById || 0,
      status: initialValues?.status || "Pending",
    },
  });

  const { data: customers, isLoading: customersLoading, isError: customersError } = useCustomers();
  const { data: staffMembers, isLoading: staffLoading, isError: staffError } = useStaff();

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const onSubmit: SubmitHandler<InvoiceFormData> = async (data) => {
    setIsLoadingSubmit(true);

    const processedData = { ...data };

    try {
      if (initialValues?.invoiceNo) {
        const responseData: any = await fetchPatch(
          `${Endpoint.UPDATE_INVOICE}/${initialValues.invoiceNo}`,
          processedData
        );
        toast.success(responseData?.message || "Invoice updated successfully!");
      } else {
        const responseData: any = await fetchPost(Endpoint.CREATE_INVOICE, processedData);
        toast.success(responseData?.message || "Invoice created successfully!");
      }
      closeDialog();
    } catch (error: any) {
      toast.error(error?.message || 'An unexpected error occurred');
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <>
      <div className="font-medium">{initialValues ? 'Update' : 'Create'} Invoice</div>
      <Form {...form}>
        <form 
          className={cn("space-y-6", className)} 
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Invoice Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="invoiceNo"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Invoice No</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="Invoice Number" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            {/* Customer Selection */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Customer</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersLoading ? (
                          <SelectItem disabled value="nil">Loading...</SelectItem>
                        ) : customersError ? (
                          <SelectItem disabled value="nil">Error loading customers</SelectItem>
                        ) : (
                          customers?.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            {/* Staff Selection for Generated By */}
            <FormField
              control={form.control}
              name="generatedById"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Generated By</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffLoading ? (
                          <SelectItem disabled value="nil">Loading...</SelectItem>
                        ) : staffError ? (
                          <SelectItem disabled value="nil">Error loading staff</SelectItem>
                        ) : (
                          staffMembers?.data?.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id.toString()}>
                              {staff.staffName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            {/* Invoice Details (Dynamic Fields) */}
            <FormField
              control={form.control}
              name="invoiceDetails"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Invoice Details</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input 
                      placeholder="Invoice details" 
                      value={JSON.stringify(field.value)} 
                      onChange={(e) => field.onChange(JSON.parse(e.target.value || "{}"))} 
                    />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Status</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button type="button" size="lg" variant="outline" onClick={closeDialog}>Cancel</Button>
            <CustomButton
              type="submit"
              size="lg"
              className=" bg-[#0F3F5F] hover:bg-[#0F3F5F]"
              isLoading={isLoadingSubmit}
            >
               {initialValues?.invoiceNo ? "Update Invoice" : "Create Invoice"}	
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
};

export default InvoiceForm;
