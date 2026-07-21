import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingShell, OptionChips } from "@/components/onboarding";
import { colors, fonts } from "@/constants/theme";
import { useOnboarding } from "@/context/OnboardingContext";
import { ageFromBirthdateIso } from "@/domain/onboarding/mapToChild";

const MONTHS = [
  { id: "01", label: "Jan" },
  { id: "02", label: "Feb" },
  { id: "03", label: "Mar" },
  { id: "04", label: "Apr" },
  { id: "05", label: "May" },
  { id: "06", label: "Jun" },
  { id: "07", label: "Jul" },
  { id: "08", label: "Aug" },
  { id: "09", label: "Sep" },
  { id: "10", label: "Oct" },
  { id: "11", label: "Nov" },
  { id: "12", label: "Dec" },
];

function buildYears(): { id: string; label: string }[] {
  const current = new Date().getFullYear();
  const years: { id: string; label: string }[] = [];
  for (let year = current; year >= current - 12; year -= 1) {
    years.push({ id: String(year), label: String(year) });
  }
  return years;
}

function parseBirthdate(iso: string | null): { month: string; year: string } {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { month: "", year: "" };
  }
  return { year: iso.slice(0, 4), month: iso.slice(5, 7) };
}

export default function BirthdateScreen() {
  const router = useRouter();
  const { draft, patchDraft } = useOnboarding();
  const years = useMemo(() => buildYears(), []);
  const initial = parseBirthdate(draft.birthdate);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  const canContinue = Boolean(month && year);
  const previewAge =
    month && year ? ageFromBirthdateIso(`${year}-${month}-15`) : null;

  const commit = (nextMonth: string, nextYear: string) => {
    if (!nextMonth || !nextYear) {
      patchDraft({ birthdate: null });
      return;
    }
    patchDraft({ birthdate: `${nextYear}-${nextMonth}-15` });
  };

  return (
    <OnboardingShell
      stepIndex={1}
      title={`When was ${draft.childName.trim() || "your child"} born?`}
      subtitle="Age helps us pick the right learning level."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push("/onboarding/explorers")}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="cream"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.section}>Month</Text>
        <OptionChips
          multi={false}
          options={MONTHS}
          selectedIds={month ? [month] : []}
          onToggle={(id) => {
            const next = id === month ? "" : id;
            setMonth(next);
            commit(next, year);
          }}
        />

        <Text style={[styles.section, styles.sectionSpaced]}>Year</Text>
        <OptionChips
          multi={false}
          options={years}
          selectedIds={year ? [year] : []}
          onToggle={(id) => {
            const next = id === year ? "" : id;
            setYear(next);
            commit(month, next);
          }}
        />

        {previewAge != null ? (
          <View style={styles.preview}>
            <Text style={styles.previewText}>
              About {previewAge} year{previewAge === 1 ? "" : "s"} old
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 24,
    gap: 4,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.inkMuted,
    marginBottom: 10,
  },
  sectionSpaced: {
    marginTop: 22,
  },
  preview: {
    marginTop: 20,
    alignItems: "center",
  },
  previewText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.skyBlue,
  },
});
