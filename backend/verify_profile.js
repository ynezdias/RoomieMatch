
const mongoose = require('mongoose');
const Profile = require('./src/models/Profile');
const User = require('./src/models/User');
require('dotenv').config();

const verifyProfile = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a user to attach profile to, or create one
        let user = await User.findOne({ email: 'test_verify@example.com' });
        if (!user) {
            user = await User.create({
                name: 'Verify User',
                email: 'test_verify@example.com',
                password: 'password123'
            });
            console.log('Created test user');
        }

        const profileData = {
            userId: user._id,
            aboutMe: 'I am a test profile',
            university: 'Test Uni',
            city: 'Test City',
            budget: 2500,
            smoking: true,
            pets: true,
            furniture: false
        };

        const profile = await Profile.findOneAndUpdate(
            { userId: user._id },
            profileData,
            { upsert: true, new: true }
        );

        console.log('Updated Profile:', profile);

        if (profile.budget === 2500 && profile.smoking === true && profile.pets === true && profile.furniture === false) {
            console.log('✅ VERIFICATION PASSED: All fields saved correctly.');
        } else {
            console.error('❌ VERIFICATION FAILED: Fields do not match.');
        }

    } catch (err) {
        console.error('Verification Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

verifyProfile();
