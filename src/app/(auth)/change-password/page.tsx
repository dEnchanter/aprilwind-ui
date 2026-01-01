"use client"

import { useEffect, useState, Suspense } from "react"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, Loader2, KeyRound, AlertCircle, ShieldAlert, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useChangePassword } from "@/hooks/useAuth";
import { changePasswordSchema, ChangePasswordFormData } from "@/schemas/authSchema";
import { motion } from "framer-motion";

const generateStars = (count: number) => {
  return Array.from({ length: count }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
  }));
};

function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstLogin = searchParams.get('firstLogin') === 'true';

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });
  const changePasswordMutation = useChangePassword();

  const [stars, setStars] = useState<{ top: string; left: string; animationDelay: string }[]>([]);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const newPassword = watch('newPassword', '');

  useEffect(() => {
    setMounted(true);
    setStars(generateStars(50));
  }, []);

  const toggleCurrentPasswordVisibility = () => {
    setCurrentPasswordVisible((prev) => !prev);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-400' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-400' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { strength: 'Strong', color: 'text-green-400' };
    return { strength: 'Medium', color: 'text-yellow-400' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const onSubmit = async (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push('/dashboard-overview');
          }, 1500);
        },
      }
    );
  };

  const handleCancel = () => {
    if (!isFirstLogin) {
      router.back();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-brand-25 via-gray-900 to-brand-25 flex items-center justify-center overflow-hidden p-2 sm:p-4">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-700/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <Card className="w-full p-4 sm:p-6 bg-gray-900/70 backdrop-blur-md border-gray-800/50 shadow-2xl">
          <div className="flex flex-col items-center space-y-4 sm:space-y-5">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-700 to-brand-900 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.diamond className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 flex items-center justify-center ${isFirstLogin ? 'bg-orange-500' : 'bg-purple-500'}`}>
                {isFirstLogin ? (
                  <ShieldAlert className="w-2.5 h-2.5 text-white" />
                ) : (
                  <KeyRound className="w-2.5 h-2.5 text-white" />
                )}
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <Link href="/" className="flex flex-col items-center z-40">
                <span className="text-zinc-300 text-sm sm:text-base">
                  {isFirstLogin ? 'First Login - Change Your Password' : 'Change Your Password'}
                </span>
                <div className="text-2xl sm:text-3xl font-bold mt-0.5">
                  <span className="font-semibold bg-gradient-to-r from-brand-700 to-brand-900 text-transparent bg-clip-text">April</span>
                  <span className="italic text-zinc-100">Wind</span>
                </div>
              </Link>
              <p className="mt-2 text-zinc-500 text-xs sm:text-sm max-w-sm">
                {isFirstLogin
                  ? 'For security reasons, you must change your temporary password before accessing the system.'
                  : 'Update your password to keep your account secure.'}
              </p>
            </motion.div>

            {/* First Login Warning Banner */}
            {isFirstLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-orange-300 font-medium">Password Change Required</p>
                    <p className="text-xs text-orange-400 mt-0.5">
                      You cannot access the dashboard until you change your password.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {changePasswordMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-medium">Error</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    Failed to change password. Please check your current password and try again.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-3 sm:space-y-4"
            >
              {/* Current Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={currentPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    {...register('currentPassword')}
                    placeholder="Enter your current password"
                    className={`
                      placeholder:text-gray-500
                      border-gray-700
                      bg-gray-800/50
                      text-white
                      focus:border-brand-700
                      focus:ring-brand-700
                      transition-all
                      pr-12
                      py-3 sm:py-4
                      ${errors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    `}
                  />
                  <button
                    type="button"
                    onClick={toggleCurrentPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none focus:text-brand-700"
                    tabIndex={-1}
                  >
                    {currentPasswordVisible ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.currentPassword.message}
                  </motion.p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-zinc-300"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={newPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    {...register('newPassword')}
                    placeholder="Enter your new password"
                    className={`
                      placeholder:text-gray-500
                      border-gray-700
                      bg-gray-800/50
                      text-white
                      focus:border-brand-700
                      focus:ring-brand-700
                      transition-all
                      pr-12
                      py-3 sm:py-4
                      ${errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    `}
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none focus:text-brand-700"
                    tabIndex={-1}
                  >
                    {newPasswordVisible ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {newPassword && passwordStrength.strength && (
                  <p className={`text-xs ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.strength}
                  </p>
                )}
                {errors.newPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.newPassword.message}
                  </motion.p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    placeholder="Confirm your new password"
                    className={`
                      placeholder:text-gray-500
                      border-gray-700
                      bg-gray-800/50
                      text-white
                      focus:border-brand-700
                      focus:ring-brand-700
                      transition-all
                      pr-12
                      py-3 sm:py-4
                      ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    `}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none focus:text-brand-700"
                    tabIndex={-1}
                  >
                    {confirmPasswordVisible ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Cancel Button - Hidden for first login */}
                {!isFirstLogin && (
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-gray-700 text-zinc-300 hover:bg-gray-800 hover:text-white py-3 sm:py-4"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}

                {/* Submit Button */}
                <Button
                  className={`${isFirstLogin ? 'w-full' : 'flex-1'} bg-gradient-to-r from-brand-700 to-brand-900 text-white hover:from-brand-800 hover:to-brand-950 font-medium py-3 sm:py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-brand-700/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Changing password...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Change password
                    </span>
                  )}
                </Button>
              </div>
            </motion.form>

            {/* Footer - Only show for non-first login */}
            {!isFirstLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-3 border-t border-gray-800/50 w-full"
              >
                <Link
                  href="/dashboard-overview"
                  className="text-xs sm:text-sm text-zinc-400 hover:text-brand-700 transition-colors font-medium flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to dashboard
                </Link>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-gradient-to-br from-brand-25 via-gray-900 to-brand-25" />}>
      <ChangePasswordForm />
    </Suspense>
  );
}