require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const TeamRequest = require('./models/TeamRequest');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas for SST College Data...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Clearing previous data...');

    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();

    console.log('Creating official SST demo users...');

    // Organizer Account
    const organizer = await User.create({
      name: 'SST Event Council & Club Lead',
      email: 'events@sst.scaler.com',
      password: 'password123',
      role: 'organizer',
      rollNumber: 'ADMIN-01',
    });

    // Student 1 (24BCS Batch)
    const student1 = await User.create({
      name: 'Rudra Patel',
      email: 'rudra.24bcs10042@sst.scaler.com',
      password: 'password123',
      role: 'student',
      rollNumber: '24bcs10042',
    });

    // Student 2 (25BCS Batch)
    const student2 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.25bcs10018@sst.scaler.com',
      password: 'password123',
      role: 'student',
      rollNumber: '25bcs10018',
    });

    // Student 3 (26BCS Batch)
    const student3 = await User.create({
      name: 'Priya Verma',
      email: 'priya.26bcs10091@sst.scaler.com',
      password: 'password123',
      role: 'student',
      rollNumber: '26bcs10091',
    });

    console.log('Creating the 6 realistic SST campus events...');

    const events = await Event.create([
      {
        title: 'Inter Cricket Tournament 2026',
        description:
          'Annual Inter-College T20 cricket tournament. Featuring 8 knockout matches, professional leather balls, certified BCCI-level umpires, live campus score streaming, and trophies for Champions, Runners-up, and Player of the Tournament.',
        category: 'Sports',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // in 4 days
        time: '09:30 AM - 04:30 PM',
        venue: 'Main Sports Complex & Turf Cricket Ground',
        capacity: 120,
        registeredCount: 0,
        banner: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&auto=format&fit=crop&q=80',
        organizer: organizer._id,
        organizerName: 'SST Sports Committee',
        status: 'Upcoming',
      },
      {
        title: 'Diwali Carnival & New Campus Grand Opening',
        description:
          'Celebrate the grand inauguration of our new state-of-the-art campus together with the annual Diwali Carnival! Enjoy 25+ food and game stalls, traditional rangoli and diya competitions, live student band acoustic night, and a dazzling drone & laser light show.',
        category: 'Cultural',
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // in 6 days
        time: '04:00 PM - 10:00 PM',
        venue: 'Central Courtyard & New Campus Amphitheatre',
        capacity: 450,
        registeredCount: 0,
        banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&auto=format&fit=crop&q=80',
        organizer: organizer._id,
        organizerName: 'SST Student Affairs & Cultural Club',
        status: 'Upcoming',
      },
      {
        title: 'TinyFish Hackathon 2026',
        description:
          'The flagship 24-hour developer sprint powered by TinyFish! Build functional prototypes in Web Development, Agentic AI, and Systems Engineering. Free meals, Red Bull stations, 1-on-1 industry mentor sessions, and hiring fast-tracks.',
        category: 'Technical',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // in 8 days
        time: '10:00 AM - Overnight 24 Hrs',
        venue: 'Advanced Innovation Lab, Tech Block',
        capacity: 100,
        registeredCount: 0,
        banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop&q=80',
        organizer: organizer._id,
        organizerName: 'TinyFish Tech Community',
        status: 'Upcoming',
      },
      {
        title: 'Interhouse Kabaddi Tournament',
        description:
          'High-octane interhouse kabaddi championship on professional pro-mats. Thrilling super-raids, ankle holds, bonus point duels, and passionate house cheering. Medals and house points on the line!',
        category: 'Sports',
        date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), // in 11 days
        time: '03:00 PM - 07:00 PM',
        venue: 'Indoor Sports Arena, Mat Court 1',
        capacity: 150,
        registeredCount: 0,
        banner: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=900&auto=format&fit=crop&q=80',
        organizer: organizer._id,
        organizerName: 'Interhouse Sports Council',
        status: 'Upcoming',
      },
      {
        title: 'Inter-Batch Badminton Tournament',
        description:
          "Fast-paced knockout tournament featuring Men's & Women's Singles and Mixed Doubles across 24BCS, 25BCS, and 26BCS batches. Yonex feather shuttles, court referees, and championship trophies.",
        category: 'Sports',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
        time: '02:00 PM - 06:30 PM',
        venue: 'Campus Indoor Wooden Badminton Arena',
        capacity: 80,
        registeredCount: 0,
        banner: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&auto=format&fit=crop&q=80',
        organizer: organizer._id,
        organizerName: 'SST Badminton Club',
        status: 'Upcoming',
      },
      {
        title: 'Interhouse Fashion Show & Runway Gala',
        description:
          'The signature glamour night of the semester! Interhouse runway walk featuring three competitive themes: Indian Royal Heritage, Neo-Cyberpunk, and Sustainable Upcycled Couture. Professional stage lighting, DJ soundtrack, and student model choreography.',
        category: 'Cultural',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // in 18 days
        time: '05:30 PM - 09:30 PM',
        venue: 'Main Auditorium & Elevated Runway Stage',
        capacity: 300,
        registeredCount: 0,
        banner: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=900&auto=format&fit=crop&q=80',
        organizer: organizer._id,
        organizerName: 'SST Fashion & Arts Society',
        status: 'Upcoming',
      },
      {
        title: 'SST Battle Royale Championship: BGMI & Free Fire',
        description:
          'The ultimate campus mobile esports showdown! Featuring squad battle royale tournaments for Battlegrounds Mobile India (BGMI - Erangel & Miramar) and Free Fire MAX (Bermuda & Purgatory). Custom room matches, live projector shoutcasting, 120 FPS high-refresh tournament arena, anti-cheat refereeing, and massive cash pool & championship trophies for Winner Winner Chicken Dinner!',
        category: 'Sports',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // in 21 days
        time: '11:00 AM - 07:00 PM',
        venue: 'E-Sports Arena & Gaming Lounge, Student Activity Center',
        capacity: 100, // 25 squads of 4
        registeredCount: 0,
        banner: '/bgmi_freefire_banner.jpg',
        organizer: organizer._id,
        organizerName: 'SST Esports & Gaming Guild',
        status: 'Upcoming',
      },
    ]);

    console.log('Seeding demo SST student registrations...');

    // Rudra (student1) registers for TinyFish Hackathon & Inter Cricket
    await Registration.create({
      event: events[2]._id, // TinyFish Hackathon
      student: student1._id,
      ticketId: 'TKT-TF24-001',
      status: 'Registered',
    });
    await Event.findByIdAndUpdate(events[2]._id, { $inc: { registeredCount: 1 } });

    await Registration.create({
      event: events[0]._id, // Inter Cricket
      student: student1._id,
      ticketId: 'TKT-CR24-002',
      status: 'Registered',
    });
    await Event.findByIdAndUpdate(events[0]._id, { $inc: { registeredCount: 1 } });

    // Aarav (student2) registers for Diwali Carnival & Kabaddi
    await Registration.create({
      event: events[1]._id, // Diwali Carnival
      student: student2._id,
      ticketId: 'TKT-DC25-003',
      status: 'Registered',
    });
    await Event.findByIdAndUpdate(events[1]._id, { $inc: { registeredCount: 1 } });

    await Registration.create({
      event: events[3]._id, // Kabaddi
      student: student2._id,
      ticketId: 'TKT-KB25-004',
      status: 'Registered',
    });
    await Event.findByIdAndUpdate(events[3]._id, { $inc: { registeredCount: 1 } });

    // Priya (student3) registers for Fashion Show
    await Registration.create({
      event: events[5]._id, // Fashion Show
      student: student3._id,
      ticketId: 'TKT-FS26-005',
      status: 'Registered',
    });
    await Event.findByIdAndUpdate(events[5]._id, { $inc: { registeredCount: 1 } });

    console.log('Seeding demo squads for TinyFish & Cricket...');
    await TeamRequest.deleteMany();

    await TeamRequest.create([
      {
        event: events[2]._id, // TinyFish Hackathon
        creator: student1._id,
        teamName: 'Neural Pirates',
        description: 'Building an autonomous agentic research assistant for campus projects. Looking for 1 backend dev and 1 UI/UX designer from 24BCS or 25BCS.',
        rolesNeeded: ['FastAPI Backend', 'UI/UX Designer'],
        batchPreference: 'Any Batch',
        slotsTotal: 3,
        members: [student1._id],
        status: 'Open',
      },
      {
        event: events[0]._id, // Inter Cricket
        creator: student2._id,
        teamName: 'Scaler Super Kings',
        description: 'Inter-college cricket championship squad. Looking for opening batsman and wicketkeeper. Practice daily at 5 PM on turf ground.',
        rolesNeeded: ['Opening Batsman', 'Wicketkeeper'],
        batchPreference: '24BCS',
        slotsTotal: 4,
        members: [student2._id],
        status: 'Open',
      },
      {
        event: events[6]._id, // BGMI & Free Fire
        creator: student1._id,
        teamName: 'Soul Assassins',
        description: 'Hardcore Battle Royale squad for BGMI Erangel and Free Fire Bermuda. Looking for 1 aggressive Entry Fragger and 1 DMR Support sniper. Daily custom room scrims at 9 PM!',
        rolesNeeded: ['Assaulter / Entry Fragger', 'Sniper / DMR Support'],
        batchPreference: 'Any Batch',
        slotsTotal: 4,
        members: [student1._id],
        status: 'Open',
      },
    ]);

    console.log('==============================================');
    console.log('✅ SST DATABASE SUCCESSFULLY SEEDED!');
    console.log('Official SST Demo Credentials:');
    console.log('1. Student Account (24BCS):');
    console.log('   Email: rudra.24bcs10042@sst.scaler.com');
    console.log('   Roll:  24bcs10042');
    console.log('   Pass:  password123');
    console.log('2. Organizer / Admin Account:');
    console.log('   Email: events@sst.scaler.com');
    console.log('   Pass:  password123');
    console.log('6 Events created: Cricket, Diwali Carnival, TinyFish Hackathon, Kabaddi, Badminton, Fashion Show');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during SST Seeding:', error);
    process.exit(1);
  }
};

seedData();
