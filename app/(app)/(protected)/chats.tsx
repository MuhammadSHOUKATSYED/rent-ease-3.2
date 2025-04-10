import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/config/supabase";
import { useRouter } from "expo-router";
import {AntDesign, MaterialIcons, Octicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

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
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chattedUsers, setChattedUsers] = useState<User[]>([]); // New state for chatted users

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
            addChattedUser(newMessage.sender_id); // Add sender to chatted users
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
      fetchChattedUsers(); // Fetch chatted users on initialization
    }
  }, [currentUser]);

  const handleMessage = (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    setIsChatVisible(true);
    fetchMessages(user.id);
    addChattedUser(user.id); // Add user to chatted users
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
      addChattedUser(selectedUser.id); // Ensure user is in chatted users
    } catch (error: any) {
      Alert.alert("Error sending message", error.message);
    }
  };

  const addChattedUser = async (userId: string) => {
    if (!currentUser) return;
    if (userId === currentUser.id) return;

    // Check if the user is already in the chattedUsers list
    if (chattedUsers.find((user) => user.id === userId)) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`id, name, phone, address, profilePicture`)
        .eq("id", userId)
        .single();

      if (error) throw error;

      const user: User = {
        id: data.id,
        name: data.name || "Unknown",
        phone: data.phone || "No phone available",
        address: data.address || "No address available",
        profilePicture: data.profilePicture || null,
      };

      setChattedUsers((prev) => [...prev, user]);
    } catch (error: any) {
      console.error("Error adding chatted user:", error.message);
    }
  };

  const fetchChattedUsers = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

      if (error) throw error;

      const uniqueUserIds = Array.from(
        new Set(
          data.flatMap((msg: any) =>
            msg.sender_id === currentUser.id
              ? [msg.receiver_id]
              : [msg.sender_id]
          )
        )
      );

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select(`id, name, phone, address, profilePicture`)
        .in("id", uniqueUserIds);

      if (userError) throw userError;

      const transformedUsers = userData.map((user: any) => ({
        id: user.id,
        name: user.name || "Unknown",
        phone: user.phone || "No phone available",
        address: user.address || "No address available",
        profilePicture: user.profilePicture || null,
      }));

      setChattedUsers(transformedUsers);
    } catch (error: any) {
      console.error("Error fetching chatted users:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
	<View className="flex-1 bg-white">
	{/* Header */}
	<View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white mt-8">
		<Text className="text-lg font-semibold mt-2" style={{ fontSize: 25}}>Chats</Text>
		<TouchableOpacity
					className="px-6 py-3 rounded-full mt-1"
					onPress={() => router.push("/(app)/users")}
				>
				<AntDesign name="adduser" size={35} color="black" />
				</TouchableOpacity>
	</View>
      {/* Chatted Users Section */}
      {loading ? (<View style={styles.loader}>
      <ActivityIndicator size="large" color="#9455f4" />
      <Text>Loading users...</Text>
      </View>):(
          <View style={styles.chattedUsersContainer}>
            <FlatList
              data={chattedUsers}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chattedUserCard}
                  onPress={() => handleMessage(item)}
                >
                  <View style={styles.chatRow}>
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
                    <View style={styles.chatDetails}>
                      <Text style={styles.chattedUserName}>{item.name}</Text>
                      <Text style={styles.chatLastMessage}>
                        {"Tap to Continue"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            ListEmptyComponent={<Text style={styles.noResults}>No users found.</Text>}
            />
          </View>
          )}
      {/* Chat Modal */}
      <Modal
        visible={isChatVisible}
        animationType="slide"
        onRequestClose={() => setIsChatVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.chatContainer}
        >
          <SafeAreaView style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setIsChatVisible(false)}>
            <MaterialIcons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>Chat with {selectedUser?.name}</Text>
          </SafeAreaView>

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
            contentContainerStyle={styles.messagesList}
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafc",
  },
  searchBar: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
    chattedUsersContainer: {
      flex: 1,
      padding: 8,
      backgroundColor: "#f5f5f5", // Adjust the background as needed
    },
    chattedUserCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      marginVertical: 5,
      borderRadius: 8,
      backgroundColor: "#ffffff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    chatRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    chattedProfilePicture: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    chatDetails: {
      flex: 1,
    },
    chattedUserName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    chatLastMessage: {
      fontSize: 14,
      color: "#666",
      marginTop: 4,
    },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
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
    backgroundColor: "#9455f4",
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
  continueButton: {
    color: "#9455f4",
    fontSize: 16,
    marginLeft: 10,
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
  defaultProfilePicture: {
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  defaultProfileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  }
  })