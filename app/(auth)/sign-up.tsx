import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SignUpFormValues, codeSchema, signUpSchema } from "@/lib/schemas/auth";

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form for initial Sign Up
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  // Form for OTP Verification
  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: { code: "" },
  });

  // Handle Initial Sign Up Submission
  const onSignUpSubmit = async (data: SignUpFormValues) => {
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setEmail(data.email);

      const target = signUp as any;

      // Check if using new Clerk Core 2 (Signal API)
      if (target?.verifications?.sendEmailCode || target?.sendEmailCode) {
        const createRes = await target.create({
          firstName: data.firstName,
          lastName: data.lastName,
          emailAddress: data.email,
          password: data.password,
        });

        if (createRes?.error) {
          setErrorMessage(
            createRes.error.message || "Failed to create account.",
          );
          return;
        }

        const sendCodeFn =
          target?.verifications?.sendEmailCode || target?.sendEmailCode;
        const sendRes = await sendCodeFn.call(target?.verifications || target);
        if (sendRes?.error) {
          setErrorMessage(
            sendRes.error.message || "Failed to send verification code.",
          );
          return;
        }

        setPendingVerification(true);
      } else {
        // Fallback for legacy API
        await target.create({
          firstName: data.firstName,
          lastName: data.lastName,
          emailAddress: data.email,
          password: data.password,
        });

        if (typeof target.prepareEmailAddressVerification === "function") {
          await target.prepareEmailAddressVerification({
            strategy: "email_code",
          });
        } else if (typeof target.prepareVerification === "function") {
          await target.prepareVerification({ strategy: "email_code" });
        }
        setPendingVerification(true);
      }
    } catch (err: any) {
      console.error("Sign Up Error Details:", err?.errors || err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification Submission
  const onVerifySubmit = async (data: { code: string }) => {
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const target = signUp as any;

      // New Clerk Core 2 API
      if (target?.verifications?.verifyEmailCode || target?.verifyEmailCode) {
        const verifyFn =
          target?.verifications?.verifyEmailCode || target?.verifyEmailCode;
        const verifyRes = await verifyFn.call(target?.verifications || target, {
          code: data.code,
        });

        if (verifyRes?.error) {
          setErrorMessage(
            verifyRes.error.message || "Invalid verification code.",
          );
          return;
        }

        if (target.createdSessionId && setActive) {
          await setActive({ session: target.createdSessionId });
          router.replace("/(root)/(tabs)");
        } else {
          setErrorMessage("Verification incomplete. Please try again.");
        }
      } else {
        // Fallback for legacy API
        const attemptFn =
          target.attemptEmailAddressVerification || target.attemptVerification;
        const completeSignUp = await attemptFn.call(target, {
          code: data.code,
          strategy: "email_code",
        });

        if (completeSignUp.status === "complete") {
          if (setActive) {
            await setActive({ session: completeSignUp.createdSessionId });
          }
          router.replace("/(root)/(tabs)");
        } else {
          setErrorMessage("Verification incomplete. Please check your code.");
        }
      }
    } catch (err: any) {
      console.error("Verify Error Details:", err?.errors || err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Invalid verification code.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const onResendCode = async () => {
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const target = signUp as any;
      if (target?.verifications?.sendEmailCode || target?.sendEmailCode) {
        const sendCodeFn =
          target?.verifications?.sendEmailCode || target?.sendEmailCode;
        const sendRes = await sendCodeFn.call(target?.verifications || target);
        if (sendRes?.error) {
          setErrorMessage(sendRes.error.message || "Failed to resend code.");
          return;
        }
      } else if (typeof target.prepareEmailAddressVerification === "function") {
        await target.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }

      alert("A new verification code has been sent to your email.");
    } catch (err: any) {
      console.error("Resend Code Error Details:", err?.errors || err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to resend code.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Start Over (Reset back to Sign Up form)
  const onStartOver = async () => {
    try {
      const target = signUp as any;
      if (typeof target.reset === "function") {
        await target.reset();
      }
    } catch {}
    setPendingVerification(false);
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F8F9FA]"
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 20, 40),
          paddingBottom: Math.max(insets.bottom + 20, 24),
          paddingHorizontal: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Welth Logo Header */}
        <View className="flex-row items-center mb-8">
          <View className="flex-row items-end">
            <View className="mr-1 mb-1">
              <Ionicons name="stats-chart" size={24} color="#1E3A8A" />
            </View>
            <Text className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Welth<Text className="text-blue-600">.</Text>
            </Text>
          </View>
        </View>

        {/* Dynamic Screen Content: Verification OTP vs Create Account */}
        {pendingVerification ? (
          // ================= SCREEN 2: VERIFY ACCOUNT =================
          <View className="flex-1">
            <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Verify your account
            </Text>
            <Text className="text-base text-gray-500 mt-2 mb-6">
              We sent a code to {email || "your email"}
            </Text>

            {/* OTP Code Input Field */}
            <Controller
              control={codeControl}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Enter your OTP"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 shadow-sm"
                />
              )}
            />
            {codeErrors.code && (
              <Text className="text-red-500 text-sm mt-1.5 font-medium">
                {codeErrors.code.message}
              </Text>
            )}

            {/* Clerk / Network Error Message */}
            {errorMessage && (
              <Text className="text-red-500 text-sm mt-2 font-medium">
                {errorMessage}
              </Text>
            )}

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleCodeSubmit(onVerifySubmit)}
              disabled={isLoading}
              className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-2xl items-center justify-center mt-6 shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold">Verify</Text>
              )}
            </TouchableOpacity>

            {/* Action Links */}
            <View className="mt-6 gap-3">
              <TouchableOpacity onPress={onResendCode} disabled={isLoading}>
                <Text className="text-blue-600 text-base font-semibold">
                  I need a new code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onStartOver} disabled={isLoading}>
                <Text className="text-blue-600 text-base font-semibold">
                  Start over
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // ================= SCREEN 1: CREATE ACCOUNT =================
          <View className="flex-1 justify-between">
            <View>
              <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Create account
              </Text>
              <Text className="text-base text-gray-500 mt-1 mb-6">
                Track your money, powered by AI
              </Text>

              {/* First Name & Last Name (Side by Side) */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="First Name"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 shadow-sm"
                      />
                    )}
                  />
                  {formErrors.firstName && (
                    <Text className="text-red-500 text-xs mt-1 font-medium">
                      {formErrors.firstName.message}
                    </Text>
                  )}
                </View>

                <View className="flex-1">
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Last Name"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 shadow-sm"
                      />
                    )}
                  />
                  {formErrors.lastName && (
                    <Text className="text-red-500 text-xs mt-1 font-medium">
                      {formErrors.lastName.message}
                    </Text>
                  )}
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Enter you Email Adress"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 shadow-sm"
                    />
                  )}
                />
                {formErrors.email && (
                  <Text className="text-red-500 text-xs mt-1 font-medium">
                    {formErrors.email.message}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 shadow-sm"
                    />
                  )}
                />
                {formErrors.password && (
                  <Text className="text-red-500 text-xs mt-1 font-medium">
                    {formErrors.password.message}
                  </Text>
                )}
              </View>

              {/* Error Message */}
              {errorMessage && (
                <Text className="text-red-500 text-sm mb-4 font-medium">
                  {errorMessage}
                </Text>
              )}

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSignUpSubmit)}
                disabled={isLoading}
                className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-2xl items-center justify-center mt-2 shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Sign Up
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer Sign In Link */}
            <View className="flex-row items-center justify-center mt-8 pb-4">
              <Text className="text-gray-500 text-base font-medium">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                <Text className="text-blue-600 text-base font-bold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
