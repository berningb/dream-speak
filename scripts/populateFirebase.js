import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, updateDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables from .env (root)
dotenv.config();

// Firebase config from environment (supports both Vite-style and plain keys)
const env = process.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || env.FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing Firebase environment variables. Please configure your .env file.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Specific user ID you provided
const USER_ID = 'xYAxBpKBvBUii1QfaCfvVqzHv6d2';

// Test dreams data (same as your original script)
const testDreams = [
  {
    title: 'Flying Over the City',
    content: 'I was soaring above a futuristic cityscape, the buildings glowing with neon lights. I could feel the wind in my hair and the freedom of flight. The city below looked like something from a sci-fi movie, with flying cars and holographic advertisements.',
    date: new Date('2024-01-15'),
    isPublic: true,
    tags: ['flying', 'city', 'futuristic', 'freedom'],
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    mood: 'Exciting',
    emotions: ['joy', 'wonder', 'excitement', 'freedom'],
    colors: ['neon blue', 'purple', 'pink', 'gold'],
    role: true,
    people: ['myself'],
    places: ['futuristic city', 'sky'],
    things: ['flying cars', 'holograms', 'neon lights'],
    type: 'sweet'
  },
  {
    title: 'The Mysterious Library',
    content: 'I was in an ancient library with endless corridors of books. The shelves reached impossibly high, and the books seemed to whisper secrets. I found a book that opened a portal to another dimension.',
    date: new Date('2024-01-20'),
    isPublic: false,
    tags: ['library', 'books', 'mystery', 'portal'],
    image: null,
    mood: 'Curious',
    emotions: ['curiosity', 'awe', 'mystery', 'intrigue'],
    colors: ['brown', 'gold', 'dark green', 'amber'],
    role: true,
    people: ['myself', 'librarian'],
    places: ['ancient library', 'endless corridors'],
    things: ['books', 'portal', 'whispering shelves'],
    type: 'sweet'
  },
  {
    title: 'Ocean Depths Adventure',
    content: 'I was swimming in the deepest part of the ocean, surrounded by bioluminescent creatures. The water was crystal clear and I could breathe underwater. I discovered an underwater city inhabited by merpeople.',
    date: new Date('2024-01-25'),
    isPublic: true,
    tags: ['ocean', 'underwater', 'bioluminescent', 'merpeople'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    mood: 'Wonder',
    emotions: ['amazement', 'peace', 'discovery', 'wonder'],
    colors: ['deep blue', 'turquoise', 'bioluminescent green', 'silver'],
    role: true,
    people: ['myself', 'merpeople'],
    places: ['deep ocean', 'underwater city'],
    things: ['bioluminescent creatures', 'crystal clear water'],
    type: 'sweet'
  },
  {
    title: 'Time Travel Mishap',
    content: 'I accidentally traveled back to the 1920s and had to blend in with the crowd. I was wearing modern clothes and everyone was staring at me. I tried to find a way back to the present.',
    date: new Date('2024-02-01'),
    isPublic: true,
    tags: ['time travel', '1920s', 'accident', 'blending in'],
    image: null,
    mood: 'Confusing',
    emotions: ['confusion', 'anxiety', 'amusement', 'panic'],
    colors: ['sepia', 'brown', 'black', 'white'],
    role: true,
    people: ['myself', '1920s crowd'],
    places: ['1920s street', 'past'],
    things: ['modern clothes', 'time machine'],
    type: 'sweet'
  },
  {
    title: 'Giant Robot Battle',
    content: 'I was piloting a giant robot in an epic battle against alien invaders. The robot was equipped with laser weapons and could transform into different forms. The battle took place in a futuristic city.',
    date: new Date('2024-02-05'),
    isPublic: true,
    tags: ['robot', 'battle', 'aliens', 'mecha'],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    mood: 'Exciting',
    emotions: ['excitement', 'determination', 'fear', 'heroism'],
    colors: ['metallic silver', 'red', 'blue', 'orange'],
    role: true,
    people: ['myself', 'alien invaders'],
    places: ['futuristic city', 'battlefield'],
    things: ['giant robot', 'laser weapons', 'alien ships'],
    type: 'sweet'
  },
  {
    title: 'Peaceful Garden Meditation',
    content: 'I was sitting in a beautiful zen garden, surrounded by cherry blossoms and a gentle stream. The air was filled with the sound of wind chimes and the scent of jasmine. I felt completely at peace.',
    date: new Date('2024-02-10'),
    isPublic: false,
    tags: ['meditation', 'zen', 'peace', 'nature'],
    image: null,
    mood: 'Peaceful',
    emotions: ['peace', 'serenity', 'contentment', 'tranquility'],
    colors: ['pink', 'green', 'white', 'soft blue'],
    role: true,
    people: ['myself'],
    places: ['zen garden', 'cherry blossom grove'],
    things: ['wind chimes', 'jasmine flowers', 'stream'],
    type: 'sweet'
  },
  {
    title: 'Space Station Life',
    content: 'I was living on a space station orbiting Earth. The view of our planet from space was breathtaking. I was working on scientific experiments and communicating with other astronauts.',
    date: new Date('2024-02-15'),
    isPublic: true,
    tags: ['space', 'station', 'astronaut', 'science'],
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop',
    mood: 'Wonder',
    emotions: ['awe', 'curiosity', 'isolation', 'achievement'],
    colors: ['black', 'blue', 'white', 'silver'],
    role: true,
    people: ['myself', 'other astronauts'],
    places: ['space station', 'orbit'],
    things: ['scientific equipment', 'Earth view', 'spacesuits'],
    type: 'sweet'
  },
  {
    title: 'Magical Forest Encounter',
    content: 'I was walking through an enchanted forest where the trees could talk and animals had human-like intelligence. I met a wise owl who gave me a magical map to hidden treasures.',
    date: new Date('2024-02-20'),
    isPublic: true,
    tags: ['magical', 'forest', 'animals', 'treasure'],
    image: null,
    mood: 'Curious',
    emotions: ['wonder', 'curiosity', 'magic', 'adventure'],
    colors: ['emerald green', 'golden yellow', 'brown', 'magical purple'],
    role: true,
    people: ['myself', 'wise owl'],
    places: ['enchanted forest', 'talking trees'],
    things: ['magical map', 'hidden treasures', 'talking animals'],
    type: 'sweet'
  },
  {
    title: 'Nightmare: Being Chased',
    content: 'I was being chased through a dark maze by shadowy figures. The corridors kept changing and I couldn\'t find the exit. I was terrified and running as fast as I could.',
    date: new Date('2024-02-25'),
    isPublic: false,
    tags: ['nightmare', 'chase', 'dark', 'fear'],
    image: null,
    mood: 'Scary',
    emotions: ['fear', 'panic', 'terror', 'desperation'],
    colors: ['black', 'dark gray', 'shadow'],
    role: true,
    people: ['myself', 'shadowy figures'],
    places: ['dark maze', 'changing corridors'],
    things: ['shadows', 'maze walls'],
    type: 'nightmare'
  },
  {
    title: 'Cooking Competition',
    content: 'I was participating in a high-stakes cooking competition. I had to create a masterpiece dish using unusual ingredients. The judges were famous chefs and the pressure was intense.',
    date: new Date('2024-03-01'),
    isPublic: true,
    tags: ['cooking', 'competition', 'chefs', 'pressure'],
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    mood: 'Exciting',
    emotions: ['excitement', 'pressure', 'creativity', 'determination'],
    colors: ['orange', 'red', 'yellow', 'green'],
    role: true,
    people: ['myself', 'famous chefs', 'competitors'],
    places: ['kitchen', 'competition venue'],
    things: ['cooking equipment', 'unusual ingredients', 'judges table'],
    type: 'sweet'
  },
  {
    title: 'Floating Islands',
    content: 'I was exploring floating islands in the sky, connected by rope bridges. Each island had a different ecosystem - one was a tropical paradise, another was a snowy mountain peak.',
    date: new Date('2024-03-05'),
    isPublic: true,
    tags: ['floating', 'islands', 'sky', 'ecosystems'],
    image: null,
    mood: 'Wonder',
    emotions: ['amazement', 'curiosity', 'adventure', 'wonder'],
    colors: ['sky blue', 'white', 'green', 'brown'],
    role: true,
    people: ['myself'],
    places: ['floating islands', 'sky', 'rope bridges'],
    things: ['rope bridges', 'tropical plants', 'snow'],
    type: 'sweet'
  },
  {
    title: 'Dream Within a Dream',
    content: 'I dreamed that I was dreaming, and in that dream I was trying to wake up. It was like being trapped in layers of reality. I kept "waking up" only to realize I was still dreaming.',
    date: new Date('2024-03-10'),
    isPublic: false,
    tags: ['meta', 'layers', 'reality', 'trapped'],
    image: null,
    mood: 'Confusing',
    emotions: ['confusion', 'frustration', 'disorientation', 'anxiety'],
    colors: ['faded', 'blurred', 'unclear'],
    role: true,
    people: ['myself'],
    places: ['dream layers', 'reality'],
    things: ['dream state', 'waking attempts'],
    type: 'sweet'
  },
  {
    title: 'Musical Performance',
    content: 'I was performing on stage in front of thousands of people, playing a magical instrument that could create any sound. The audience was completely mesmerized by the music.',
    date: new Date('2024-03-15'),
    isPublic: true,
    tags: ['music', 'performance', 'magical', 'audience'],
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    mood: 'Exciting',
    emotions: ['excitement', 'joy', 'nervousness', 'achievement'],
    colors: ['stage lights', 'golden', 'purple', 'blue'],
    role: true,
    people: ['myself', 'audience'],
    places: ['stage', 'concert hall'],
    things: ['magical instrument', 'stage lights', 'microphone'],
    type: 'sweet'
  },
  {
    title: 'Ancient Temple Discovery',
    content: 'I was exploring an ancient temple hidden in the jungle. The walls were covered in mysterious hieroglyphics and there were booby traps everywhere. I found a chamber with ancient artifacts.',
    date: new Date('2024-03-20'),
    isPublic: true,
    tags: ['ancient', 'temple', 'jungle', 'artifacts'],
    image: null,
    mood: 'Curious',
    emotions: ['curiosity', 'excitement', 'caution', 'discovery'],
    colors: ['stone gray', 'jungle green', 'golden', 'earth tones'],
    role: true,
    people: ['myself'],
    places: ['ancient temple', 'jungle', 'hidden chamber'],
    things: ['hieroglyphics', 'booby traps', 'ancient artifacts'],
    type: 'sweet'
  },
  {
    title: 'Flying with Dragons',
    content: 'I was riding on the back of a friendly dragon, soaring through the clouds. The dragon could breathe fire and we were exploring a world where dragons and humans lived together.',
    date: new Date('2024-03-25'),
    isPublic: true,
    tags: ['dragons', 'flying', 'fantasy', 'friendship'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    mood: 'Exciting',
    emotions: ['joy', 'excitement', 'friendship', 'freedom'],
    colors: ['dragon scales', 'sky blue', 'fire orange', 'cloud white'],
    role: true,
    people: ['myself', 'friendly dragon'],
    places: ['sky', 'clouds', 'dragon world'],
    things: ['dragon', 'fire breath', 'clouds'],
    type: 'sweet'
  },
  {
    title: 'Dream for This Month',
    content: 'A dream logged for the current month.',
    date: new Date(),
    isPublic: true,
    tags: ['test', 'current month'],
    mood: 'Exciting',
    emotions: ['joy'],
    colors: ['blue'],
    role: true,
    people: ['myself'],
    places: ['home'],
    things: ['bed'],
    type: 'sweet'
  }
];

async function populateFirebase() {
  try {
    console.log('🚀 Starting Firebase population...');
    console.log(`📝 User ID: ${USER_ID}`);
    console.log(`📊 Total dreams to create: ${testDreams.length}`);

    const createdDreams = [];
    const createdFavorites = [];
    const createdNotes = [];

    // Migration: set type: 'sweet' for any existing dreams not owned by USER_ID
    console.log('🔄 Migrating existing dreams to include randomized type where missing, and mapping legacy "normal" → "sweet"...');
    const allDreamsSnap = await getDocs(collection(db, 'dreams'));
    let migrated = 0;
    const TYPES = ['sweet', 'lucid', 'nightmare']
    for (const d of allDreamsSnap.docs) {
      const data = d.data();
      const currentType = data.type
      let nextType = currentType
      if (!currentType) {
        nextType = TYPES[Math.floor(Math.random() * TYPES.length)]
      } else if (currentType === 'normal') {
        nextType = 'sweet'
      }
      if (nextType !== currentType) {
        await updateDoc(doc(db, 'dreams', d.id), { type: nextType, updatedAt: serverTimestamp() })
        migrated++
      }
    }
    console.log(`✅ Migrated ${migrated} existing dreams to have a valid type`);

    // Create dreams
    for (const dreamData of testDreams) {
      console.log(`Creating dream: ${dreamData.title}`);
      const TYPES = ['sweet', 'lucid', 'nightmare']
      const randomType = TYPES[Math.floor(Math.random() * TYPES.length)]
      
      const dream = await addDoc(collection(db, 'dreams'), {
        ...dreamData,
        type: randomType,
        userId: USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      createdDreams.push({ id: dream.id, ...dreamData });

      // Create a favorite for each dream
      const favorite = await addDoc(collection(db, 'favorites'), {
        userId: USER_ID,
        dreamId: dream.id,
        createdAt: serverTimestamp()
      });
      createdFavorites.push(favorite);

      // Create a note for each dream
      const note = await addDoc(collection(db, 'notes'), {
        content: `Test note for dream: ${dreamData.title}`,
        dreamId: dream.id,
        userId: USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      createdNotes.push(note);

      console.log(`✅ Created dream, favorite, and note: ${dreamData.title}`);
    }

    console.log(`\n🎉 Successfully populated Firebase!`);
    console.log(`\n📊 Summary:`);
    console.log(`- User ID: ${USER_ID}`);
    console.log(`- Total Dreams: ${createdDreams.length}`);
    console.log(`- Public Dreams: ${createdDreams.filter(d => d.isPublic).length}`);
    console.log(`- Private Dreams: ${createdDreams.filter(d => !d.isPublic).length}`);
    console.log(`- Favorites Created: ${createdFavorites.length}`);
    console.log(`- Notes Created: ${createdNotes.length}`);
    
    console.log(`\n🏷️ Dream Categories:`);
    const tags = [...new Set(createdDreams.flatMap(d => d.tags))];
    console.log(`- Unique Tags: ${tags.length} (${tags.slice(0, 10).join(', ')}${tags.length > 10 ? '...' : ''})`);
    
    const moods = [...new Set(createdDreams.map(d => d.mood).filter(Boolean))];
    console.log(`- Moods: ${moods.join(', ')}`);
    
    const emotions = [...new Set(createdDreams.flatMap(d => d.emotions))];
    console.log(`- Emotions: ${emotions.slice(0, 10).join(', ')}${emotions.length > 10 ? '...' : ''}`);

    console.log(`\n🔗 View your dreams at: https://dream-speak.web.app/my-dreams`);

  } catch (error) {
    console.error('❌ Error populating Firebase:', error);
  }
}

populateFirebase(); 