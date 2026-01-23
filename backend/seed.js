require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./src/models/User')
const Profile = require('./src/models/Profile')

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ Connected to DB for seeding')

        // Clean up
        await User.deleteMany({})
        await Profile.deleteMany({})
        console.log('🗑️  Cleared existing data')

        /* ================= USERS ================= */
        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash('123456', salt)

        const users = [
            { name: 'Alice Smith', email: 'alice@example.com', password },
            { name: 'Bob Johnson', email: 'bob@example.com', password },
            { name: 'Charlie Brown', email: 'charlie@example.com', password },
            { name: 'Diana Prince', email: 'diana@example.com', password },
            { name: 'Ethan Hunt', email: 'ethan@example.com', password },
        ]

        const createdUsers = await User.insertMany(users)
        console.log(`✅ Created ${createdUsers.length} users`)

        /* ================= PROFILES ================= */
        // Helper to get user ID by email
        const getId = (email) => createdUsers.find(u => u.email === email)._id

        const profiles = [
            {
                userId: getId('alice@example.com'),
                aboutMe: 'Loves hiking and cooking. Looking for a tidy roommate!',
                city: 'New York, NY',
                university: 'NYU',
                photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80'
            },
            {
                userId: getId('bob@example.com'),
                aboutMe: 'Software engineer. I work from home and love gaming.',
                city: 'San Francisco, CA',
                university: 'Stanford',
                photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80'
            },
            {
                userId: getId('charlie@example.com'),
                aboutMe: 'Medical student. Quiet and study focused.',
                city: 'Boston, MA',
                university: 'Harvard',
                photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=500&q=80'
            },
            {
                userId: getId('diana@example.com'),
                aboutMe: 'Art history major. Love visiting museums and galleries.',
                city: 'Paris, TX',
                university: 'Texas A&M',
                photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
            },
            {
                userId: getId('ethan@example.com'),
                aboutMe: 'Adventure seeker. Always out exploring.',
                city: 'Seattle, WA',
                university: 'UW',
                photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80'
            }
        ]

        await Profile.insertMany(profiles)
        console.log(`✅ Created ${profiles.length} profiles`)

        console.log('🌱 Seeding complete!')
        process.exit(0)
    } catch (err) {
        console.error('❌ Seeding failed:', err)
        process.exit(1)
    }
}

seed()
