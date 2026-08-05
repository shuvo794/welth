import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  // Dynamic bottom margin respecting phone safe area (system navbar / gesture bar)
  const bottomMargin = Math.max(insets.bottom + 6, 12);

  const getTabIcon = (
    routeName: string,
    isFocused: boolean
  ): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case "index":
        return isFocused ? "home" : "home-outline";
      case "transactions":
        return isFocused ? "receipt" : "receipt-outline";
      case "add":
        return "add";
      case "assistant":
        return isFocused ? "sparkles" : "sparkles-outline";
      case "profile":
        return isFocused ? "person" : "person-outline";
      default:
        return isFocused ? "square" : "square-outline";
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomMargin,
        left: 16,
        right: 16,
        backgroundColor: "#0F172A",
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#1E293B",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const rawLabel =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const label = rawLabel === "index" ? "Home" : rawLabel;
        const isFocused = state.index === index;
        const isAddBtn = route.name === "add";

        const onPress = () => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const iconName = getTabIcon(route.name, isFocused);

        if (isAddBtn) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || "Add transaction"}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                top: -14,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#2563EB",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 8,
                  borderWidth: 3,
                  borderColor: "#0F172A",
                }}
              >
                <Ionicons name="add" size={30} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 16,
                backgroundColor: isFocused ? "rgba(56, 189, 248, 0.12)" : "transparent",
              }}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? "#38BDF8" : "#94A3B8"}
              />
            </View>
            <Text
              numberOfLines={1}
              style={{
                color: isFocused ? "#38BDF8" : "#94A3B8",
                fontSize: 10,
                fontWeight: isFocused ? "700" : "500",
                marginTop: 2,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Assistant",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

