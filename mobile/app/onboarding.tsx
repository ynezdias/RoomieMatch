import { displayFont } from '@/constants/design'
import React, { useState, useRef } from 'react'
import { View, Text, FlatList, StyleSheet, Platform, TouchableOpacity, useWindowDimensions, ViewToken } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const slides = [
    {
        id: '1',
        title: 'Find Your Perfect Match',
        description: 'Swipe through profiles to find roommates who match your lifestyle, budget, and personality.',
        icon: 'people'
    },
    {
        id: '2',
        title: 'Start a Conversation',
        description: 'Get to know potential roommates. Share messages, photos and files.',
        icon: 'chatbubbles'
    },
    {
        id: '3',
        title: 'Make It Your Own',
        description: 'Share your preferences and routines to find someone who feels like a good fit.',
        icon: 'shield-checkmark'
    }
] as const

export default function OnboardingScreen() {
    const router = useRouter()
    const { width } = useWindowDimensions()
    const [currentIndex, setCurrentIndex] = useState(0)
    const flatListRef = useRef<FlatList<(typeof slides)[number]>>(null)

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1
            if (Platform.OS !== 'web') {
                flatListRef.current?.scrollToIndex({ index: nextIndex })
            }
            setCurrentIndex(nextIndex)
        } else {
            router.replace('/register')
        }
    }

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index)
        }
    }).current

    const renderItem = ({ item }: { item: (typeof slides)[number] }) => (
        <View style={[styles.slide, { width }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={100} color="#F27886" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    )

    return (
        <View style={styles.container}>
             <LinearGradient
                colors={['#100E11', '#2C2026']}
                style={StyleSheet.absoluteFill}
            />
            
            {Platform.OS === 'web' ? (
                <View style={styles.webSlide}>
                    {renderItem({ item: slides[currentIndex] })}
                </View>
            ) : <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            />}

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
        backgroundColor: '#100E11',
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    webSlide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 200,
        height: 200,
        backgroundColor: '#2C2026',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontFamily: displayFont, fontSize: 28,
        fontWeight: 'bold',
        color: '#F5EEEE',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontFamily: displayFont, fontSize: 16,
        color: '#AEA6AB',
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
        backgroundColor: '#C93B4F',
        width: 20,
    },
    button: {
        backgroundColor: '#C93B4F',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontFamily: displayFont, fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    }
})
