import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const DATA = [
  {
    id: "1",
    name: "John Doe",
    roll: "101",
    age: "20",
  },
  {
    id: "2",
    name: "Jane Smith",
    roll: "102",
    age: "21",
  },
  {
    id: "3",
    name: "Alex Johnson",
    roll: "103",
    age: "19",
  },
  {
    id: "4",
    name: "Emily Davis",
    roll: "104",
    age: "22",
  },
];
export default function RootLayout() {
  return (
    <SafeAreaView>
      <View>
        <Text
          style={{
            fontSize: 20,
            color: "red",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Assalamu Alaikum
        </Text>
      </View>
      <TextInput
        placeholder="Enter Your Name"
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginTop: 20,
          marginLeft: 20,
          marginRight: 20,
        }}
      />
      <TouchableOpacity
        style={{
          height: 40,
          backgroundColor: "#f4511e",
          marginTop: 20,
          marginLeft: 20,
          marginRight: 20,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", marginTop: 10 }}>
          Submit
        </Text>
      </TouchableOpacity>
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <View
            style={{
              marginTop: 20,
              marginLeft: 20,
              marginRight: 20,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#f4511e" }}>Student Name: {item.name}</Text>
            <Text style={{ color: "#666" }}>Roll No: {item.roll}</Text>
            <Text style={{ color: "#666" }}>Age: {item.age}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}
