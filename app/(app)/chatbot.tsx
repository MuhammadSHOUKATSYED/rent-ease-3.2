import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, ScrollView } from "react-native";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setChatHistory((prev) => [...prev, { type: "user", text: message }]);
    setMessage("");

    try {
      const res = await fetch("http://172.15.34.190:5000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setChatHistory((prev) => [...prev, { type: "bot", text: data.answer }]);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [...prev, { type: "bot", text: "Error connecting to the chatbot." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex flex-1 bg-gray-100 p-4">
      <Text className="text-center text-xl font-bold text-gray-800 mb-4">RentEaseAsk</Text>
      
      <ScrollView className="flex-1 bg-white rounded-lg p-4 shadow-md" showsVerticalScrollIndicator={false}>
        {chatHistory.map((msg, index) => (
          <View
            key={index}
            className={` mb-6 p-3 my-1 rounded-lg max-w-[80%] ${msg.type === "user" ? "bg-[#9455f4] self-end" : "bg-[#f1f0f0] self-start"}`}
          >
            <Text className={msg.type === "user" ? "text-white" : "text-black"}>{msg.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator size="small" color="#0000ff" className="mt-2" />}
      </ScrollView>

      <View className="flex-row items-center bg-white p-2 rounded-lg shadow mt-4">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          className="ml-2 px-4 py-2 bg-[#9455f4] rounded-lg"
        >
          <Text className="text-white font-bold">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}