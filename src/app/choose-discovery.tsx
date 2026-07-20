import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useDiscovery } from "@/context/DiscoveryContext";

export default function ChooseDiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { service, chooseFromLibrary } = useDiscovery();
  const cards = service.getLibraryCards();

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.title}>Choose Discovery</Text>
      <Text style={styles.subtitle}>
        Pick something from the Library to save as a new discovery.
      </Text>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => {
              void (async () => {
                await chooseFromLibrary(item);
                if (router.canGoBack()) {
                  router.back();
                }
              })();
            }}
          >
            <View style={[styles.photo, { backgroundColor: item.photoColor }]}>
              <Text style={styles.photoLabel}>{item.title.charAt(0)}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    paddingTop: space.lg,
    paddingHorizontal: space.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    paddingHorizontal: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  list: {
    gap: 12,
    paddingBottom: 12,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  pressed: {
    opacity: 0.85,
  },
  photo: {
    height: 96,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  photoLabel: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: "rgba(255,255,255,0.92)",
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
});
