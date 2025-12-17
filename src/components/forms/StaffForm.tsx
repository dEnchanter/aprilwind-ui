/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from "react";
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { z } from "zod";
import { StaffFormData, staffSchema } from "@/schemas/staffSchema";
import { useRoles } from "@/hooks/useRole";
import { useCreateStaff, useUpdateStaff } from "@/hooks/useStaff";
import { SimpleDatePicker } from "../ui/simple-date-picker";
import ProfilePictureUpload from "../ui/profile-picture-upload";

interface StaffFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
  initialValues?: Partial<Staff>;
}

const StaffForm = ({ className, closeDialog, initialValues }: StaffFormProps) => {
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const { data: rolesResponse, isLoading: roleIsLoading, error: roleError } = useRoles();
  const roles = rolesResponse?.data || [];

  const isEditing = !!initialValues?.id;
  const isLoading = createStaff.isPending || updateStaff.isPending;

  // Extract firstName and lastName from staffName if editing
  const getFirstName = () => {
    if (initialValues?.staffName) {
      return initialValues.staffName.split(' ')[0] || "";
    }
    return "";
  };

  const getLastName = () => {
    if (initialValues?.staffName) {
      const parts = initialValues.staffName.split(' ');
      return parts.slice(1).join(' ') || "";
    }
    return "";
  };

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName: getFirstName(),
      lastName: getLastName(),
      dob: initialValues?.dob || "",
      picture: initialValues?.picture || "",
      address: initialValues?.address || "",
      lga: initialValues?.lga || "",
      stateOfOrigin: initialValues?.stateOfOrigin || "",
      country: initialValues?.country || "",
      passportNumber: initialValues?.identity?.passportNumber || "",
      email: initialValues?.email || "",
      phoneNumber: initialValues?.phoneNumber || "",
      nextOfKinName: initialValues?.nextOfKin?.name || "",
      nextOfKinRelationship: initialValues?.nextOfKin?.relationship || "",
      nextOfKinContact: initialValues?.nextOfKin?.contact || "",
      professionalRefName: initialValues?.references?.professional?.name || "",
      professionalRefContact: initialValues?.references?.professional?.contact || "",
      professionalRefRelation: initialValues?.references?.professional?.relation || "",
      roleId: initialValues?.role?.id || 0,
    },
  });

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      form.reset({
        firstName: getFirstName(),
        lastName: getLastName(),
        dob: initialValues.dob || "",
        picture: initialValues.picture || "",
        address: initialValues.address || "",
        lga: initialValues.lga || "",
        stateOfOrigin: initialValues.stateOfOrigin || "",
        country: initialValues.country || "",
        passportNumber: initialValues.identity?.passportNumber || "",
        email: initialValues.email || "",
        phoneNumber: initialValues.phoneNumber || "",
        nextOfKinName: initialValues.nextOfKin?.name || "",
        nextOfKinRelationship: initialValues.nextOfKin?.relationship || "",
        nextOfKinContact: initialValues.nextOfKin?.contact || "",
        professionalRefName: initialValues.references?.professional?.name || "",
        professionalRefContact: initialValues.references?.professional?.contact || "",
        professionalRefRelation: initialValues.references?.professional?.relation || "",
        roleId: initialValues.role?.id || 0,
      });
    }
  }, [initialValues, form]);

  const onSubmit: SubmitHandler<StaffFormData> = async (data) => {
    // Transform the form data to match API expectations
    const apiData = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      picture: data.picture || "",
      address: data.address,
      lga: data.lga,
      stateOfOrigin: data.stateOfOrigin,
      country: data.country,
      identity: {
        passportNumber: data.passportNumber || "",
      },
      email: data.email,
      phoneNumber: data.phoneNumber,
      nextOfKin: {
        name: data.nextOfKinName || "",
        relationship: data.nextOfKinRelationship || "",
        contact: data.nextOfKinContact || "",
      },
      references: {
        professional: {
          name: data.professionalRefName || "",
          contact: data.professionalRefContact || "",
          relation: data.professionalRefRelation || "",
        },
      },
      roleId: data.roleId,
    };

    if (isEditing && initialValues?.id) {
      updateStaff.mutate(
        { id: initialValues.id, data: apiData },
        {
          onSuccess: () => {
            closeDialog();
            form.reset();
          },
        }
      );
    } else {
      createStaff.mutate(apiData, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        },
      });
    }
  };

  return (
    <>
      <div className="font-medium text-lg mb-4">{isEditing ? 'Edit' : 'Create'} Staff Member</div>
      <Form {...form}>
        <form
          className={cn("space-y-6", className)}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="picture"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <ProfilePictureUpload
                    value={field.value}
                    onChange={(image) => field.onChange(image)}
                  />
                  {error && <FormMessage className="text-red-600 text-xs p-1 text-center">{error.message}</FormMessage>}
                </div>
              )}
            />
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Personal Information</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">First Name *</Label>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Last Name *</Label>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field, fieldState: { error } }) => (
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Date of Birth *</Label>
                    <FormControl>
                      <SimpleDatePicker
                        onChange={(selectedDate: Date) => {
                          field.onChange(selectedDate.toISOString());
                        }}
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Contact Information</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Email *</Label>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Phone Number *</Label>
                    <FormControl>
                      <Input placeholder="08012345678" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Address Information</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field, fieldState: { error } }) => (
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Address *</Label>
                    <FormControl>
                      <Input placeholder="123 Street Name" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="lga"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Local Government Area *</Label>
                    <FormControl>
                      <Input placeholder="LGA" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="stateOfOrigin"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">State of Origin *</Label>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Country *</Label>
                    <FormControl>
                      <Input placeholder="Nigeria" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Passport Number (Optional)</Label>
                    <FormControl>
                      <Input placeholder="A12345678" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Next of Kin Section */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Next of Kin (Optional)</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nextOfKinName"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Name</Label>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="nextOfKinRelationship"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Relationship</Label>
                    <FormControl>
                      <Input placeholder="Spouse, Sibling, Parent, etc." {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="nextOfKinContact"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Contact</Label>
                    <FormControl>
                      <Input placeholder="08098765432" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Professional Reference Section */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Professional Reference (Optional)</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="professionalRefName"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Name</Label>
                    <FormControl>
                      <Input placeholder="Reference name" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="professionalRefContact"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Contact</Label>
                    <FormControl>
                      <Input placeholder="Contact number or email" {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="professionalRefRelation"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Relation/Position</Label>
                    <FormControl>
                      <Input placeholder="Former Manager, Colleague, etc." {...field} />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Role Section */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Role Information</div>

            <FormField
              control={form.control}
              name="roleId"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Role *</Label>
                  <Select
                    value={field.value && field.value > 0 ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger className={field.value && field.value > 0 ? 'font-medium' : ''}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleIsLoading ? (
                        <SelectItem disabled value="nil">Loading...</SelectItem>
                      ) : roleError ? (
                        <SelectItem disabled value="nil">Error loading roles</SelectItem>
                      ) : roles.length === 0 ? (
                        <SelectItem disabled value="nil">No roles available</SelectItem>
                      ) : (
                        roles.map((role: any) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => {
                closeDialog();
                form.reset();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <CustomButton
              type="submit"
              size="lg"
              className="bg-brand-700 hover:bg-brand-800"
              isLoading={isLoading}
            >
              {isEditing ? 'Update Staff' : 'Create Staff'}
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
}

export default StaffForm;
