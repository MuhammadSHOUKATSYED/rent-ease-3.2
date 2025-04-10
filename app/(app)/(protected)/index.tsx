import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import {FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import car from '../../../assets/car.png';
import house from '../../../assets/house.png';
import mobile from '../../../assets/mobile.png';
import vehicle from '../../../assets/vehicle.png';
import electronics from '../../../assets/responsive.png';
import fashion from '../../../assets/brand.png';
import appliances from '../../../assets/blender.png';
import decoration from '../../../assets/svg.png';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";

const categoryImages = {
  motors: car,
  property: house,
  mobiles: mobile,
  vehicles: vehicle,
  electronics: electronics,
  fashion: fashion,
  appliances: appliances,
  decoration: decoration
};

const HomePage = () => {
	const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('product_listings')
      .select('*')
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };
  
  const categories = ['Latest Ads', 'Motors', 'Property', 'Mobiles', 'Vehicles', 'Decoration'];  

  return (
    <SafeAreaView className="flex-1 bg-background mb-3">
     <View className="items-center p-2 bg-[#9455f4]">
      {/* Top Bar with Title and Notification Icon */}
      <View className="flex-row justify-between w-full px-4 mt-2">
        <Text className="text-white text-2xl font-semibold">RentEase</Text>
        <MaterialIcons name="notifications-none" size={28} color="white" />
      </View>

      {/* Search Bar with Icon */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 mt-2 mb-3 w-full max-w-md">
        <MaterialIcons name="search" size={20} color="#888" />
        <TextInput
          className="flex-1 ml-2 text-gray-700"
          placeholder="Search RentEase"
          placeholderTextColor="#888"
        />
      </View>
    </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        
        {/* Browse Categories */}
        <Text style={{ margin: 15, fontSize: 20, fontWeight: 'bold' }}>Browse Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10}}>
          {['property', 'motors', 'mobiles', 'vehicles', 'electronics', 'fashion', 'appliances', 'decoration'].map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => router.push(`/(app)/${category}`)}
              style={{ alignItems: 'center', marginRight: 15 }}
            >
              <Image source={categoryImages[category]} style={{ width: 50, height: 50, borderRadius: 8 }} />
              <Text style={{ fontSize: 12, marginTop: 5 }}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Browse Features */}
        <View className="mt-2">
        <Text style={{ margin: 15, fontSize: 20, fontWeight: 'bold' }}>Top Features</Text>
       <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-3">
        {[
          { icon: 'user-check', title: 'Verification', route: 'verification' },
          { icon: 'robot', title: 'Assistant', route: 'chatbot' },
          { icon: 'hands-helping', title: 'Donation', route: 'donationMenu' },
          { icon: 'wallet', title: 'Digital Wallet', route: 'digitalWallet' },
          { icon: 'history', title: 'Product History', route: 'trackHistory' },
          { icon: 'tools', title: 'Report Damage', route: 'reportDamage' },
          { icon: 'award', title: 'Rewards', route: 'getRewards' },
          { icon: 'globe', title: 'Multilingual Support', route: 'getMultilingualSupport' },
          { icon: 'users', title: 'Shared Ownership', route: 'sharedOwnership' },
        ].map((feature) => (
          <TouchableOpacity
            key={feature.title}
            onPress={() => router.push(`/(app)/${feature.route}`)}
            className="items-center mr-4 p-3 bg-white rounded-xl shadow-md"
          >
            <FontAwesome5 name={feature.icon} size={27} color="#311465" />
            <Text
              className="mt-2 text-xs text-center"
            >
              {feature.title}
            </Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
        </View>

      {/* Product Sections */}
      <View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        categories.map((section) => {
          const filteredProducts =
            section === 'Latest Ads' ? products : products.filter((product) => product.category === section);
          return (
            <View key={section} style={{ marginTop: 18, paddingHorizontal: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{section}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 10,
                        padding: 10,
                        marginRight: 15,
                        width: 150,
                        height: 200,
                      }}
                    >
                      <Image
                        source={{ uri: product.picture1_url || 'https://picsum.photos/150'  }}
                        style={{ width: '100%', height: 130, borderRadius: 8 }}
                      />
                      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 5 }}>{product.name}</Text>
                      <Text style={{ fontSize: 12, color: '#888' }}>Rs. {product.price_per_hour}/hour</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <>
                  {[1, 2, 3, 4].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 10,
                        padding: 10,
                        marginRight: 15,
                        width: 150,
                        height: 200,
                      }}
                    >
                      <Image source={{ uri: 'https://picsum.photos/150' }} style={{ width: '100%', height: 130, borderRadius: 8 }} />
                      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 5 }}>Item {item}</Text>
                      <Text style={{ fontSize: 12, color: '#888' }}>Rs. {item * 1000}/hour</Text>
                    </TouchableOpacity>
                  ))}
                  </>
                )}
              </ScrollView>
            </View>
          );
        })
      )}
    </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;