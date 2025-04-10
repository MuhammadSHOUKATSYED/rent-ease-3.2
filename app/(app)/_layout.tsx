import { Stack } from "expo-router";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export const unstable_settings = {
	initialRouteName: "(root)",
};

export default function AppLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(protected)" />
			<Stack.Screen name="welcome" />
			<Stack.Screen
				name="sign-up"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Sign Up",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="sign-in"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Sign In",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="modal"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Modal",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="motors"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Motors",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="property"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Property",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="mobiles"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Mobiles",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="vehicles"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Vehicles",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="electronics"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Electronics",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="fashion"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Fashion",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="appliances"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Appliances",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="decoration"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Decoration",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="verification"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Verification",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>			
			<Stack.Screen
			name="chatbot"
			options={{
				presentation: "modal",
				headerShown: true,
				headerTitle: "Assitant Chatbot",
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
			}}
		/>			
		<Stack.Screen
			name="donation"
			options={{
				presentation: "modal",
				headerShown: true,
				headerTitle: "Donation Center",
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
			}}
		/>			
	<Stack.Screen
			name="digitalWallet"
			options={{
				presentation: "modal",
				headerShown: true,
				headerTitle: "Digital Wallet",
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
			}}
		/>			
		<Stack.Screen
				name="trackHistory"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Track Product History",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>			
		<Stack.Screen
			name="reportDamage"
			options={{
				presentation: "modal",
				headerShown: true,
				headerTitle: "Report Any Damage",
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
			}}
		/>			
		<Stack.Screen
				name="getRewards"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Get Rewards",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>			
		<Stack.Screen
				name="getMultilingualSupport"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Get Multilingual Support",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
			<Stack.Screen
				name="sharedOwnership"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Shared Ownership",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>			
		<Stack.Screen
			name="editProfile"
			options={{
				presentation: "modal",
				headerShown: true,
				headerTitle: "View and Edit Profile",
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
			}}
		/>			
		<Stack.Screen
		name="favorites"
		options={{
			presentation: "modal",
			headerShown: true,
			headerTitle: "Favorites",
			headerStyle: {
				backgroundColor:
					colorScheme === "dark"
						? colors.dark.background
						: colors.light.background,
			},
			headerTintColor:
				colorScheme === "dark"
					? colors.dark.foreground
					: colors.light.foreground,
		}}
	/>			
			<Stack.Screen
			name="publicView"
			options={{
				presentation: "modal",
				headerShown: true,
				headerTitle: "Public View",
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
			}}
		/>			
			<Stack.Screen
				name="trackOrder"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Track Order",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>		
		<Stack.Screen
		name="settings"
		options={{
			presentation: "modal",
			headerShown: true,
			headerTitle: "Settings",
			headerStyle: {
				backgroundColor:
					colorScheme === "dark"
						? colors.dark.background
						: colors.light.background,
			},
			headerTintColor:
				colorScheme === "dark"
					? colors.dark.foreground
					: colors.light.foreground,
		}}
	/>			
	<Stack.Screen
				name="helpSupport"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Help Support",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
				<Stack.Screen
				name="users"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Explore People",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>
				<Stack.Screen
				name="donationMenu"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Donation Center",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
			/>				
			<Stack.Screen
			name="myDonations"
			options={{
				presentation: "modal",
				headerShown: true,
				headerTitle: "My Donations",
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
			}}
		/>
		</Stack>
	);
}
