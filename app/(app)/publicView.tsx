import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { H1, Muted } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { Image } from "@/components/image";

export default function PublicView() {
  const { user } = useSupabase();
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    profilePicture: "",
  });
  const [listings, setListings] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoadingProfile(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("name, phone, address, profilePicture")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Failed to fetch profile.");
        console.error("Profile Fetch Error:", error.message);
      } else {
        setProfile({
          name: data?.name || "No name",
          phone: data?.phone || "No phone number",
          address: data?.address || "No address",
          profilePicture: data?.profilePicture || "",
        });
      }

      setLoadingProfile(false);
    };

    const fetchListings = async () => {
      if (!user?.id) return;
      setLoadingListings(true);

      const { data, error } = await supabase
        .from("product_listings")
        .select("*, owner2 (name)")
        .or(`owner1.eq.${user.id}, owner2.eq.${user.id}`) // Include if either owner1 or owner2 is the logged-in user

      if (error) {
        console.error("Error fetching listings:", error.message);
      } else {
        setListings(data || []);
      }

      setLoadingListings(false);
    };

    fetchProfile();
    fetchListings();
  }, [user?.id]);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color="#6200ea" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {/* Profile Picture */}
            {profile.profilePicture ? (
              <Image
                source={{ uri: profile.profilePicture }}
                className="w-40 h-40 rounded-full mb-4"
              />
            ) : (
              <View style={styles.defaultProfilePicture}>
                <Text style={styles.defaultProfileText}>
                  {profile.name.charAt(0)}
                </Text>
              </View>
            )}
            {/* User Information */}
            <H1 className="text-center">{profile.name}</H1>
            <Muted className="text-center">📍 {profile.address}</Muted>
            <Muted className="text-center">📞 {profile.phone}</Muted>
          </>
        )}
      </View>
      {/* Listings Section */}
      <View style={styles.listingsContainer}>
        <Text style={styles.sectionTitle}>Your Listings</Text>

        {loadingListings ? (
          <ActivityIndicator size="large" color="#6200ea" />
        ) : listings.length === 0 ? (
          <Text style={styles.noListingsText}>No listings available.</Text>
        ) : (
          listings.map((listing) => (
            <View key={listing.id} style={styles.listingCard}>
              <Image
                source={{ uri: listing.picture1_url }}
                style={styles.listingImage}
                className="mb-4"
              />
              <Text style={styles.listingTitle}>{listing.name}</Text>
              <Muted>Status: {listing.status}</Muted>
              <Muted>Owner 2: {listing.owner2?.name || "N/A" }</Muted>
              <Muted>📍  {listing.address}</Muted>
              <Muted>💰 Price: Rs {listing.price_per_hour} / hour</Muted>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  profileContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    margin: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  defaultProfilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  defaultProfileText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#555",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  listingsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noListingsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  listingCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listingImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 }
});
