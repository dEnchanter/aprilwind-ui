/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, CustomButton } from "@/components/ui/button";
import { Key, User, RefreshCw } from "lucide-react";

const registerLoginSchema = z.object({
  profileCode: z.string().min(3, "Profile code must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterLoginFormData = z.infer<typeof registerLoginSchema>;

interface RegisterLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: {
    id: number;
    staffName: string;
  } | null;
}

// Generate profile code suggestion from staff name
const generateProfileCode = (staffName: string): string => {
  if (!staffName) return "";

  const parts = staffName.trim().split(" ");
  if (parts.length === 1) {
    // Single name: take first 3 chars + random number
    return `${parts[0].substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`;
  }

  // Multiple names: first initial + last name + random number
  const firstInitial = parts[0][0].toUpperCase();
  const lastName = parts[parts.length - 1].toUpperCase();
  return `${firstInitial}${lastName}${Math.floor(Math.random() * 900) + 100}`;
};

// Generate secure password
const generateSecurePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';

  const allChars = uppercase + lowercase + numbers + symbols;

  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest (total length: 12 characters)
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const RegisterLoginDialog = ({ open, onOpenChange, staff }: RegisterLoginDialogProps) => {
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterLoginFormData>({
    resolver: zodResolver(registerLoginSchema),
    defaultValues: {
      profileCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Generate credentials
  const handleGenerateCredentials = () => {
    if (!staff) return;

    const newProfileCode = generateProfileCode(staff.staffName);
    const newPassword = generateSecurePassword();

    form.setValue("profileCode", newProfileCode);
    form.setValue("password", newPassword);
    form.setValue("confirmPassword", newPassword);
    setShowPassword(true); // Show passwords so user can see what was generated
  };

  // Update profile code suggestion when staff changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && staff) {
      // Auto-generate credentials when dialog opens
      const newProfileCode = generateProfileCode(staff.staffName);
      const newPassword = generateSecurePassword();

      form.setValue("profileCode", newProfileCode);
      form.setValue("password", newPassword);
      form.setValue("confirmPassword", newPassword);
      setShowPassword(true);
    } else {
      form.reset();
      setShowPassword(false);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: RegisterLoginFormData) => {
    if (!staff) return;

    registerMutation.mutate(
      {
        staffId: staff.id,
        profileCode: data.profileCode,
        password: data.password,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Register Login Credentials</DialogTitle>
          <DialogDescription>
            Create login credentials for <span className="font-semibold text-gray-900">{staff?.staffName}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Generate Credentials Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Auto-Generated Credentials</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Credentials are auto-generated on open. Click to regenerate.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCredentials}
                  className="ml-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Regenerate
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="profileCode"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Profile Code (Username)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        placeholder="STAFF001"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Used for login. Must be unique. You can edit or regenerate.
                  </p>
                  {error && <FormMessage className="text-red-600 text-xs mt-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    12 characters with uppercase, lowercase, numbers, and symbols.
                  </p>
                  {error && <FormMessage className="text-red-600 text-xs mt-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Confirm Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  {error && <FormMessage className="text-red-600 text-xs mt-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showPassword" className="text-xs text-gray-600 cursor-pointer">
                Show passwords
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={registerMutation.isPending}
              >
                Cancel
              </Button>
              <CustomButton
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                isLoading={registerMutation.isPending}
              >
                Register Login
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
