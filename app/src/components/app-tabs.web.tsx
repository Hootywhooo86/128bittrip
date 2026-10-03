import { Image } from 'expo-image';
import { TabList, TabListProps, Tabs, TabSlot, TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

import { PixelText } from './pixel';
import { TABS } from './tabs';

export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <BottomBar>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon}>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </BottomBar>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, icon, ...props }: TabTriggerSlotProps & { icon: number }) {
  const color = isFocused ? Colors.teal : Colors.muted;
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}>
      <Image source={icon} style={{ width: 22, height: 22 }} tintColor={color} />
      <PixelText size={7} style={{ color }}>
        {children}
      </PixelText>
    </Pressable>
  );
}

function BottomBar(props: TabListProps) {
  return (
    <View {...props} style={styles.bar}>
      <View style={styles.inner}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: 3, borderTopColor: Colors.line, backgroundColor: Colors.bg },
  inner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
  tab: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 4 },
});
