import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 25,
        left: 50,
        right: 50,
        backgroundColor: "#6B7280",
        borderRadius: 35,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingVertical: 6,
        paddingHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
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

        const onPress = () => {
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

        let iconName: keyof typeof Ionicons.glyphMap = "home";
        if (route.name === "index") {
          iconName = isFocused ? "home" : "home-outline";
        } else if (route.name === "profile") {
          iconName = isFocused ? "person" : "person-outline";
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
              paddingVertical: 8,
              borderRadius: 25,
              backgroundColor: isFocused ? "#374151" : "transparent",
            }}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? "#38BDF8" : "#E5E7EB"}
            />
            <Text
              style={{
                color: isFocused ? "#38BDF8" : "#E5E7EB",
                fontSize: 11,
                fontWeight: isFocused ? "600" : "400",
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
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

