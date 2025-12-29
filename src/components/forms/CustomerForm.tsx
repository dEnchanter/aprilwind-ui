// components/forms/CustomerForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { z } from "zod";
import { CustomerFormData, customerSchema } from "@/schemas/customerSchema";
import { useCustomerType } from "@/hooks/useCustomerType";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers";

interface CustomerFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
  initialValues?: Partial<Customer>;
}

const CustomerForm = ({ className, closeDialog, initialValues }: CustomerFormProps) => {
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name || "",
      address: initialValues?.address || "",
      country: initialValues?.country || "Nigeria",
      customerType: initialValues?.customerType || { id: 0, type: "" },
    },
  });

  const { data: customerTypes, isLoading: customerTypeIsLoading, isError } = useCustomerType();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    // Transform data to match API expectations
    const processedData = {
      name: data.name,
      address: data.address,
      country: data.country,
      typeId: data.customerType.id,
    };

    if (initialValues?.id) {
      updateMutation.mutate(
        { id: initialValues.id, data: processedData },
        {
          onSuccess: () => {
            closeDialog();
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(processedData, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        },
      });
    }
  };

  return (
    <>
      <div className="font-medium">{initialValues ? 'Update' : 'Create'} Customer</div>
      <Form {...form}>
        <form 
          className={cn("space-y-6", className)} 
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Customer Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Name</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="Customer Name" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Address</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="Customer Address" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Country</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Egypt">Egypt</SelectItem>
                        <SelectItem value="Morocco">Morocco</SelectItem>
                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                        <SelectItem value="Uganda">Uganda</SelectItem>
                        <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                        <SelectItem value="Cameroon">Cameroon</SelectItem>
                        <SelectItem value="Ivory Coast">Ivory Coast</SelectItem>
                        <SelectItem value="Senegal">Senegal</SelectItem>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                        <SelectItem value="Zambia">Zambia</SelectItem>
                        <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

           {/* Customer Type */}
           <FormField
              control={form.control}
              name="customerType.id"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Customer Type</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Select
                      value={field.value && field.value > 0 ? String(field.value) : undefined}
                      onValueChange={(value) => {
                        const selectedType = customerTypes?.find((type: any) => type.id === Number(value));
                        if (selectedType) {
                          form.setValue('customerType.id', selectedType.id);
                          form.setValue('customerType.type', selectedType.type);
                        }
                      }}
                      disabled={isLoading}  // Disable the select while loading
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Customer Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerTypeIsLoading ? (
                          <SelectItem disabled value="nil">Loading...</SelectItem>
                        ) : isError ? (
                          <SelectItem disabled value="nil">Error loading customer types</SelectItem>
                        ) : (
                          customerTypes?.map((type: any) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.type}
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
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button type="button" size="lg" variant="outline" onClick={closeDialog}>Cancel</Button>
            <CustomButton
              type="submit"
              size="lg"
              className=" bg-[#0F3F5F] hover:bg-[#0F3F5F]"
              isLoading={isLoading}
            >
               {initialValues?.id ? "Update Customer" : "Create Customer"}	
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
}

export default CustomerForm;
