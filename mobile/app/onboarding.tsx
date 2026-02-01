import React, { useState, useRef } from 'react'
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

const slides = [
    {
        id: '1',
        title: 'Find Your Perfect Match',
        description: 'Swipe through profiles to find roommates who match your lifestyle, budget, and personality.',
        icon: 'people'
    },
    {
        id: '2',
        title: 'Secure & Real-time Chat',
        description: 'Chat instantly with potential roommates. Send photos, videos, and voice notes.',
        icon: 'chatbubbles'
    },
    {
        id: '3',
        title: 'Verified Profiles',
        description: 'Safety first. We verify profiles to ensure you are talking to real people.',
        icon: 'shield-checkmark'
    }
]

export default function OnboardingScreen() {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const flatListRef = useRef(null)

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 })
        } else {
            router.replace('/register')
        }
    }

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index)
        }
    }).current

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={100} color="#4CAF50" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    )

    return (
        <View style={styles.container}>
             <LinearGradient
                colors={['#020617', '#1e293b']}
                style={StyleSheet.absoluteFill}
            />
            
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View 
                            key={index} 
                            style={[
                                styles.dot, 
                                currentIndex === index && styles.activeDot
                            ]} 
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <Ionicons 
                        name={currentIndex === slides.length - 1 ? "checkmark" : "arrow-forward"} 
                        size={20} 
                        color="#fff" 
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    slide: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    iconContainer: {
        width: 200,
        height: 200,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: 40,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 10,
    },
    activeDot: {
        backgroundColor: '#4CAF50',
        width: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    }
})
