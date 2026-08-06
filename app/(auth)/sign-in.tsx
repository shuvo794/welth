import { useAuth, useClerk, useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ResetPasswordEmailFormValues,
  ResetPasswordSubmitFormValues,
  SignInFormValues,
  resetPasswordEmailSchema,
  resetPasswordSubmitSchema,
  signInSchema,
} from "@/lib/schemas/auth";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const clerk = useClerk();
  const setActive = clerk.setActive;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form for Main Sign In
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  // Form for Reset Password Step 1 (Email)
  const {
    control: resetEmailControl,
    handleSubmit: handleResetEmailSubmit,
    formState: { errors: resetEmailErrors },
    setValue: setResetEmailValue,
  } = useForm<ResetPasswordEmailFormValues>({
    resolver: zodResolver(resetPasswordEmailSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  // Form for Reset Password Step 2 (Code & New Password)
  const {
    control: resetSubmitControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetSubmitErrors },
    reset: resetSubmitForm,
  } = useForm<ResetPasswordSubmitFormValues>({
    resolver: zodResolver(resetPasswordSubmitSchema),
    mode: "onBlur",
    defaultValues: { code: "", newPassword: "" },
  });

  // Main Sign In Submission
  const onSignInSubmit = async (data: SignInFormValues) => {
    if (!isLoaded) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let result: any;
      const clientSignIn = (clerk as any)?.client?.signIn || signIn;

      console.log("Submitting sign in for email:", data.email);

      try {
        result = await clientSignIn.create({
          identifier: data.email,
          password: data.password,
        });
      } catch (err1: any) {
        console.log("Primary sign in attempt note:", err1?.errors?.[0]?.message || err1?.message || err1);

        // Fallback with explicit strategy: "password"
        result = await clientSignIn.create({
          strategy: "password",
          identifier: data.email,
          password: data.password,
        });
      }

      console.log("Sign In Result Status:", result?.status, result?.createdSessionId);

      if (result?.status === "complete" || result?.createdSessionId) {
        const sessionId = result.createdSessionId;
        if (sessionId && setActive) {
          await setActive({ session: sessionId });
        }
        router.replace("/(root)/(tabs)");
      } else {
        const msg =
          result?.errors?.[0]?.longMessage ||
          result?.errors?.[0]?.message ||
          "Sign in incomplete. Please check your credentials.";
        setErrorMessage(msg);
      }
    } catch (err: any) {
      console.error("Sign In Error Details:", err?.errors || err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Invalid email or password. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Reset Modal
  const openResetModal = (currentEmail?: string) => {
    setResetStep(1);
    setResetErrorMessage(null);
    if (currentEmail) {
      setResetEmailValue("email", currentEmail);
    }
    setShowResetModal(true);
  };

  // Reset Step 1: Request Email Reset Code
  const onRequestResetCode = async (data: ResetPasswordEmailFormValues) => {
    if (!isLoaded || !signIn) return;
    setIsResetLoading(true);
    setResetErrorMessage(null);

    try {
      const target = signIn as any;

      // 1. Initialize signIn session for email identifier
      try {
        await target.create({
          identifier: data.email,
        });
      } catch (createErr: any) {
        console.log("Create signIn note:", createErr?.message || createErr);
      }

      // 2. Request reset password email code
      if (target.resetPasswordEmailCode?.sendCode) {
        const sendRes = await target.resetPasswordEmailCode.sendCode();
        if (sendRes?.error) {
          setResetErrorMessage(sendRes.error.message || "Failed to send reset code.");
          return;
        }
      } else {
        await target.create({
          strategy: "reset_password_email_code",
          identifier: data.email,
        });
      }

      setResetEmail(data.email);
      setResetStep(2);
    } catch (err: any) {
      console.error("Reset Code Request Error:", err?.errors || err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to send reset code. Please verify your email.";
      setResetErrorMessage(msg);
    } finally {
      setIsResetLoading(false);
    }
  };

  // Reset Step 2: Submit OTP Code & New Password
  const onResetPasswordSubmit = async (data: ResetPasswordSubmitFormValues) => {
    if (!isLoaded || !signIn) return;
    setIsResetLoading(true);
    setResetErrorMessage(null);

    try {
      const target = signIn as any;

      // 1. Verify Code
      if (target.resetPasswordEmailCode?.verifyCode) {
        console.log("Executing verifyCode...");
        const verifyRes = await target.resetPasswordEmailCode.verifyCode({ code: data.code });
        console.log("verifyRes:", verifyRes);

        if (verifyRes?.error) {
          setResetErrorMessage(verifyRes.error.message || "Invalid verification code.");
          return;
        }
      }

      // 2. Submit New Password
      if (target.resetPasswordEmailCode?.submitPassword) {
        console.log("Executing submitPassword...");
        const passwordRes = await target.resetPasswordEmailCode.submitPassword({ password: data.newPassword });
        console.log("passwordRes:", passwordRes);

        if (passwordRes?.error) {
          setResetErrorMessage(passwordRes.error.message || "Failed to update password.");
          return;
        }
      } else if (typeof target.attemptFirstFactor === "function") {
        const attemptRes = await target.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: data.code,
          password: data.newPassword,
        });
        if (attemptRes?.error) {
          setResetErrorMessage(attemptRes.error.message || "Failed to reset password.");
          return;
        }
      }

      // 3. Complete session or auto-fill Sign In
      if (target.status === "complete" && target.createdSessionId) {
        if (setActive) {
          await setActive({ session: target.createdSessionId });
        }
        setShowResetModal(false);
        router.replace("/(root)/(tabs)");
        return;
      }

      setShowResetModal(false);
      setValue("email", resetEmail);
      setValue("password", data.newPassword);
      setErrorMessage(null);
      alert("Password reset successfully! Please tap 'Sign In' below to log in.");
    } catch (err: any) {
      console.error("Reset Password Submit Error Details:", err?.errors || err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Invalid verification code or password. Please try again.";
      setResetErrorMessage(msg);
    } finally {
      setIsResetLoading(false);
    }
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

        {/* Screen Title & Subtitle */}
        <View className="flex-1">
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </Text>
          <Text className="text-base text-gray-500 mt-2 mb-8">
            Sign in to your account
          </Text>

          {/* Form Controls */}
          <View className="w-full">
            {/* Email Field */}
            <View className="mb-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 shadow-sm"
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password Field */}
            <View className="mb-2">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="w-full relative">
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-4 pr-12 py-3.5 text-base text-gray-900 shadow-sm"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Forgot Password Link */}
            <View className="mb-4 flex-row justify-end">
              <TouchableOpacity
                onPress={() => {
                  const currentEmail = control._formValues?.email;
                  openResetModal(typeof currentEmail === "string" ? currentEmail : undefined);
                }}
                className="py-1"
              >
                <Text className="text-blue-600 text-sm font-semibold">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message Display */}
            {errorMessage && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex-row items-center">
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text className="text-red-600 text-sm font-medium flex-1 ml-2">
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSignInSubmit)}
              disabled={isLoading}
              className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-2xl items-center justify-center mt-2 shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Navigation to Sign Up */}
          <View className="flex-row items-center justify-center mt-8 pb-4">
            <Text className="text-gray-500 text-base font-medium">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text className="text-blue-600 text-base font-bold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Reset Password Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="slide"
        onRequestClose={() => !isResetLoading && setShowResetModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl p-6 shadow-2xl border-t border-gray-100 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  {resetStep === 1 ? "Reset Password" : "Enter Verification Code"}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {resetStep === 1
                    ? "Enter your email address to receive a code"
                    : `Code sent to ${resetEmail}`}
                </Text>
              </View>
              <TouchableOpacity
                disabled={isResetLoading}
                onPress={() => setShowResetModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Error Message inside Modal */}
            {resetErrorMessage && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex-row items-center">
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text className="text-red-600 text-sm font-medium flex-1 ml-2">
                  {resetErrorMessage}
                </Text>
              </View>
            )}

            {/* STEP 1: Enter Email */}
            {resetStep === 1 ? (
              <View>
                <View className="mb-4">
                  <Controller
                    control={resetEmailControl}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Registered Email"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
                      />
                    )}
                  />
                  {resetEmailErrors.email && (
                    <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                      {resetEmailErrors.email.message}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleResetEmailSubmit(onRequestResetCode)}
                  disabled={isResetLoading}
                  className="w-full bg-blue-600 py-4 rounded-2xl items-center justify-center mt-2"
                >
                  {isResetLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-base font-bold">
                      Send Reset Code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* STEP 2: Enter Code & New Password */
              <View>
                {/* Verification Code */}
                <View className="mb-4">
                  <Controller
                    control={resetSubmitControl}
                    name="code"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Verification Code"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
                      />
                    )}
                  />
                  {resetSubmitErrors.code && (
                    <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                      {resetSubmitErrors.code.message}
                    </Text>
                  )}
                </View>

                {/* New Password */}
                <View className="mb-4 relative">
                  <Controller
                    control={resetSubmitControl}
                    name="newPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="w-full relative">
                        <TextInput
                          placeholder="New Password (min 8 characters)"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={!showNewPassword}
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-12 py-3.5 text-base text-gray-900"
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-3.5"
                        >
                          <Ionicons
                            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {resetSubmitErrors.newPassword && (
                    <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                      {resetSubmitErrors.newPassword.message}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleResetSubmit(onResetPasswordSubmit)}
                  disabled={isResetLoading}
                  className="w-full bg-blue-600 py-4 rounded-2xl items-center justify-center mt-2"
                >
                  {isResetLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-base font-bold">
                      Reset Password & Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setResetStep(1);
                    setResetErrorMessage(null);
                  }}
                  disabled={isResetLoading}
                  className="w-full py-3 items-center mt-2"
                >
                  <Text className="text-gray-500 text-sm font-semibold">
                    ← Back to Email
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}
