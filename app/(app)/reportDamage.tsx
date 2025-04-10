import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, Image as RNImage, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";  // For picking images
import { supabase } from "@/config/supabase";  // Supabase client import
import { useSupabase } from "@/context/supabase-provider";  // Supabase context for user data

export default function ReportDamage() {
  const { user } = useSupabase(); // Access current logged-in user
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Fetch users excluding the logged-in user and with required details
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, address, phone, profilePicture")
        .neq("id", user?.id); // Exclude the logged-in user

      if (error) {
        Alert.alert("Error fetching users", error.message);
      } else {
        setUsers(data);
        setFilteredUsers(data);  // Initially show all users
      }
    };

    fetchUsers();
  }, [user]);

  // Filter users based on search text
  useEffect(() => {
    const filtered = users.filter((user) => 
      user.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  // Handle image picking
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need permission to access your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;

      try {
        const file = { uri, contentType: "image", name: fileName };

        // Upload the image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("query-pictures")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded image
        const { data: publicUrlData, error: urlError } = supabase.storage
          .from("query-pictures")
          .getPublicUrl(fileName);

        if (urlError) throw urlError;

        setImageUrl(publicUrlData.publicUrl); // Store the public URL
      } catch (error) {
        Alert.alert("Error uploading image", error.message);
      }
    }
  };

  // Submit the damage report
  const handleSubmit = async () => {
    if (!title || !content || !selectedUser) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("damage_reports")
        .insert([
          {
            user_id: user?.id,
            title,
            description: content,
            clash_partner_id: selectedUser,
            image_url: imageUrl, // Store the uploaded image URL
          },
        ]);

      if (error) {
        Alert.alert("Error submitting report", error.message);
      } else {
        Alert.alert("Damage Report Submitted");
        setTitle("");
        setContent("");
        setSelectedUser(null);
        setImageUrl(null); // Reset after submission
      }
    } catch (error) {
      Alert.alert("Error submitting report", error.message);
    }

    setLoading(false);
  };

  // Render each user item with selection and picture
  const renderUserItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.userItem,
        selectedUser === item.id && styles.selectedUserItem, // Highlight selected user
      ]}
      onPress={() => setSelectedUser(item.id)}  // Set selected user ID
    >
      <RNImage
        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
        style={styles.profileImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userAddress}> 📍 {item.address}</Text>
        <Text style={styles.userPhone}> 📞 {item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Report Damage</Text>

        {/* Search Bar */}
        <TextInput
          placeholder="Search Users"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        {/* Title and Description Input Fields */}
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Describe the damage"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        {/* Image Picker */}
        <TouchableOpacity
          onPress={handleImagePick}
          style={styles.imagePickerButton}
        >
          <Text style={styles.buttonText}>Choose an image (optional)</Text>
        </TouchableOpacity>

        {/* Display selected image */}
        {imageUrl && (
          <RNImage source={{ uri: imageUrl }} style={styles.selectedImage} />
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, { opacity: loading ? 0.5 : 1 }]}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "Submit Report"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listHeader}>Select Responsible</Text>

      {/* Render the filtered users manually */}
      {filteredUsers.map(renderUserItem)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f7f7f7",
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  imagePickerButton: {
    backgroundColor: "#9455f4",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  selectedImage: {
    width: 150,
    height: 150,
    marginTop: 20,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#9455f4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
    textAlign: "center",
  },
  userItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
    marginBottom: 20
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userAddress: {
    fontSize: 14,
    color: "#777",
  },
  userPhone: {
    fontSize: 14,
    color: "#777",
  },
  selectedUserItem: {
    backgroundColor: "#e0e0e0",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,  // Round profile pictures
  },
});
