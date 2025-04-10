import "../global.css";

import { Slot } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { StripeProvider } from '@stripe/stripe-react-native';

export default function AppLayout() {
	return (
		<StripeProvider
		publishableKey="pk_test_51RBifF2ZAunXdfzq6goE1330NiB8oicUis9Et9VWGDfE3ykthR2jSK9sCB872QhCN565muy9WLyyzcEDjzzQ9up900k8MZwrct"
		merchantIdentifier="merchant.com.yourapp" // For Apple Pay
	    >
		<SupabaseProvider>
			<Slot />
		</SupabaseProvider>
		</StripeProvider>
	);
}
