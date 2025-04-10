import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  Platform,
  KeyboardAvoidingView,
  StyleSheet
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Image picker for selecting photos
import { H1 } from "@/components/ui/typography";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
import { Image } from "@/components/image";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

export default function EditProfile() {
  const { user } = useSupabase();
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    birth: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

          if (error) {
            if (error.code === "PGRST116") {
              // Row does not exist for this user
              Alert.alert("Update your profile", "No record found, you have not yet updated your profile");
            } else {
              Alert.alert("Error fetching profile", error.message);
            }
          } else {
          setProfile({
            name: data?.name || "",
            phone: data?.phone || "",
            address: data?.address || "",
            birth: data?.birth || "",
        	profilePicture: data?.profilePicture || "",
          });
        }
      };
      fetchProfile();
    }
  }, [user?.id]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user?.id,
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        birth: profile.birth,
        profilePicture: profile.profilePicture,
      });

    if (error) {
      Alert.alert("Error saving profile", error.message);
    } else {
      Alert.alert("Profile updated successfully!");
    }
    setLoading(false);
  };

  const showDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: profile.birth ? new Date(profile.birth) : new Date(),
        onChange: (event, selectedDate) => {
          if (selectedDate) {
            setProfile((prev) => ({
              ...prev,
              birth: selectedDate.toISOString().split("T")[0],
            }));
          }
        },
        mode: "date",
        is24Hour: true,
      });
    }
  };

  const handleImageUpload = async () => {
    // Request image picker permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need permission to access your photos.");
      return;
    }
  
    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
  
    if (!result.canceled) {
      const { uri } = result.assets[0];
      console.log('Got image', uri)
      const fileName = `${user?.id}_${Date.now()}.png`;
  
      try {
                  // Upload the image to Supabase storage
const file = {
  uri,
  contentType: "image/png", // or 'image/png', depending on the image type
  name: fileName,
};

const { error: uploadError } = await supabase.storage
  .from("profile-pictures") // Storage bucket name
  .upload(fileName, file);

if (uploadError) throw uploadError;

  
        // Get the public URL for the uploaded image

        const { data: publicUrlData, error: urlError } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(fileName);
  
        if (urlError) throw urlError;
  
        setProfile((prev) => ({ ...prev, profilePicture: publicUrlData.publicUrl }));
        
        Alert.alert("Image uploaded successfully!");
      } catch (error) {
        Alert.alert("Error uploading image", error.message);
      }
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f9fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View className="items-center justify-center p-6 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={handleImageUpload}>
            {profile.profilePicture ? (
              <Image
                source={{ uri: profile.profilePicture }}
                className="w-40 h-40 rounded-full mb-2"
              />
            ) : (
              <View style={styles.defaultProfilePicture}>
              <Text style={styles.defaultProfileText}>{profile.name.charAt(0)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <H1 style={{ fontSize: 24, fontWeight: "bold" }}>{profile.name}</H1>
        </View>
        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white"
          placeholder="Name"
          value={profile.name}
          onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-gray-100"
          placeholder="Email"
          value={user?.email}
          editable={false}
        />
        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white"
          placeholder="Phone"
          value={profile.phone}
          onChangeText={(text) => setProfile((prev) => ({ ...prev, phone: text }))}
        />
        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white"
          placeholder="Address"
          value={profile.address}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, address: text }))
          }
        />
        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white"
          placeholder="Birthday"
          value={profile.birth}
          onFocus={showDatePicker}
        />
        <TouchableOpacity
          style={{
              backgroundColor: '#9455f4', // Greenish background color
              paddingVertical: 16,        // Padding to make the button taller
              paddingHorizontal: 32,      // Padding to make the button wider
              borderRadius: 8,            // Rounded corners
              alignItems: 'center',       // Center text horizontally
              justifyContent: 'center',   // Center text vertically
              marginTop: 20, 
              marginBottom: 30,             // Margin to separate from other elements
          }}
          onPress={handleSave}
          disabled={loading}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  defaultProfilePicture: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
  }
  })