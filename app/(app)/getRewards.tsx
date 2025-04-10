import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { supabase } from "@/config/supabase"; // Supabase configuration
import { useSupabase } from "@/context/supabase-provider"; // User context
import { H1, Muted } from "@/components/ui/typography";
import { useRouter } from "expo-router";

export default function GetRewards() {
  const router = useRouter();
  const { user } = useSupabase();
  const [rewards, setRewards] = useState({
    points: "0.0",
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
    const fetchRewards = async () => {
      if (user?.id) {
        // Fetch reward points for the user
        const { data, error } = await supabase
          .from("reward_points")
          .select("points, created_at, updated_at")
          .eq("profile_id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // Row does not exist for this user
            Alert.alert("No rewards found", "You do not have any rewards yet.");
          } else {
            Alert.alert("Error fetching rewards", error.message);
          }2
        } else {
          // Row exists, set the rewards data
          setRewards({
            points: data.points.toFixed(1),
            created_at: data.created_at,
            updated_at: data.updated_at,
          });
        }
      }
    };

    fetchRewards();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <H1 style={styles.pointsText}>{`${rewards.points} Points`}</H1>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>First Added:</Text>
        <Muted style={styles.detailValue}>{rewards.created_at}</Muted>

        <Text style={[styles.detailLabel, styles.spacingTop]}>Last Updated:</Text>
        <Muted style={styles.detailValue}>{rewards.updated_at}</Muted>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(protected)/")}
      >
        <Text style={styles.buttonText}>Make Purchases</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        Get <Text style={styles.highlight}>100 points</Text> after every 5 purchases
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  pointsText: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#9455f4",
    textAlign: "center",
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  spacingTop: {
    marginTop: 16,
  },
  button: {
    backgroundColor: "#9455f4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 24,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    marginTop: 16,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  highlight: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },
});
