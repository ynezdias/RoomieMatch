import { Tabs } from 'expo-router'
import { View, Text, useWindowDimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Brand } from '@/components/app-ui'
import { palette as p } from '@/constants/design'
export default function TabsLayout() {
  const { width } = useWindowDimensions()
  return (
    <View style={{ flex: 1, backgroundColor: p.canvas }}>
      <View style={{ backgroundColor: p.surface, borderBottomWidth: 1, borderColor: p.line }}>
        <View
          style={{
            width: '100%',
            maxWidth: 1200,
            alignSelf: 'center',
            paddingHorizontal: 24,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Brand />
          {width >= 700 && (
            <Text style={{ color: p.muted, fontSize: 12 }}>Find your people. Feel at home.</Text>
          )}
        </View>
      </View>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: p.accent,
          tabBarInactiveTintColor: p.muted,
          tabBarStyle: {
            backgroundColor: p.surface,
            borderTopColor: p.line,
            height: 72,
            paddingTop: 10,
            paddingBottom: 10,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 3 },
        }}
      >
        <Tabs.Screen
          name="swipe"
          options={{
            title: 'Swipe',
            tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={23} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={23} color={color} />,
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            title: 'Chats',
            tabBarIcon: ({ color }) => (
              <Ionicons name="chatbubbles-outline" size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={23} color={color} />,
          }}
        />
      </Tabs>
    </View>
  )
}
