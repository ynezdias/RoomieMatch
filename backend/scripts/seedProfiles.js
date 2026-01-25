const mongoose = require('mongoose');
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roomiematch';

const seedData = [
    {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        password: 'password123',
        profile: {
            university: 'NYU',
            major: 'Psychology',
            year: 'Junior',
            age: 21,
            gender: 'Female',
            bio: 'Love hiking and coffee. Looking for a neat roommate who respects quiet hours.',
            cleanliness: 5,
            sleepSchedule: 'Early Bird',
            guests: 'Occasional',
            city: 'New York',
        },
    },
    {
        name: 'Michael Chen',
        email: 'michael.c@example.com',
        password: 'password123',
        profile: {
            university: 'Columbia',
            major: 'Computer Science',
            year: 'Senior',
            age: 22,
            gender: 'Male',
            bio: 'Coder by day, gamer by night. Chill vibes only.',
            cleanliness: 3,
            sleepSchedule: 'Night Owl',
            guests: 'Often',
            city: 'New York',
        },
    },
    {
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        password: 'password123',
        profile: {
            university: 'Fordham',
            major: 'Business',
            year: 'Sophomore',
            age: 19,
            gender: 'Female',
            bio: 'Organized and friendly. I enjoy cooking and movie nights!',
            cleanliness: 4,
            sleepSchedule: 'Flexible',
            guests: 'Rarely',
            city: 'Bronx',
        },
    },
    {
        name: 'David Wilson',
        email: 'david.w@example.com',
        password: 'password123',
        profile: {
            university: 'NYU',
            major: 'Economics',
            year: 'Junior',
            age: 21,
            gender: 'Male',
            bio: 'Focused on studies but like to hang out on weekends. Looking for a roommate close to campus.',
            cleanliness: 4,
            sleepSchedule: 'Early Bird',
            guests: 'Occasional',
            city: 'New York',
        },
    },
    {
        name: 'Jessica Martinez',
        email: 'jessica.m@example.com',
        password: 'password123',
        profile: {
            university: 'Hunter College',
            major: 'Nursing',
            year: 'Senior',
            age: 23,
            gender: 'Female',
            bio: 'Busy nursing student. Need a quiet place to study and rest.',
            cleanliness: 5,
            sleepSchedule: 'Flexible',
            guests: 'Rarely',
            city: 'New York',
        },
    },
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional, be careful in prod)
        // await User.deleteMany({});
        // await Profile.deleteMany({});
        // console.log('🗑️ Cleared existing data');

        for (const data of seedData) {
            // Check if user exists
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = new User({
                    name: data.name,
                    email: data.email,
                    password: data.password, // In real app, hash this!
                });
                await user.save();
                console.log(`👤 Created user: ${user.name}`);
            }

            // Check if profile exists
            let profile = await Profile.findOne({ userId: user._id });
            if (!profile) {
                profile = new Profile({
                    userId: user._id,
                    ...data.profile,
                    photo: `https://ui-avatars.com/api/?name=${data.name}&background=random`,
                });
                await profile.save();
                console.log(`📄 Created profile for: ${user.name}`);
            }
        }

        console.log('🌱 Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seed();
