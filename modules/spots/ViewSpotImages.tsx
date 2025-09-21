import { View, Image, FlatList, Pressable, Modal, Text } from "react-native";
import { useState } from "react";

export default function SpotImages({ images = [] as { url: string }[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  return (
    <View style={{ marginTop: 12 }}>
      <FlatList
        horizontal
        data={images}
        keyExtractor={(it, idx) => it.url + idx}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setActive(item.url);
              setOpen(true);
            }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#eee",
            }}
          >
            <Image
              source={{ uri: item.url }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}
          onPress={() => setOpen(false)}
        >
          {active && (
            <Image
              source={{ uri: active }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          )}
          <Text
            style={{
              position: "absolute",
              top: 40,
              right: 20,
              color: "#fff",
              fontSize: 16,
            }}
          >
            Tap to close
          </Text>
        </Pressable>
      </Modal>
    </View>
  );
}
