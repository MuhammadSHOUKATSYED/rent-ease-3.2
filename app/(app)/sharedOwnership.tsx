import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/config/supabase"; // Make sure your Supabase config is set up
import { useSupabase } from "@/context/supabase-provider"; // Assuming this is your context for user state

export default function SharedOwnership() {
  const { user } = useSupabase(); // Get logged-in user from context
  const loggedInUserId = user?.id;

  const [sharedOwners, setSharedOwners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loggedInUserId) return;

    const fetchSharedOwnershipData = async () => {
      setLoading(true);
      try {
        // Fetch shared ownership (accepted requests)
        const { data: owners, error: ownersError } = await supabase
          .from("shared_ownership")
          .select("user_id1, user_id2, status")
          .or(`user_id1.eq.${loggedInUserId},user_id2.eq.${loggedInUserId}`)
          .eq("status", "accepted");

        if (ownersError) throw ownersError;

        const ownerIds = owners.map((o) =>
          o.user_id1 === loggedInUserId ? o.user_id2 : o.user_id1
        );

        const { data: ownerProfiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, profilePicture, phone, address")
          .in("id", ownerIds);

        if (profileError) throw profileError;
        setSharedOwners(ownerProfiles);

        // Fetch pending requests
        const { data: requestData, error: requestError } = await supabase
          .from("shared_ownership")
          .select("user_id1, user_id2, status")
          .eq("user_id2", loggedInUserId)
          .eq("status", "pending");

        if (requestError) throw requestError;

        const requestIds = requestData.map((r) => r.user_id1);
        const { data: requestProfiles, error: requestProfileError } = await supabase
          .from("profiles")
          .select("id, name, profilePicture, phone, address")
          .in("id", requestIds);

        if (requestProfileError) throw requestProfileError;
        setRequests(requestProfiles);

        // Fetch all users (exclude logged-in user, shared owners, and requests)
        const allIdsToExclude = [...ownerIds, ...requestIds, loggedInUserId];
        const { data: allUsers, error: allUsersError } = await supabase
          .from("profiles")
          .select("id, name, profilePicture, phone, address")
          .not("id", "in", `(${allIdsToExclude.join(",")})`);

        if (allUsersError) throw allUsersError;
        setFilteredUsers(allUsers);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedOwnershipData();
  }, [loggedInUserId]);

  const handleAcceptRequest = async (requesterId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("shared_ownership")
        .update({ status: "accepted" })
        .eq("user_id1", requesterId)
        .eq("user_id2", loggedInUserId)
        .eq("status", "pending");

      if (error) throw error;
      setRequests((prev) => prev.filter((r) => r.id !== requesterId));
      const acceptedUser = requests.find((r) => r.id === requesterId);
      setSharedOwners((prev) => [...prev, acceptedUser]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = async (requesterId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("shared_ownership")
        .update({ status: "declined" })
        .eq("user_id1", requesterId)
        .eq("user_id2", loggedInUserId)
        .eq("status", "pending");

      if (error) throw error;
      setRequests((prev) => prev.filter((r) => r.id !== requesterId));
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("shared_ownership").insert({
        user_id1: loggedInUserId,
        user_id2: receiverId,
        status: "pending",
      });

      if (error) throw error;
      setFilteredUsers((prev) => prev.filter((u) => u.id !== receiverId));
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOwner = async (ownerId) => {
    try {
      setLoading(true);
  
      // Update the status to 'removed' for the matching row
      const { error } = await supabase
        .from("shared_ownership")
        .update({ status: "removed" })
        .or(
          `and(user_id1.eq.${loggedInUserId},user_id2.eq.${ownerId},status.eq.accepted),and(user_id2.eq.${loggedInUserId},user_id1.eq.${ownerId},status.eq.accepted)`
        );
  
      if (error) throw error;
  
      // Update the shared owners locally by removing the owner with the removed status
      setSharedOwners((prev) => prev.filter((o) => o.id !== ownerId));
      Alert.alert("Success", "Shared ownership removed with this person");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setFilteredUsers((prev) =>
        prev.filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
      );
    } else {
      setFilteredUsers(filteredUsers);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f9fafc", marginVertical: 20 }}>

      {/* Shared Owners */}
      <Text style={styles.sectionTitle}>Shared Owners</Text>
	  {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {sharedOwners.length === 0 ? (
        <Text style={styles.noDataText}>No shared owners.</Text>
      ) : (
        sharedOwners.map((owner) => (
          <View key={owner.id} style={styles.card}>
            <Image
              source={owner.profilePicture ? { uri: owner.profilePicture } : require("@/assets/Logo.png")}
              style={styles.profilePicture}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{owner.name}</Text>
              <Text style={styles.cardDetail}>Phone: {owner.phone}</Text>
              <Text style={styles.cardDetail}>Address: {owner.address}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveOwner(owner.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Requests */}
      <Text style={styles.sectionTitle}>Requests</Text>
      {requests.length === 0 ? (
        <Text style={styles.noDataText}>No pending requests.</Text>
      ) : (
        requests.map((request) => (
          <View key={request.id} style={styles.card}>
            <Image
              source={request.profilePicture ? { uri: request.profilePicture } : require("@/assets/Logo.png")}
              style={styles.profilePicture}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{request.name}</Text>
              <Text style={styles.cardDetail}>Phone: {request.phone}</Text>
              <Text style={styles.cardDetail}>Address: {request.address}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDeclineRequest(request.id)}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      {/* Search Users */}
      <Text style={styles.sectionTitle}>Search Users</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {filteredUsers.length === 0 ? (
        <Text style={styles.noDataText}>No users found.</Text>
      ) : (
        filteredUsers.map((user) => (
          <View key={user.id} style={styles.card}>
            <Image
              source={user.profilePicture ? { uri: user.profilePicture } : require("@/assets/Logo.png")}
              style={styles.profilePicture}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{user.name}</Text>
              <Text style={styles.cardDetail}>Phone: {user.phone}</Text>
              <Text style={styles.cardDetail}>Address: {user.address}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleSendRequest(user.id)}
              >
                <Text style={styles.addButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  noDataText: { fontSize: 14, color: "#888", marginBottom: 10 },
  card: { flexDirection: "row", marginVertical: 20, alignItems: "center" },
  profilePicture: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardDetail: { fontSize: 14, color: "#555" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  acceptButton: { backgroundColor: "#4CAF50", padding: 8, borderRadius: 5 },
  acceptButtonText: { color: "white", fontWeight: "bold" },
  declineButton: { backgroundColor: "#f44336", padding: 8, borderRadius: 5 },
  declineButtonText: { color: "white", fontWeight: "bold" },
  removeButton: { backgroundColor: "#ff4d4d", padding: 8, borderRadius: 5 },
  removeButtonText: { color: "white", fontWeight: "bold" },
  searchInput: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 5, marginBottom: 10 },
  addButton: { backgroundColor: "#2196F3", padding: 8, borderRadius: 5 },
  addButtonText: { color: "white", fontWeight: "bold" },
});

