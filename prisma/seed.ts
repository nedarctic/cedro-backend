import 'dotenv/config';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
    console.log("Seed started");

    // clear tables (children first)
    await prisma.booking.deleteMany();
    await prisma.itinerary.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.section.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.user.deleteMany();

    // users
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    await prisma.user.create({
        data: {
            name: "John Doe",
            email: "john.doe@example.com",
            password: hashedPassword,
            role: UserRole.SUPER_ADMIN,
        }
    });

    // destinations
    const kenya = await prisma.destination.create({
        data: {
            name: "Kenya"
        }
    });
    const tanzania = await prisma.destination.create({
        data: {
            name: "Tanzania"
        }
    });

    // tours
    const maraTour = await prisma.tour.create({
        data: {
            destinationId: kenya.id,
            dates: 'Anytime',
            description: "Experience the wild thrill of the Mara",
            duration: "3 Days/ 2 Nights",
            groupSize: "14",
            price: "3450",
            title: "3-Day Maasai Mara Safari",
            activities: [
                "Bird watching",
                "Photography",
                "Game drives"
            ],
            included: [
                "Meals",
                "Accomodation",
                "Transport"
            ],
            excluded: [
                "Flights",
                "Travel insurance"
            ],
            tourImageKey: "tours/1780401381076-Masai Mara National Reserve.jpg",
            tourImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/tours/1780401381076-Masai%20Mara%20National%20Reserve.jpg"
        }
    });

    const watamuTour = await prisma.tour.create({
        data: {
            destinationId: kenya.id,
            dates: 'July - August',
            description: "An unforgettable tour at Watamu and its environs",
            duration: "5 Days/ 4 Nights",
            groupSize: "3",
            price: "2000",
            title: "Luxury Rewind at the Watamu",
            activities: [
                "Sun bathing",
                "Scuba diving",
                "Fish spotting"
            ],
            included: [
                "Meals",
                "Accomodation",
                "Transport"
            ],
            excluded: [
                "Flights",
                "Travel insurance"
            ],
            tourImageKey: "tours/1780985618226-Watamu Marine National Park.jpg",
            tourImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/tours/1780985618226-Watamu%20Marine%20National%20Park.jpg"
        }
    });

    // itineraries
    await prisma.itinerary.createMany({
        data: [
            {
                day: "Day 1",
                subtitle: "Arrival and evening game drive",
                tourId: maraTour.id,
                activities: [
                    "Arrival at camp",
                    "Evening game drive",
                    "Sundowner by the river"
                ],
                itineraryImageKey: "itineraries/marait1.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/marait1.jpg"
            },
            {
                day: "Day 2",
                subtitle: "Full-day Maasai Mara exploration",
                tourId: maraTour.id,
                activities: [
                    "Morning game drive",
                    "Picnic lunch in the bush",
                    "Visit Maasai village"
                ],
                itineraryImageKey: "itineraries/marait2.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/marait3.jpg"
            },
            {
                day: "Day 3",
                subtitle: "Wildlife morning and departure",
                tourId: maraTour.id,
                activities: [
                    "Early morning safari",
                    "Brunch at camp",
                    "Checkout and transfer"
                ],
                itineraryImageKey: "itineraries/marait3.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/marait3.jpg"
            },
        ]
    });

    await prisma.itinerary.createMany({
        data: [
            {
                day: "Day 1",
                subtitle: "Coastal welcome and sunset beach",
                tourId: watamuTour.id,
                activities: [
                    "Arrival and beach walk",
                    "Welcome briefing",
                    "Sunset dinner"
                ],
                itineraryImageKey: "itineraries/watamuit1.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/watamuit1.jpg"
            },
            {
                day: "Day 2",
                subtitle: "Marine park snorkeling and relaxation",
                tourId: watamuTour.id,
                activities: [
                    "Snorkeling in the marine park",
                    "Glass-bottom boat tour",
                    "Relax on Turtle Bay beach"
                ],
                itineraryImageKey: "itineraries/watamuit2.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/watamuit2.jpg"
            },
            {
                day: "Day 3",
                subtitle: "Culture and coastal leisure",
                tourId: watamuTour.id,
                activities: [
                    "Visit local village",
                    "Lunch at a seaside restaurant",
                    "Swimming and leisure"
                ],
                itineraryImageKey: "itineraries/watamuit3.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/watamuit3.jpg"
            },
            {
                day: "Day 4",
                subtitle: "Reef diving and beach time",
                tourId: watamuTour.id,
                activities: [
                    "Scuba dive or snorkeling",
                    "Beach time",
                    "Sunset cruise"
                ],
                itineraryImageKey: "itineraries/watamuit4.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/watamuit4.jpg"
            },
            {
                day: "Day 5",
                subtitle: "Departure after coastal breakfast",
                tourId: watamuTour.id,
                activities: [
                    "Breakfast by the ocean",
                    "Pack and check out",
                    "Transfer to airport"
                ],
                itineraryImageKey: "itineraries/watamuit5.jpg",
                itineraryImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/itineraries/watamuit5.jpg"
            },
        ]
    })

    // booking
    await prisma.booking.createMany({
        data: [
            {
                name: "Alice",
                email: "alice@email.com",
                tourId: maraTour.id,
            },
            {
                name: "Bob",
                email: "bob@email.com",
                tourId: maraTour.id,
            },
            {
                name: "Jane",
                email: "jane@email.com",
                tourId: watamuTour.id,
            },
            {
                name: "George",
                email: "george@email.com",
                tourId: watamuTour.id,
            },
        ]
    });

    // blog
    const blog1 = await prisma.blog.create({
        data: {
            title: "Safari Stories from the Mara",
            intro: "Discover the wonder of East African wildlife with our curated Maasai Mara experience.",
            conclusion: "Bring your adventure to life with a tour that blends wildlife, culture, and unforgettable memories.",
            blogImageKey: "blogs/1780339154056-Maasai Mara.jpg",
            blogImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/blogs/1780339154056-Maasai%20Mara.jpg"
        }
    });

    // sections
    await prisma.section.createMany({
        data: [
            {
                blogId: blog1.id,
                section: "1",
                subtitle: "Arrival at the Mara",
                content: "Touch down in Nairobi and travel deep into the Maasai Mara, where open plains and golden sunsets welcome you.",
                sectionImageKey: "blogs/sections/maraelephant.jpg",
                sectionImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/blogs/sections/maraelephant.jpg"
            },
            {
                blogId: blog1.id,
                section: "2",
                subtitle: "Early Morning Game Drive",
                content: "Rise before dawn for a game drive that brings you face-to-face with lions, elephants, and grazing herds.",
                sectionImageKey: "blogs/sections/marasunset.jpg",
                sectionImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/blogs/sections/marasunset.jpg"
            },
            {
                blogId: blog1.id,
                section: "3",
                subtitle: "Cultural Visit with the Maasai",
                content: "Meet local Maasai guides, learn about their traditions, and discover how conservation shapes their way of life.",
                sectionImageKey: "blogs/sections/maraballoons.jpg",
                sectionImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/blogs/sections/maraballoons.jpg"
            },
            {
                blogId: blog1.id,
                section: "4",
                subtitle: "River Crossing and Wildlife",
                content: "Watch the dramatic river crossings and search for hippos, crocodiles, and birdlife along the Mara River.",
                sectionImageKey: "blogs/sections/maragiraffes.jpg",
                sectionImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/blogs/sections/maragiraffes.jpg"
            },
            {
                blogId: blog1.id,
                section: "5",
                subtitle: "Camp Comforts and Sunset Views",
                content: "Relax in comfortable camp accommodations while evening skies fill with color over the endless savanna.",
                sectionImageKey: "blogs/sections/maratriangle.jpg",
                sectionImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/blogs/sections/maratriangle.jpg"
            },
            {
                blogId: blog1.id,
                section: "6",
                subtitle: "Journey Home",
                content: "Carry unforgettable memories home after a final breakfast and a gentle farewell to the Mara.",
                sectionImageKey: "blogs/sections/maracheetah.jpg",
                sectionImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/blogs/sections/maracheetah.jpg"
            },
        ]
    });

    // team members
    await prisma.teamMember.createMany({
        data: [
            {
                name: "John Doe",
                designation: "Founder & CEO",
                description: "Leads the company with a strong vision for sustainable travel and a commitment to authentic African adventures.",
                memberImageKey: "members/johndoe.jpg",
                memberImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/members/johndoe.jpg"
            },
            {
                name: "Gladys Thorne",
                designation: "Operations Director",
                description: "Oversees daily operations and ensures every adventure is seamless from booking to return.",
                memberImageKey: "members/gladys.jpg",
                memberImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/members/gladys.jpg"
            },
            {
                name: "Jared Bone",
                designation: "Head Guide",
                description: "A wildlife expert with years of Mara experience, dedicated to safe and unforgettable game drives.",
                memberImageKey: "members/jared.jpg",
                memberImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/members/jared.jpg"
            },
            {
                name: "Joy Shumway",
                designation: "Guest Relations Manager",
                description: "Welcomes travelers with personalized support and keeps every stay comfortable and memorable.",
                memberImageKey: "members/joy.jpg",
                memberImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/members/joy.jpg"
            },
            {
                name: "Lydia Fielding",
                designation: "Marketing Lead",
                description: "Crafts compelling itineraries and shares the story of each destination with passion and precision.",
                memberImageKey: "members/lydia.jpg",
                memberImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/members/lydia.jpg"
            },
            {
                name: "Sam Kirkman",
                designation: "Logistics Coordinator",
                description: "Handles transport and accommodation logistics to keep every journey running smoothly.",
                memberImageKey: "members/sam.jpg",
                memberImageUrl: "https://pub-5cee8e6d1a574b6c84697dfdb9beba4a.r2.dev/members/sam.jpg"
            },
        ]
    });
}

main()
    .catch(e => {
        console.error('An error occurred during seeding:', e.message);
        process.exit();
    })
    .finally(async () => {
        console.log("Seed successful!")
        await prisma.$disconnect()
    });