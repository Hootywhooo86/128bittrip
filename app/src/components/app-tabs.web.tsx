import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { colors, fonts } from '@/theme';

/** The web tab bar: the same four tabs as the phone, in the 128bit look. */
export default function AppTabs() {
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>QUESTS</TabButton>
          </TabTrigger>
          <TabTrigger name="checklist" href="/checklist" asChild>
            <TabButton>CHECKLIST</TabButton>
          </TabTrigger>
          <TabTrigger name="book" href="/book" asChild>
            <TabButton>BOOK</TabButton>
          </TabTrigger>
          <TabTrigger name="passport" href="/passport" asChild>
            <TabButton>PASSPORT</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <Text style={[styles.tabText, isFocused && styles.tabTextOn]}>{children}</Text>
      <View style={[styles.mark, isFocused && styles.markOn]} />
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.bar}>
      <View style={styles.inner}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  slot: { flex: 1 },
  bar: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg, alignItems: 'center' },
  inner: { flexDirection: 'row', width: '100%', maxWidth: MaxContentWidth },
  tab: { flex: 1, alignItems: 'center', paddingTop: 14, paddingBottom: 10, gap: 8 },
  pressed: { opacity: 0.7 },
  tabText: { fontFamily: fonts.pixel, fontSize: 8, color: colors.textMuted },
  tabTextOn: { color: colors.accent },
  mark: { width: 16, height: 2, backgroundColor: 'transparent' },
  markOn: { backgroundColor: colors.accent },
});
