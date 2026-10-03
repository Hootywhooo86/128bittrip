import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

import { TABS } from './tabs';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Colors.bg}
      indicatorColor={Colors.panel}
      tintColor={Colors.teal}
      iconColor={{ default: Colors.muted, selected: Colors.teal }}
      labelStyle={{ default: { color: Colors.muted }, selected: { color: Colors.teal } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={tab.icon} renderingMode="template" />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
