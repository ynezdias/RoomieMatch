require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./src/models/User')
const Profile = require('./src/models/Profile')
const fs = require('fs')

async function seed() {
    let log = ''
    const appendLog = (msg) => {
        console.log(msg)
        log += msg + '\n'
    }

    try {
        await mongoose.connect(process.env.MONGO_URI)
        appendLog('✅ Connected to DB for seeding')

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash('12345678', salt)

        const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen']
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
        const universities = ['State University', 'Polytechnic Institute', 'College of Arts', 'Tech University', 'National University']

        const currentCount = await User.countDocuments()
        appendLog(`Current user count: ${currentCount}`)

        const usersToSeed = []
        for (let i = 0; i < 20; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
            const name = `${firstName} ${lastName}`
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@example.com`

            usersToSeed.push({ name, email, password: hashedPassword })
        }

        const createdUsers = await User.insertMany(usersToSeed)
        appendLog(`✅ Created ${createdUsers.length} users`)

        const profilesToSeed = createdUsers.map((user, index) => {
            const city = cities[Math.floor(Math.random() * cities.length)]
            const university = universities[Math.floor(Math.random() * universities.length)]
            const photoId = Math.floor(Math.random() * 1000)

            return {
                userId: user._id,
                aboutMe: `Hi, I'm ${user.name.split(' ')[0]}! I'm looking for a great roommate in ${city}.`,
                city: city,
                university: university,
                photo: `https://picsum.photos/id/${photoId}/500/500`,
                budget: Math.floor(Math.random() * 2000) + 500,
                smoking: Math.random() > 0.8,
                pets: Math.random() > 0.7,
                furniture: Math.random() > 0.5
            }
        })

        await Profile.insertMany(profilesToSeed)
        appendLog(`✅ Created ${profilesToSeed.length} profiles`)

        appendLog('🌱 Seeding complete!')
        fs.writeFileSync('seed_log.txt', log)
        process.exit(0)
    } catch (err) {
        appendLog(`❌ Seeding failed: ${err.message}`)
        fs.writeFileSync('seed_log.txt', log)
        process.exit(1)
    }
}

seed()
