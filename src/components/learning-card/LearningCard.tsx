import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { LearningModule } from "@/domain/learning/card";
import { LearningModuleView } from "@/components/learning-card/LearningModuleView";
import { space } from "@/constants/theme";

type Props = {
  modules: LearningModule[];
  header?: ReactNode;
  footer?: ReactNode;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
};

/**
 * Reusable Learning Card shell — used after Celebrate Now and from Adventure Book.
 * Modules are data-driven; future experiences add module types, not new screens.
 */
export function LearningCard({
  modules,
  header,
  footer,
  contentPaddingTop = 16,
  contentPaddingBottom = 28,
}: Props) {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {header}
      <View style={styles.modules}>
        {modules.map((module, index) => (
          <LearningModuleView
            key={`${module.type}-${index}`}
            module={module}
          />
        ))}
      </View>
      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.lg,
    gap: 14,
  },
  modules: {
    gap: 14,
  },
});
