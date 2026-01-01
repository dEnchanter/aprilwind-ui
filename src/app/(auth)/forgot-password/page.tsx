"use client"

import { useEffect, useState } from "react"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useAuth";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/schemas/authSchema";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const generateStars = (count: number) => {
  return Array.from({ length: count }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
  }));
};

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const forgotPasswordMutation = useForgotPassword();

  const [stars, setStars] = useState<{ top: string; left: string; animationDelay: string }[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStars(generateStars(50));
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        setEmailSent(true);
        reset();
      },
    });
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
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <Mail className="w-2.5 h-2.5 text-white" />
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
                <span className="text-zinc-300 text-sm sm:text-base">Reset your password for</span>
                <div className="text-2xl sm:text-3xl font-bold mt-0.5">
                  <span className="font-semibold bg-gradient-to-r from-brand-700 to-brand-900 text-transparent bg-clip-text">April</span>
                  <span className="italic text-zinc-100">Wind</span>
                </div>
              </Link>
              <p className="mt-2 text-zinc-500 text-xs sm:text-sm max-w-sm">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </motion.div>

            {/* Success Message */}
            {emailSent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-300 font-medium">Check your email</p>
                    <p className="text-xs text-green-400 mt-1">
                      If an account with that email exists, we&apos;ve sent you a password reset link.
                      The link will expire in 1 hour.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {forgotPasswordMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-medium">Error</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    Failed to send reset email. Please try again.
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
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="Enter your email address"
                  className={`
                    placeholder:text-gray-500
                    border-gray-700
                    bg-gray-800/50
                    text-white
                    focus:border-brand-700
                    focus:ring-brand-700
                    transition-all
                    py-3 sm:py-4
                    ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  `}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                className="w-full bg-gradient-to-r from-brand-700 to-brand-900 text-white hover:from-brand-800 hover:to-brand-950 font-medium py-3 sm:py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-brand-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send reset link
                  </span>
                )}
              </Button>
            </motion.form>

            {/* Back to Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-3 border-t border-gray-800/50 w-full"
            >
              <Link
                href="/sign-in"
                className="text-xs sm:text-sm text-zinc-400 hover:text-brand-700 transition-colors font-medium flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to sign in
              </Link>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}