import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  Linking
} from "react-native";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useStripe } from '@stripe/stripe-react-native';

export default function Electronics() {
  const router = useRouter();
  const { user } = useSupabase();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isBuyModalVisible, setBuyModalVisible] = useState(false);
  const [isViewModalVisible, setViewModalVisible] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [clientSecret, setClientSecret] = useState(null);
  const [ploading, setPloading] = useState(false);
  const [amount, setAmount] = useState(1000); 
  const [userRating, setUserRating] = useState(null);


  const updateRatingInDatabase = async (listingId, rating) => {
    const ratingField = `${rating}_star`; // dynamic field based on the rating (e.g., 5_star, 4_star, etc.)

    // Step 1: Fetch the current rating count for the specific field
    const { data, error: fetchError } = await supabase
        .from('product_listings')
        .select(ratingField)
        .eq('id', listingId)
        .single(); // Retrieve a single row

    if (fetchError) {
        throw new Error(fetchError.message); // Throw error if fetching current rating fails
    }

    // Step 2: Calculate the new rating count
    const currentRating = data[ratingField] || 0; // Default to 0 if no rating exists
    const newRating = currentRating + 1;

    // Step 3: Update the rating in the database
    const { error: updateError } = await supabase
        .from('product_listings')
        .update({
            [ratingField]: newRating, // Set the new rating count
        })
        .eq('id', listingId);

    if (updateError) {
        throw new Error(updateError.message); // Throw error if updating rating fails
    }

    return { message: 'Rating updated successfully' };
};


  // Fetch client secret from your backend
  const fetchPaymentIntentClientSecret = async () => {

    const response = await fetch('http://192.168.100.20:3000/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in cents (e.g., $10.00)
        currency: 'usd',
      }),
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  // Initialize PaymentSheet with clientSecret
  const initializePaymentSheet = async () => {
    try {
      const secret = await fetchPaymentIntentClientSecret();
      setClientSecret(secret);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: secret,
        merchantDisplayName: 'Your Merchant Name',
        // Optional: add Apple Pay, Google Pay, etc.
      });

      if (error) {
        console.log('Error initializing payment sheet:', error);
        return;
      }
    } catch (error) {
      console.log('Error initializing payment sheet:', error);
    }
  };

  // Present the PaymentSheet
  const handlePayment = async () => {
    if (!clientSecret) {
      Alert.alert('Payment error', 'Please try again');
      return;
    }

    setPloading(true);

    const { error, paymentIntent } = await presentPaymentSheet();

    if (error) {
      Alert.alert('Payment failed', error.message);
    } else if (paymentIntent) {
      Alert.alert('Success', 'Payment confirmed!');
    }

    setPloading(false);
  };

