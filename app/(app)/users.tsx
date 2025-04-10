import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { H1, Muted } from "@/components/ui/typography";
import { supabase } from "@/config/supabase";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface User {
  id: string;
  name: string;
  phone: string;
  address: string;
  profilePicture: string | null;
}

interface Message {
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  useEffect(() => {
    const initializeRealtime = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        Alert.alert("Error fetching user", userError.message);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`id, name, phone, address, profilePicture`)
        .eq("id", user?.id)
        .single();

      if (error) {
        Alert.alert("Error fetching profile", error.message);
        return;
      }

      const current = {
        id: data.id,
        name: data.name || "Unknown",
        phone: data.phone || "No phone available",
        address: data.address || "No address available",
        profilePicture: data.profilePicture || null,
      };

      setCurrentUser(current);

      const messageSubscription = supabase
        .channel("messages-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${current.id}`,
          },
          (payload) => {
            const newMessage: Message = payload.new;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
      };
    };

    initializeRealtime();
  }, []);

  const fetchUsers = async (query: string = "") => {
    try {
      setLoading(true);

      if (!currentUser) throw new Error("User not authenticated.");

      const { data, error } = await supabase
        .from("profiles")
        .select(`id, name, phone, address, profilePicture`)
        .neq("id", currentUser.id)
        .ilike("name", `%${query}%`);

      if (error) throw error;

      const transformedUsers = data.map((user: any) => ({
        id: user.id,
        name: user.name || "Unknown",
        phone: user.phone || "No phone available",
        address: user.address || "No address available",
        profilePicture: user.profilePicture || null,
      }));

      setUsers(transformedUsers);
    } catch (error: any) {
      Alert.alert("Error fetching users", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchUsers(text);
  };

  const openProfile = async (user: User) => {
    try {
      setSelectedUser(user);
      setIsProfileVisible(true);
  
      const { data: listings, error } = await supabase
        .from("product_listings")
        .select("*, owner2 (name)")
        .or(`owner1.eq.${user.id}, owner2.eq.${user.id}`) // Include if either owner1 or owner2 is the user
  
      if (error) throw error;
  
      setSelectedUser((prev) => (prev ? { ...prev, listings } : prev));
    } catch (error: any) {
      Alert.alert("Error fetching listings", error.message);
    }
  };
  

const handleMessage = (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    setIsChatVisible(true);
    fetchMessages(user.id);
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser?.id}, receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId}, receiver_id.eq.${currentUser?.id})`
        )
        .order("timestamp", { ascending: true });

      if (error) throw error;

      setMessages(data);
    } catch (error: any) {
      Alert.alert("Error fetching messages", error.message);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    if (!currentUser || !selectedUser) {
      Alert.alert("Error", "No user selected.");
      return;
    }

    const newMessage = {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("messages").insert(newMessage);
      if (error) throw error;

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessageInput("");
    } catch (error: any) {
      Alert.alert("Error sending message", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
      <MaterialIcons name="search" size={20} color="#888" />
      <TextInput
        placeholder="Search users by name..."
        value={search}
        onChangeText={handleSearch}
      />
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#9455f4" />
          <Text>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userCard} onPress={() => openProfile(item)}>
                  {item.profilePicture ? (
              <Image
                source={{ uri: item.profilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.defaultProfilePicture}>
                <Text style={styles.defaultProfileText}>{item.name.charAt(0)}</Text>
              </View>
            )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text>📍 {item.address}</Text>
                <Text>📞 {item.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => handleMessage(item)}
              >
              
              <MaterialCommunityIcons name="message-draw" size={27.5} color="black" />  
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noResults}>No users found.</Text>}
        />
      )}
{/* Profile Modal */}
<Modal visible={isProfileVisible} animationType="slide">
  <View style={styles.profileContainer}>
    <TouchableOpacity onPress={() => setIsProfileVisible(false)} style={styles.arrowButton}>
      <MaterialIcons name="arrow-back" size={28} color="black" />
    </TouchableOpacity>

    {selectedUser && (
      <View>
        {selectedUser.profilePicture ? (
          <Image source={{ uri: selectedUser.profilePicture }} className="w-40 h-40 rounded-full mb-4" />
        ) : (
          <View style={styles.defaultProfilePicture}>
            <Text style={styles.defaultProfileText}>{selectedUser.name?.charAt(0) || "U"}</Text>
          </View>
        )}

        {/* User Information */}
        <H1 className="text-center text-2xl">{selectedUser.name || "Unknown"}</H1>
        <Muted className="text-center">📍 {selectedUser.address || "Not provided"}</Muted>
        <Muted className="text-center">📞 {selectedUser.phone || "N/A"}</Muted>
      </View>
    )}

    {/* Listings Section */}
    <ScrollView showsVerticalScrollIndicator={false} style={styles.listingsContainer}>
      <Text style={styles.listingsHeader}>Listings</Text>
      {selectedUser?.listings?.length ? (
        selectedUser.listings.map((listing) => (
          <View key={listing.id} style={styles.listingCard}>
            <Image source={{ uri: listing.picture1_url || "https://example.com/default.jpg" }} style={styles.listingImage} />
            <View>
              <Text style={styles.listingTitle}>{listing.name || "Unnamed Listing"}</Text>
              <Text style={styles.listingDescription}>Status: {listing.status || "Unknown"}</Text>
              <Text style={styles.listingDescription}>Owner 2: {listing.owner2?.name || "N/A"}</Text>
              <Text style={styles.listingDescription}>📍 {listing.address || "Not specified"}</Text>
              <Text style={styles.listingDescription}>💰 Price: Rs {listing.price_per_hour || "0"}/hour</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noListingsText}>No listings available.</Text>
      )}
    </ScrollView>
  </View>
</Modal>


      <Modal
        visible={isChatVisible}
        animationType="slide"
        onRequestClose={() => setIsChatVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.chatContainer}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setIsChatVisible(false)}>
            <MaterialIcons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>Chat with {selectedUser?.name}</Text>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item, index) => `${item.sender_id}-${index}`}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender_id === currentUser?.id
                    ? styles.sentBubble
                    : styles.receivedBubble,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}
          />

          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={messageInput}
              onChangeText={setMessageInput}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafc",
  },
  searchBar: {
    height: 45,  // Slightly taller for better usability
    borderColor: "#ccc",  // Softer border color
    borderWidth: 1,
    paddingHorizontal: 12,  // More padding for comfortable text entry
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 10,  // Rounded corners for a modern look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,  // Increased shadow for better depth
    shadowRadius: 6,
    elevation: 6,  // Enhanced shadow effect on Android
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,  // Rounded corners for a modern look
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  messageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResults: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  // Chat Modal Styles
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  closeButton: {
    color: "#9455f4",
    fontSize: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  sentBubble: {
    backgroundColor: "#bfa6f7",
    alignSelf: "flex-end",
  },
  receivedBubble: {
    backgroundColor: "#f1f0f0",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: "#555",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  messageInputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    backgroundColor: "#f9fafc",
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#9455f4",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    padding: 50
  },
  defaultProfileText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#555",
  },
  closeButtonText: { color: "#9455f4", fontSize: 16 },
    listingsContainer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: "#f9fafc",
      borderRadius: 10,
      marginBottom: 250
    },
    listingsHeader: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    listingCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 10,
      marginBottom: 20,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    listingImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
      marginRight: 10,
    },
    listingTitle: {
      fontSize: 16,
      fontWeight: "bold",
    },
    listingDescription: {
      fontSize: 14,
      color: "#666",
    },
    noListingsText: {
      textAlign: "center",
      fontSize: 14,
      color: "#999",
    },

});