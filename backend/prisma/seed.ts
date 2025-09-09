import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample profiles
  const profile1 = await prisma.profile.upsert({
    where: { email: 'demo@monamichef.com' },
    update: {},
    create: {
      email: 'demo@monamichef.com',
      display_name: 'Demo User',
      avatar_url: null,
    },
  })

  // Create sample guest
  const guest1 = await prisma.guest.create({
    data: {
      // conversion_token will be auto-generated
    },
  })

  // Create sample conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      title: 'Italian Pasta Recipe',
      owner_profile_id: profile1.id,
    },
  })

  const conversation2 = await prisma.conversation.create({
    data: {
      title: 'Quick Breakfast Ideas',
      owner_guest_id: guest1.id,
    },
  })

  // Create sample chat messages
  await prisma.chatMessage.create({
    data: {
      conversation_id: conversation1.id,
      history: [
        {
          role: 'user',
          parts: [{ text: 'Can you give me a simple pasta recipe?' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Here\'s a simple spaghetti aglio e olio recipe...' }],
        },
      ],
      messages: [
        { role: 'user', text: 'Can you give me a simple pasta recipe?' },
        { role: 'model', text: 'Here\'s a simple spaghetti aglio e olio recipe...' },
      ],
    },
  })

  await prisma.chatMessage.create({
    data: {
      conversation_id: conversation2.id,
      history: [
        {
          role: 'user',
          parts: [{ text: 'What are some quick breakfast options?' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Here are 3 quick breakfast ideas: 1. Overnight oats...' }],
        },
      ],
      messages: [
        { role: 'user', text: 'What are some quick breakfast options?' },
        { role: 'model', text: 'Here are 3 quick breakfast ideas: 1. Overnight oats...' },
      ],
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📝 Created:`)
  console.log(`   - 1 Profile: ${profile1.email}`)
  console.log(`   - 1 Guest: ${guest1.id.slice(0, 8)}...`)
  console.log(`   - 2 Conversations`)
  console.log(`   - 2 Chat Messages`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })