import { useState } from "react";
import { View, ScrollView,TextInput, TouchableOpacity, Alert, Image as RNImage } from "react-native";
import { H1, Muted } from "@/components/ui/typography";
import { supabase } from "@/config/supabase";  // Supabase client import
import * as ImagePicker from "expo-image-picker";  // For picking images
import { useSupabase } from "@/context/supabase-provider";  // Supabase context for user data

export default function HelpSupport() {
  const { user } = useSupabase(); // Access current logged-in user
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to pick an image from the user's gallery
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

  // Function to submit the query
  const handleSubmitQuery = async () => {
    if (!title || !content) {
      Alert.alert("Missing fields", "Please fill in both title and content.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("queries")
        .insert([
          {
            user_id: user?.id,
            title,
            content,
            image_url: imageUrl,
          },
        ]);

      if (error) {
        Alert.alert("Error submitting query", error.message);
      } else {
        Alert.alert("Query submitted successfully!");
        setTitle("");
        setContent("");
        setImageUrl(null);  // Reset the state after submission
      }
    } catch (error) {
      Alert.alert("Error submitting query", error.message);
    }

    setLoading(false);
  };

  return (
	<ScrollView className="bg-background">
    <View className="flex flex-1 items-center justify-center p-4 gap-y-4">
      <H1 className="text-center">Help & Support</H1>
      <Muted className="text-center">Submit your query below</Muted>

      {/* Title Input */}
      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white"
        placeholder="Query Title"
        value={title}
        onChangeText={setTitle}
      />
      {/* Content Input */}
      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white"
        placeholder="Describe your issue"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />
      {/* Image Picker Button */}
      <TouchableOpacity
        onPress={handleImagePick}
        style={{
          backgroundColor: "#9455f4",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 9999,
          marginBottom: 10,
          alignItems: "center",
        }}
      >
        <Muted style={{ color: "#fff", fontSize: 14 }}>Choose an image (optional)</Muted>
      </TouchableOpacity>

      {/* Display selected image */}
      {imageUrl && <RNImage source={{ uri: imageUrl }} style={{ width: 150, height: 150, marginBottom: 20 }} />}

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmitQuery}
        style={{
          backgroundColor: "#9455f4",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 9999,
          marginBottom: 10,
          alignItems: "center",
        }}
        disabled={loading}
      >
        <Muted style={{ color: "#fff", fontSize: 14 }}>
          {loading ? "Submitting..." : "Submit Query"}
        </Muted>
      </TouchableOpacity>
    </View>
	</ScrollView>
  );
}
