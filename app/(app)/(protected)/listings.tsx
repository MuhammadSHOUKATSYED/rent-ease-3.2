import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Listings() {
  const router = useRouter();
  const { user } = useSupabase();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isViewModalVisible, setViewModalVisible] = useState(false);
  const [editedListing, setEditedListing] = useState({});

  const userId = user?.id;

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {

        const { data, error } = await supabase
        .from("product_listings")
        .select("*, owner2 (name)")
        .or(`owner1.eq.${userId}, owner2.eq.${userId}`) // Include if either owner1 or owner2 is the logged-in user

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

    fetchListings();
  }, [userId]);

  const openEditModal = (listing) => {
    setEditedListing(listing);
    setEditModalVisible(true);
  };

  const openViewModal = (listing) => {
    setSelectedListing(listing);
    setViewModalVisible(true);
  };
  const handleEditSave = async () => {
    console.log("Updating listing with ID:", editedListing.id); // Debug log
  
    if (!editedListing.id) {
      Alert.alert("Error", "Invalid listing ID");
      return;
    }
  
    try {
      const { error } = await supabase
        .from("product_listings")
        .update({
          name: editedListing.name,
          price_per_hour: editedListing.price_per_hour,
          description: editedListing.description,
          address: editedListing.address,
        })
        .eq("id", editedListing.id);
  
      if (error) {
        console.error("Error updating listing:", error.message);
        Alert.alert("Error", "Unable to update the listing.");
      } else {
        setListings((prev) =>
          prev.map((item) =>
            item.id === editedListing.id ? { ...item, ...editedListing } : item
          )
        );
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };
  const handleDelete = async (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const { error } = await supabase.from("product_listings").delete().eq("id", id);
          if (error) {
            Alert.alert("Error", "Could not delete listing");
          } else {
            setListings((prev) => prev.filter((item) => item.id !== id));
            setViewModalVisible(false);
          }
        },
      },
    ]);
  };
  
  const handleMarkAsSold = async (id) => {
    const { error } = await supabase.from("product_listings").update({ status: "Sold" }).eq("id", id);
    if (!error) {
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Sold" } : item))
      );
    }
  };
  
  const handleMarkAsAvailable = async (id) => {
    const { error } = await supabase.from("product_listings").update({ status: "Available" }).eq("id", id);
    if (!error) {
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Available" } : item))
      );
    }
  };  
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Listings</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9455f4" />
        </View>
      ) : listings.length === 0 ? (
        <ScrollView contentContainerStyle = {styles.centered}>
        <AntDesign name="shoppingcart" size={80} color="black" />
          <Text className="text-xl font-semibold mt-4">You don't have rented anything yet?</Text>
          <Text className="text-center mt-2 text-gray-600">
            Start renting your items from now!
          </Text>
          <TouchableOpacity
            className="bg-[#9455f4] px-6 py-3 rounded-full mt-5"
            onPress={() => router.push("/(protected)/rent")}
          >
            <Text className="text-white font-semibold">Add your rentals now</Text>
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
                    onPress={() => openEditModal(listing)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
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

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={editedListing.name}
            onChangeText={(text) =>
              setEditedListing((prev) => ({ ...prev, name: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Price per Hour"
            keyboardType="numeric"
            value={String(editedListing.price_per_hour)}
            onChangeText={(text) =>
              setEditedListing((prev) => ({ ...prev, price_per_hour: Number(text) }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={editedListing.description}
            onChangeText={(text) =>
              setEditedListing((prev) => ({ ...prev, description: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={editedListing.address}
            onChangeText={(text) =>
              setEditedListing((prev) => ({ ...prev, address: text }))
            }
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleEditSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setEditModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(selectedListing.id)}>
              <AntDesign name="delete" size={24} color="red" />
              <Text style={styles.iconButtonText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => handleMarkAsSold(selectedListing.id)}>
              <AntDesign name="checkcircle" size={24} color="green" />
              <Text style={styles.iconButtonText}>Mark as Sold</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => handleMarkAsAvailable(selectedListing.id)}>
              <AntDesign name="sync" size={24} color="blue" />
              <Text style={styles.iconButtonText}>Available</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    )}
  </View>
</Modal>

    </SafeAreaView>
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
    color: "#311465",
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
    color: "#9455f4",
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
    marginBottom: 10,
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
});
