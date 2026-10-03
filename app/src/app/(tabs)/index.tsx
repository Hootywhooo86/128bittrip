import { router } from 'expo-router';
import { View } from 'react-native';

import { BossCard, PlayerCard, QuestRow } from '@/components/game';
import { Body, Eyebrow, Panel, PixelButton, PixelHotel, PixelText, Row, Screen } from '@/components/pixel';
import { Spacing } from '@/constants/theme';
import { questsFor } from '@/game/quests';
import { useGame } from '@/game/store';

export default function QuestsScreen() {
  const { state } = useGame();
  const active = state.trips
    .filter((t) => !t.checkedIn)
    .sort((a, b) => a.departDate.localeCompare(b.departDate));
  const quests = active.flatMap(questsFor).filter((q) => !q.done).slice(0, 6);
  const openTrip = (id: string) => router.push({ pathname: '/trip/[id]', params: { id } });

  return (
    <Screen>
      <Row style={{ marginTop: Spacing.two }}>
        <PixelHotel size={44} />
        <View style={{ gap: 4 }}>
          <PixelText size={13}>128BIT TRIPS</PixelText>
          <PixelText size={7} tone="muted">
            FROM THE 128BIT FAMILY
          </PixelText>
        </View>
      </Row>

      <View style={{ paddingVertical: Spacing.two }}>
        <PixelText size={20} tone="teal">
          QUESTS,
        </PixelText>
        <PixelText size={20}>NOT</PixelText>
        <PixelText size={20} tone="orange">
          ITINERARIES.
        </PixelText>
      </View>

      <PlayerCard />

      {active.length === 0 ? (
        <Panel accent="#ff5d8f">
          <Eyebrow tone="pink">NO BOSS IN SIGHT</Eyebrow>
          <Body tone="muted">
            Pick a place you want to go. Its price becomes a boss — every dollar you save is damage. Beat it, book it, go.
          </Body>
          <PixelButton label="START A QUEST" onPress={() => router.push('/new-trip')} />
          <PixelButton label="ASK TRIP AI ✦" variant="teal" onPress={() => router.push('/ai')} />
        </Panel>
      ) : (
        <>
          <Eyebrow>ACTIVE BOSS</Eyebrow>
          <BossCard trip={active[0]} compact />
          {quests.length > 0 && (
            <>
              <Eyebrow>NEXT QUESTS</Eyebrow>
              {quests.map((q) => (
                <QuestRow key={q.id} quest={q} onPress={() => openTrip(q.tripId)} cta="GO →" />
              ))}
            </>
          )}
          <PixelButton label="+ NEW QUEST" variant="ghost" onPress={() => router.push('/new-trip')} />
        </>
      )}
    </Screen>
  );
}
