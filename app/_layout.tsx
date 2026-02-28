import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafetyProvider } from "@/providers/SafetyProvider";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Colors } from "@/constants/colors";
import "@/config/firebase";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, loading, hasViewedOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // ensure segments are ready before trying to process
    if (!segments.length) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';

    // Routing Logic 
    if (!hasViewedOnboarding && !inOnboarding) {
      router.replace('/onboarding' as any);
    } else if (hasViewedOnboarding && !user && !inAuthGroup) {
      router.replace('/auth' as any);
    } else if (hasViewedOnboarding && user && !inTabsGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [user, loading, hasViewedOnboarding, segments]);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: Colors.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <SafetyProvider>
            <RootLayoutNav />
          </SafetyProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
