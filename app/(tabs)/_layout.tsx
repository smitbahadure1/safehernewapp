import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.surfaceBorder,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600' as const,
                },
            }}
        >
            <Tabs.Screen
                name="(home)"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="contacts"
                options={{
                    title: 'Contacts',
                    tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tools"
                options={{
                    title: 'Tools',
                    tabBarIcon: ({ color, size }) => <Ionicons name="apps" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Safety Card',
                    tabBarIcon: ({ color, size }) => <Ionicons name="medical" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
