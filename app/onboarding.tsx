import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/providers/AuthProvider";
import { Shield, Bell, Map, Users } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
    {
        id: "1",
        title: "Your Safety,\nOur Priority",
        description:
            "Empowering you with tools to feel secure anywhere, anytime. A companion that's always by your side.",
        icon: Shield,
        color: "#FF6B6B",
    },
    {
        id: "2",
        title: "Instant\nAlerts",
        description:
            "Trigger SOS alerts in seconds. Notify your trusted contacts and local authorities with your live location.",
        icon: Bell,
        color: "#4ECDC4",
    },
    {
        id: "3",
        title: "Safe\nRouting",
        description:
            "Navigate through the safest routes based on community feedback and real-time safety scores.",
        icon: Map,
        color: "#45B7D1",
    },
    {
        id: "4",
        title: "Community\nSupport",
        description:
            "Join a network of individuals committed to making the world a safer place for everyone.",
        icon: Users,
        color: "#96CEB4",
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();
    const { completeOnboarding } = useAuth();
    const flatListRef = React.useRef<FlatList>(null);

    const handleNext = async () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            await completeOnboarding();
            router.replace('/auth' as any);
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/auth' as any);
    };

    const renderItem = ({ item }: { item: typeof ONBOARDING_DATA[0] }) => {
        const IconComponent = item.icon;
        return (
            <View style={styles.slide}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
                    <IconComponent size={80} color={item.color} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {ONBOARDING_DATA.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                        <Text style={styles.nextText}>
                            {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    slide: {
        width,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    iconContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 60,
    },
    title: {
        fontSize: 36,
        fontWeight: "800",
        color: Colors.text,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 42,
    },
    description: {
        fontSize: 18,
        color: Colors.text + "80", // Opacity 50%
        textAlign: "center",
        lineHeight: 28,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: 30,
        paddingBottom: 50,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 30,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.text + "20",
        marginHorizontal: 5,
    },
    activeDot: {
        width: 24,
        backgroundColor: Colors.primary,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    skipButton: {
        padding: 15,
    },
    skipText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text + "60",
    },
    nextButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    nextText: {
        fontSize: 16,
        fontWeight: "700",
        color: "white",
    },
});
