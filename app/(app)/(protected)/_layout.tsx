import { Tabs } from "expo-router";
import React from "react";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { AntDesign, Feather } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProtectedLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
	 
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: true,  // Show labels below icons
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarLabel: "Home",
					tabBarIcon: ({ color, size}) => (
						<Feather name="home" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="chats"
				options={{
					title: "Chats",
					tabBarLabel: "Chats",
					tabBarIcon: ({ color, size }) => (
						<AntDesign name="message1" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="rent"
				options={{
					title: "Sell",
					tabBarLabel: "Add",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="add-circle-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="listings"
				options={{
					title: "Listings",
					tabBarLabel: "My Listings",
					tabBarIcon: ({ color, size }) => (
						<AntDesign name="appstore-o" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarLabel: "Profile",
					tabBarIcon: ({ color, size }) => (
						<AntDesign name="user" color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}