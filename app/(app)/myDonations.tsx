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
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";

export default function Donations() {
  const router = useRouter();
  const { user } = useSupabase();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isViewModalVisible, setViewModalVisible] = useState(false);
  const [editedDonation, setEditedDonation] = useState({});
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("donations")
          .select("*")
          .eq("profile_id", userId); // Adjusted to use profile_id

        if (error) {
          console.error("Error fetching donations:", error.message);
        } else {
          setDonations(data || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [userId]);

  const openEditModal = (donation) => {
    setEditedDonation(donation);
    setEditModalVisible(true);
  };

  const openViewModal = (donation) => {
    setSelectedDonation(donation);
    setViewModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      const { error } = await supabase
        .from("donations")
        .update(editedDonation)
        .eq("id", editedDonation.id);

      if (error) {
        console.error("Error updating donation:", error.message);
        Alert.alert("Error", "Unable to update the donation.");
      } else {
        setDonations((prev) =>
          prev.map((item) =>
            item.id === editedDonation.id ? { ...item, ...editedDonation } : item
          )
        );
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleActionMenuSelect = (action) => {
    // Handle actions like Cancel, Deactivate, or Mark as Sold
    console.log(action);
    setActionMenuVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9455f4" />
        </View>
      ) : donations.length === 0 ? (
        <ScrollView contentContainerStyle={styles.centered}>
          <AntDesign name="shoppingcart" size={80} color="black" />
          <Text className="text-xl font-semibold mt-4">You don't have any donations yet?</Text>
          <Text className="text-center mt-2 text-gray-600">
            Start donating your items now!
          </Text>
          <TouchableOpacity
            className="bg-[#9455f4] px-6 py-3 rounded-full mt-5"
            onPress={() => router.push("/donation")}
          >
            <Text className="text-white font-semibold">Add your donations now</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={{ padding: 16 }}>
          {donations.map((donation) => (
            <TouchableOpacity key={donation.id} onPress={() => openViewModal(donation)}>
              <View style={styles.listingCard}>
                <View style={styles.listingContent}>
                  <Image
                    source={{ uri: donation.picture1 }} // Using picture1 URL
                    style={styles.listingImage}
                    resizeMode="cover"
                  />
                  <View style={styles.listingText}>
                    <Text style={styles.listingTitle}>{donation.name}</Text>
                    {/* Adjusted to show the "category" or other relevant fields */}
                    <Text style={styles.listingDetail}>
                      Address: {donation.address}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="more-vert"
                    size={24}
                    color="black"
                    style={styles.moreIcon}
                    onPress={() => setActionMenuVisible(true)}
                  />
                </View>
                <View style={styles.actionButtons} className="justify-between"> 
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(donation)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  {/* Status display */}
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{donation.status || "Available"}</Text>
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
            value={editedDonation.name}
            onChangeText={(text) =>
              setEditedDonation((prev) => ({ ...prev, name: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={editedDonation.description}
            onChangeText={(text) =>
              setEditedDonation((prev) => ({ ...prev, description: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={editedDonation.address}
            onChangeText={(text) =>
              setEditedDonation((prev) => ({ ...prev, address: text }))
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

      {/* Action Menu (Centered Picker) */}
      {actionMenuVisible && (
        <View style={styles.modalBackground}>
          <View style={styles.actionMenu}>
            <TouchableOpacity onPress={() => handleActionMenuSelect('Deactivate')}>
              <Text style={styles.actionMenuItem}>Deactivate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleActionMenuSelect('Mark as Sold')}>
              <Text style={styles.actionMenuItem}>Mark as Sold</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActionMenuVisible(false)}>
              <Text style={styles.actionMenuItem}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginTop: 20,
  },
  headerText: { fontSize: 25, fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { width: "80%", borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 16 },
  saveButton: { backgroundColor: "#9455f4", padding: 12, borderRadius: 8 },
  saveButtonText: { color: "white", fontWeight: "bold" },
  cancelButton: { marginTop: 16 },
  cancelButtonText: { color: "#9455f4" },
  listingCard: { marginBottom: 16, padding: 16, borderWidth: 1, borderRadius: 8 },
  listingContent: { flexDirection: "row", alignItems: "center" },
  listingImage: { width: 60, height: 60, borderRadius: 8 },
  listingText: { marginLeft: 10, flex: 1 },
  listingTitle: { fontSize: 18, fontWeight: "bold" },
  listingDetail: { marginTop: 4 },
  statusContainer: {
    backgroundColor: "#E9D9FD",
    padding: 12,
    borderRadius: 8,
    width: "48%"
  },
  statusText: {
    textAlign: "center", color: '#311465', fontWeight: "bold"
  },
  actionButtons: { flexDirection: "row", marginTop: 8 },
  actionButton: {
    backgroundColor: '#9455f4',
    padding: 12,
    borderRadius: 8,
    width: "48%"
  },
  actionButtonText: { textAlign: "center", color: 'white', fontWeight: "bold"},
  moreIcon: {
    marginLeft: 10,
    marginTop: 10,
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  actionMenu: {
    backgroundColor: "white",
    width: "80%",
    padding: 16,
    borderRadius: 8,
    elevation: 5,
  },
  actionMenuItem: {
    padding: 10,
    fontSize: 16,
    textAlign: "center",
  },
});
