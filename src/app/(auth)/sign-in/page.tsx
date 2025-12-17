/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { FieldErrors, UseFormRegister, useForm } from 'react-hook-form';
import { EyeIcon, EyeOffIcon, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { getAccessToken } from "@/utils/storage";
import { motion } from "framer-motion";

interface FormData {
  profileCode: string;
  password: string;
  rememberMe?: boolean;
}

interface ProfileCodeFieldProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

interface PasswordFieldProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  passwordVisible: boolean;
  togglePasswordVisibility: () => void;
}

const generateStars = (count: number) => {
  return Array.from({ length: count }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
  }));
};

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setFocus } = useForm<FormData>({
    defaultValues: {
      profileCode: typeof window !== 'undefined' ? localStorage.getItem('rememberedProfileCode') || '' : '',
      rememberMe: typeof window !== 'undefined' ? localStorage.getItem('rememberedProfileCode') !== null : false,
    }
  });
  const loginMutation = useLogin();

  const [stars, setStars] = useState<{ top: string; left: string; animationDelay: string }[]>([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStars(generateStars(50));

    // Check if already logged in
    const token = getAccessToken();
    if (token) {
      router.push('/dashboard-overview');
    } else {
      // Auto-focus on profile code field
      setTimeout(() => setFocus('profileCode'), 100);
    }
  }, [router, setFocus]);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const onSubmit = async (data: FormData) => {
    // Handle remember me
    if (data.rememberMe) {
      localStorage.setItem('rememberedProfileCode', data.profileCode);
    } else {
      localStorage.removeItem('rememberedProfileCode');
    }

    loginMutation.mutate(
      { profileCode: data.profileCode, password: data.password },
      {
        onSuccess: () => {
          router.push('/dashboard-overview');
        },
      }
    );
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
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

      {/* Gradient orbs for extra visual appeal */}
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
            {/* Logo with animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-700 to-brand-900 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.diamond className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
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
                <span className="text-zinc-300 text-sm sm:text-base">Welcome back to</span>
                <div className="text-2xl sm:text-3xl font-bold mt-0.5">
                  <span className="font-semibold bg-gradient-to-r from-brand-700 to-brand-900 text-transparent bg-clip-text">April</span>
                  <span className="italic text-zinc-100">Wind</span>
                </div>
              </Link>
              <p className="mt-2 text-zinc-500 text-xs sm:text-sm max-w-sm">
                Sign in to manage your fashion business efficiently and securely.
              </p>
            </motion.div>

            {/* Error Alert */}
            {loginMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-medium">Login Failed</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    {(loginMutation.error as any)?.message || 'Invalid credentials. Please try again.'}
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
              <ProfileCodeField register={register} errors={errors} />
              <PasswordField
                register={register}
                errors={errors}
                passwordVisible={passwordVisible}
                togglePasswordVisibility={togglePasswordVisibility}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-700 focus:ring-2 focus:ring-brand-700 focus:ring-offset-0 focus:ring-offset-gray-900 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <ResetPasswordLink />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full bg-gradient-to-r from-brand-700 to-brand-900 text-white hover:from-brand-800 hover:to-brand-950 font-medium py-3 sm:py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-brand-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Sign in securely
                  </span>
                )}
              </Button>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-3 border-t border-gray-800/50 w-full"
            >
              <p className="text-xs sm:text-xs text-gray-500 text-center">
                Need access? <Link href="#" className="text-brand-700 hover:text-brand-600 transition-colors font-medium">Contact your administrator</Link>
              </p>
            </motion.div>
          </div>
        </Card>

        {/* Security Badge */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-600"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Secured with JWT Authentication</span>
        </motion.div> */}
      </motion.div>
    </div>
  )
}

function ProfileCodeField({ register, errors }: ProfileCodeFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="profileCode"
        className="block text-sm font-medium text-zinc-300"
      >
        Profile Code
      </Label>
      <Input
        id="profileCode"
        type="text"
        autoComplete="username"
        {...register('profileCode', {
          required: 'Profile code is required',
          minLength: {
            value: 3,
            message: 'Profile code must be at least 3 characters'
          }
        })}
        placeholder="Enter your profile code (e.g., ADMIN001)"
        className={`
          placeholder:text-gray-500
          border-gray-700
          bg-gray-800/50
          text-white
          focus:border-brand-700
          focus:ring-brand-700
          transition-all
          py-3 sm:py-4
          ${errors.profileCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        `}
      />
      {errors.profileCode && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {errors.profileCode.message?.toString()}
        </motion.p>
      )}
    </div>
  );
}

function PasswordField({ register, errors, passwordVisible, togglePasswordVisibility }: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="password"
        className="block text-sm font-medium text-zinc-300"
      >
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={passwordVisible ? "text" : "password"}
          autoComplete="current-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          placeholder="Enter your password"
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
            ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none focus:text-brand-700"
          tabIndex={-1}
        >
          {passwordVisible ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {errors.password && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {errors.password.message}
        </motion.p>
      )}
    </div>
  );
}

function ResetPasswordLink() {
  return (
    <Link
      href="/forgot-password"
      className="text-xs text-brand-700 hover:text-brand-600 transition-colors font-medium"
    >
      Forgot password?
    </Link>
  );
}
