import { hash } from "bcrypt";
import { storage } from "./storage";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");
    
    const hashedPassword = await hash("password123", 10);
    
    // Check if users already exist
    const existingAdmin = await storage.getUserByEmail("admin@elite.com");
    const existingOwner = await storage.getUserByEmail("owner@elite.com");
    const existingUser = await storage.getUserByEmail("user@elite.com");
    
    let admin, owner, customer;
    
    if (!existingAdmin) {
      console.log("Creating admin user...");
      admin = await storage.createUser({
        email: "admin@elite.com",
        password: hashedPassword,
        name: "مدير النظام - Admin",
        phone: "+20 100 000 0001",
        role: "admin"
      });
      console.log("✅ Admin created:", admin.email);
    } else {
      admin = existingAdmin;
      console.log("✅ Admin already exists:", admin.email);
    }
    
    if (!existingOwner) {
      console.log("Creating restaurant owner...");
      owner = await storage.createUser({
        email: "owner@elite.com",
        password: hashedPassword,
        name: "صاحب المطعم - Owner",
        phone: "+20 100 000 0002",
        role: "restaurant_owner"
      });
      console.log("✅ Owner created:", owner.email);
    } else {
      owner = existingOwner;
      console.log("✅ Owner already exists:", owner.email);
    }
    
    if (!existingUser) {
      console.log("Creating customer user...");
      customer = await storage.createUser({
        email: "user@elite.com",
        password: hashedPassword,
        name: "أحمد محمد - Customer",
        phone: "+20 100 000 0003",
        role: "customer"
      });
      console.log("✅ Customer created:", customer.email);
    } else {
      customer = existingUser;
      console.log("✅ Customer already exists:", customer.email);
    }
    
    // Create more users
    const moreUsers = [
      { email: "customer1@example.com", name: "محمد علي", phone: "+20 100 111 1111", role: "customer" as const },
      { email: "customer2@example.com", name: "فاطمة أحمد", phone: "+20 100 222 2222", role: "customer" as const },
      { email: "customer3@example.com", name: "سارة حسن", phone: "+20 100 333 3333", role: "customer" as const },
      { email: "owner2@elite.com", name: "خالد إبراهيم - Owner", phone: "+20 100 444 4444", role: "restaurant_owner" as const },
      { email: "owner3@elite.com", name: "نور الدين - Owner", phone: "+20 100 555 5555", role: "restaurant_owner" as const },
    ];
    
    for (const userData of moreUsers) {
      const exists = await storage.getUserByEmail(userData.email);
      if (!exists) {
        await storage.createUser({ ...userData, password: hashedPassword });
        console.log(`✅ User created: ${userData.email}`);
      }
    }
    
    // Create Governorates
    console.log("\n📍 Creating governorates...");
    const existingGovs = await storage.getGovernorates();
    
    const govData = [
      { name: "Cairo", nameAr: "القاهرة" },
      { name: "Giza", nameAr: "الجيزة" },
      { name: "Alexandria", nameAr: "الإسكندرية" },
      { name: "Red Sea", nameAr: "البحر الأحمر" },
      { name: "South Sinai", nameAr: "جنوب سيناء" },
      { name: "Qalyubia", nameAr: "القليوبية" },
      { name: "Sharqia", nameAr: "الشرقية" },
      { name: "Dakahlia", nameAr: "الدقهلية" },
    ];
    
    const govs: any = {};
    for (const govInfo of govData) {
      let gov = existingGovs.find(g => g.name === govInfo.name);
      if (!gov) {
        gov = await storage.createGovernorate(govInfo);
        console.log(`✅ Governorate created: ${gov.name}`);
      }
      govs[govInfo.name] = gov;
    }
    
    // Create Districts
    console.log("\n📍 Creating districts...");
    const existingDistricts = await storage.getDistricts();
    
    const districtData = [
      // Cairo
      { govName: "Cairo", name: "Zamalek", nameAr: "الزمالك" },
      { govName: "Cairo", name: "Maadi", nameAr: "المعادي" },
      { govName: "Cairo", name: "Heliopolis", nameAr: "مصر الجديدة" },
      { govName: "Cairo", name: "New Cairo", nameAr: "القاهرة الجديدة" },
      { govName: "Cairo", name: "Garden City", nameAr: "جاردن سيتي" },
      { govName: "Cairo", name: "Downtown", nameAr: "وسط البلد" },
      { govName: "Cairo", name: "Nasr City", nameAr: "مدينة نصر" },
      
      // Giza
      { govName: "Giza", name: "Sheikh Zayed", nameAr: "الشيخ زايد" },
      { govName: "Giza", name: "6th of October", nameAr: "السادس من أكتوبر" },
      { govName: "Giza", name: "Dokki", nameAr: "الدقي" },
      { govName: "Giza", name: "Mohandessin", nameAr: "المهندسين" },
      { govName: "Giza", name: "Haram", nameAr: "الهرم" },
      
      // Alexandria
      { govName: "Alexandria", name: "San Stefano", nameAr: "سان ستيفانو" },
      { govName: "Alexandria", name: "Stanley", nameAr: "ستانلي" },
      { govName: "Alexandria", name: "Gleem", nameAr: "جليم" },
      { govName: "Alexandria", name: "Smouha", nameAr: "سموحة" },
      { govName: "Alexandria", name: "Miami", nameAr: "ميامي" },
      
      // Red Sea
      { govName: "Red Sea", name: "Hurghada", nameAr: "الغردقة" },
      { govName: "Red Sea", name: "El Gouna", nameAr: "الجونة" },
      
      // South Sinai
      { govName: "South Sinai", name: "Sharm El Sheikh", nameAr: "شرم الشيخ" },
      { govName: "South Sinai", name: "Dahab", nameAr: "دهب" },
    ];
    
    const districts: any = {};
    for (const distInfo of districtData) {
      const gov = govs[distInfo.govName];
      if (gov) {
        let dist = existingDistricts.find(d => d.name === distInfo.name && d.governorateId === gov.id);
        if (!dist) {
          dist = await storage.createDistrict({
            governorateId: gov.id,
            name: distInfo.name,
            nameAr: distInfo.nameAr
          });
          console.log(`✅ District created: ${dist.name}`);
        }
        districts[distInfo.name] = dist;
      }
    }
    
    // Create Restaurants
    console.log("\n🍽️  Creating restaurants...");
    const restaurants = await storage.getRestaurantsByOwner(owner.id);
    
    if (restaurants.length === 0) {
      const restaurantData = [
        {
          name: "Sequoia",
          cuisine: "Mediterranean & Oriental",
          description: "One of Cairo's most iconic restaurants on the Nile with stunning views and exceptional cuisine",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
          address: "53 Abu El Feda St, Zamalek",
          governorateId: govs.Cairo.id,
          districtId: districts.Zamalek.id,
          phone: "+20 2 2735 0014",
          email: "info@sequoiacairo.com",
          priceRange: "$$$$",
          status: "active" as const
        },
        {
          name: "Kazoku",
          cuisine: "Japanese Fine Dining",
          description: "Premium Japanese cuisine featuring fresh sushi, sashimi, and teppanyaki in an elegant setting",
          image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
          address: "Four Seasons Nile Plaza, Garden City",
          governorateId: govs.Cairo.id,
          districtId: districts["Garden City"].id,
          phone: "+20 2 2791 7000",
          email: "kazoku@fourseasons.com",
          priceRange: "$$$$",
          status: "active" as const
        },
        {
          name: "The Steakhouse",
          cuisine: "American Steakhouse",
          description: "Premium dry-aged steaks and classic American dishes in an elegant, upscale setting",
          image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
          address: "JW Marriott, Mirage City, New Cairo",
          governorateId: govs.Cairo.id,
          districtId: districts["New Cairo"].id,
          phone: "+20 2 2411 5588",
          email: "steakhouse@marriott.com",
          priceRange: "$$$$",
          status: "active" as const
        },
        {
          name: "Maison Thomas",
          cuisine: "Italian & Mediterranean",
          description: "Authentic Italian pizza and pasta since 1922, a Cairo institution loved by generations",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1481&q=80",
          address: "Arkan Mall, Sheikh Zayed",
          governorateId: govs.Giza.id,
          districtId: districts["Sheikh Zayed"].id,
          phone: "+20 2 3851 0000",
          email: "info@maisonthomas.com",
          priceRange: "$$$",
          status: "active" as const
        },
        {
          name: "Balbaa Village",
          cuisine: "Seafood & Grills",
          description: "Fresh seafood straight from the Mediterranean, grilled to perfection with Egyptian spices",
          image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
          address: "San Stefano Grand Plaza, Alexandria",
          governorateId: govs.Alexandria.id,
          districtId: districts["San Stefano"].id,
          phone: "+20 3 469 0000",
          email: "info@balbaavillage.com",
          priceRange: "$$$",
          status: "active" as const
        },
      ];
      
      for (const restData of restaurantData) {
        const restaurant = await storage.createRestaurant({ ...restData, ownerId: owner.id });
        console.log(`✅ Restaurant created: ${restaurant.name}`);
      }
    } else {
      console.log(`✅ ${restaurants.length} restaurants already exist`);
    }
    
    console.log("\n🎉 Database seed completed successfully!");
    console.log("\n📧 Test credentials:");
    console.log("Admin: admin@elite.com / password123");
    console.log("Owner: owner@elite.com / password123");
    console.log("User: user@elite.com / password123");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedDatabase();
