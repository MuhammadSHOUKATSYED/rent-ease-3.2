import React from "react";
import { router } from "expo-router";
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Muted } from "@/components/ui/typography";
import { AntDesign,FontAwesome6} from "@expo/vector-icons";

export default function DonationMenu() {


  return (
    <View className="flex-1 bg-background">
      {/* Scrollable Options */}
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        <View className="w-full bg-white">
          <TouchableOpacity
            className="flex-row items-center p-5 border-b border-gray-200"
            onPress={() => router.push("/modal")}
          >
            <AntDesign name="hearto" size={24} color="black" />
            <View className="ml-4 flex-1">
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Get Donations</Text>
              <Muted style={{ fontSize: 14 }}>Get products that are donated</Muted>
            </View>
            <AntDesign name="right" size={20} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-5 border-b border-gray-200"
            onPress={() => router.push("/(app)/myDonations")}
          >
            <AntDesign name="appstore-o" color="color" size={24} />
            <View className="ml-4 flex-1">
              <Text style={{ fontSize: 18, fontWeight: '600' }}>My Donations</Text>
              <Muted style={{ fontSize: 14 }}>View your donated products</Muted>
            </View>
            <AntDesign name="right" size={20} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-5 border-b border-gray-200"
            onPress={() => router.push("/(app)/donation")}
          >
          <FontAwesome6 name="hand-holding-heart" size={24} color="black" />
            <View className="ml-4 flex-1">
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Donate Product</Text>
              <Muted style={{ fontSize: 14 }}>Post your donated products</Muted>
            </View>
            <AntDesign name="right" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  fontSize: 20,
  fontWeight: 'bold',
  color: '#fff',
}
})