/*
  useEffect(() => {
    if (!clientSecret) {
      initializePaymentSheet();
    }
  }, [clientSecret]);
*/

  const userId = user?.id;

  useEffect(() => {
	const fetchListings = async () => {
	  setLoading(true);
	  try {
		const { data, error } = await supabase
		  .from("product_listings")
		  .select("*, owner1 (phone, name), owner2 (name)")
		  .eq("category", "Electronics")
		  .or(`owner1.neq.${userId},owner2.neq.${userId}`) // Exclude if either owner1 or owner2 is the logged-in user
		  .order("created_at", { ascending: false });
  
		if (error) {
		  console.error("Error fetching listings:", error.message);
		} else {
		  setListings(data || []);
		}
	  } catch (error) {
		console.error("Unexpected error:", error);
	  } finally {
		setLoading(false);
	  }
	};
  
	if (userId) {
	  fetchListings();
	}
  }, [userId]);  
  
  const openBuyModal = (listing) => {
    setBuyModalVisible(true);
  };

  const openViewModal = (listing) => {
    setSelectedListing(listing);
    setViewModalVisible(true);
  };

  const handleSMS = (phoneNumber) => {
    const url = `https://wa.me/${phoneNumber}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open WhatsApp"));
  };

  const handleCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot make a call"));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9455f4" />
        </View>
      ) : listings.length === 0 ? (
        <ScrollView contentContainerStyle = {styles.centered}>
        <AntDesign name="shoppingcart" size={80} color="black" />
          <Text className="text-xl font-semibold mt-4">No rentals available in this category!</Text>
          <Text className="text-center mt-2 text-gray-600">
            You can find other items!
          </Text>
          <TouchableOpacity
            className="bg-[#9455f4] px-6 py-3 rounded-full mt-5"
			onPress={() => router.push("/(protected)/")}
          >
            <Text className="text-white font-semibold"> Find exciting rentals now</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}  style={{ padding: 16, marginBottom: 15 }}>
          {listings.map((listing) => (
            <TouchableOpacity key={listing.id} onPress={() => openViewModal(listing)}>
              <View style={styles.listingCard}>
                <View style={styles.listingContent}>
                  <Image
                    source={{ uri: listing.picture1_url }}
                    style={styles.listingImage}
                    resizeMode="cover"
                  />
                  <View style={styles.listingText}>
                    <Text style={styles.listingTitle}>{listing.name}</Text>
                    <Text style={styles.listingDetail}>
                      📍 {listing.address}
                    </Text>

                    <Text style={styles.listingDetail}>
                        Rs: {listing.price_per_hour} / hour
                    </Text>
                  </View>
                </View>
                <View style={styles.actionButtons} className="justify-between">
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={async () => {
                      setAmount(listing.price_per_hour); // Set the amount dynamically
                      await initializePaymentSheet().then(async () =>{
                        await handlePayment(); // Call the payment handler
                      });
                    }}
                    disabled={ploading} 
                  >
                    <Text style={styles.actionButtonText}>Buy Now</Text>
                  </TouchableOpacity>
                  {/* Status display */}
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{listing.status || "Available"}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

{/* View Modal */}
<Modal
  visible={isViewModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setViewModalVisible(false)}
>
  <View style={styles.modalContainer}>
    {selectedListing && (
      <>
        {/* Close Button (X at Extreme Top-Left of the Page) */}
        <TouchableOpacity onPress={() => setViewModalVisible(false)} style = {styles.arrowButton}>
        <MaterialIcons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} className="mt-12">
          {/* Display up to 4 images */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[selectedListing.picture1_url, selectedListing.picture2_url, selectedListing.picture3_url, selectedListing.picture4_url]
              .filter(Boolean) // Ensure only non-null images are displayed
              .map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.modalImage} />
              ))}
          </ScrollView>

          {/* Tabular View for Details */}
          <View style={styles.detailsTable}>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Name</Text>
              <Text style={styles.cell}>{selectedListing.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Address</Text>
              <Text style={styles.cell}>{selectedListing.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Price</Text>
              <Text style={styles.cell}>Rs. {selectedListing.price_per_hour} / hour</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Description</Text>
              <Text style={styles.cell}>{selectedListing.description}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Owner 1</Text>
              <Text style={styles.cell}>{selectedListing.owner1?.name || "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Owner 2</Text>
              <Text style={styles.cell}>{selectedListing.owner2?.name || "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Status</Text>
              <Text style={[styles.cell, { color: selectedListing.status === "Sold" ? "red" : "green" }]}>
                {selectedListing.status || "Available"}
              </Text>
            </View>
          </View>
                  {/* New Section: Ratings Breakdown */}
                  <View style={[styles.row, { marginTop: 10 }]}>
                    <View style={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map((star) => {
                        const starCount = selectedListing?.[`${star}_star`] || 0;

                        return (
                          <View key={star} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                            <Text style={{ width: 30 }}>{star}★</Text>
                            <View style={{ flex: 1, height: 6, backgroundColor: '#ccc', marginHorizontal: 5, borderRadius: 3 }}>
                              <View
                                style={{
                                  width: `${(starCount / Math.max(starCount, 1)) * 100}%`,
                                  backgroundColor: '#fcb900',
                                  height: '100%',
                                  borderRadius: 3,
                                }}
                              />
                            </View>
                            <Text style={{ width: 30 }}>{starCount}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* New Section: Rate this Product */}
                  <View style={[styles.row, { marginTop: 20 }]}>
                      {/* Display the selected rating */}
                      <Text style={{ marginTop: 13 }}>Your Rating: {userRating || '0'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setUserRating(star)} // Set rating when a star is pressed
                          style={{ marginHorizontal: 5 }}
                        >
                          <Text style={{ fontSize: 30, color: userRating >= star ? '#fcb900' : '#ccc' }}>
                            ★
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {/* New Section: Submit Rating */}
                  <View style={[styles.row, { marginTop: 20 }]}>
                    <TouchableOpacity
                      onPress={async () => {
                        if (userRating) {
                          try {
                            // Trigger function to update rating in the database
                            await updateRatingInDatabase(selectedListing.id, userRating);
                            Alert.alert("Success", "Your rating has been submitted!");
                          } catch (error) {
                            console.error("Error updating rating:", error);
                            Alert.alert("Error", "Failed to submit rating. Please try again.");
                          }
                        } else {
                          Alert.alert("Error", "Please select a rating before submitting.");
                        }
                      }}
                      style={styles.optionButton}
                    >
                      <Text style={{ fontSize: 16, color: "black"}}>Rate It</Text>
                    </TouchableOpacity>
                  </View>
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.iconButton}>
			<MaterialCommunityIcons name="email-outline" size={24} color="black" onPress={() => handleSMS(selectedListing.owner1?.phone)} />
              <Text style={styles.iconButtonText}>SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
			<AntDesign name="phone" size={24} color="black" onPress={() => handleCall(selectedListing.owner1?.phone)}/>
              <Text style={styles.iconButtonText}>Phone</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
			<Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
              <Text style={styles.iconButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    )}
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  arrowButton: {
    position: "absolute", 
    top: 10,  // Adjust as needed
    left: 10, // Keeps it aligned to the left
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.1)", // Optional for better visibility
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    margin: 10,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },

  input: {
    width: "90%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },

  saveButton: {
    backgroundColor: "#9455f4",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    marginTop: 10,
  },

  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  cancelButton: {
    marginTop: 16,
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  listingCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ddd",
    backgroundColor: "#fff"
  },

  listingContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  listingImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },

  listingText: {
    marginLeft: 12,
    flex: 1,
  },

  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  listingDetail: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },

  statusContainer: {
    backgroundColor: "#E9D9FD",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  statusText: {
    textAlign: "center",
    color: "#311465",
    fontWeight: "bold",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  actionButton: {
    backgroundColor: "#9455f4",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  actionButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },

  moreIcon: {
    marginLeft: 10,
    marginTop: 10,
  },

  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  modalImage: {
    width: 300,
    height: 300,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  closeButtonText: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },

  detailsTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 12,
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    backgroundColor: "white"
  },

  cellHeader: {
    flex: 2,
    fontWeight: "bold",
    color: "#333",
    fontSize: 16,
  },

  cell: {
    flex: 2,
    color: "#555",
    fontSize: 15,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 50,
    marginBottom: 20
  },

  iconButton: {
    alignItems: "center",
    backgroundColor: "#E9D9FD",
    padding: 10,
    borderRadius: 10,
    elevation: 1, // Adds a subtle shadow
    width: 80
  },

  iconButtonText: {
    fontSize: 13,
    marginTop: 5,
    marginBottom: 5,
    color: "#333",
    fontWeight: "bold",
  },
  optionButton: {
    backgroundColor: "#E9D9FD",
    padding: 12,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#311465",
  },
});
