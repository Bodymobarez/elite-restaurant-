import { User, Coffee, TrendingUp, Users, Settings, Menu, Calendar, DollarSign, ShoppingBag, Star, Clock } from "lucide-react";

// Mock Data for Elite Hub

// ============================================
// USERS
// ============================================

export const currentUser = {
  id: "1",
  name: "Admin User",
  email: "admin@eliteeats.com",
  role: "admin", // 'admin' | 'restaurant_owner' | 'customer'
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  phone: "+20 100 123 4567",
  createdAt: "2024-01-15"
};

export const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@eliteeats.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    phone: "+20 100 123 4567",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "أحمد محمود",
    email: "ahmed@example.com",
    role: "customer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    phone: "+20 101 234 5678",
    createdAt: "2024-02-20"
  },
  {
    id: "3",
    name: "فاطمة حسن",
    email: "fatma@example.com",
    role: "customer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    phone: "+20 102 345 6789",
    createdAt: "2024-03-10"
  },
  {
    id: "4",
    name: "محمد علي",
    email: "mohamed@restaurant.com",
    role: "restaurant_owner",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    phone: "+20 103 456 7890",
    createdAt: "2024-01-20"
  },
  {
    id: "5",
    name: "سارة إبراهيم",
    email: "sara@restaurant.com",
    role: "restaurant_owner",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    phone: "+20 104 567 8901",
    createdAt: "2024-01-25"
  }
];

// ============================================
// GOVERNORATES & DISTRICTS
// ============================================

export const mockGovernorates = [
  { id: "gov-1", name: "Cairo", nameAr: "القاهرة" },
  { id: "gov-2", name: "Giza", nameAr: "الجيزة" },
  { id: "gov-3", name: "Alexandria", nameAr: "الإسكندرية" },
  { id: "gov-4", name: "Qalyubia", nameAr: "القليوبية" },
  { id: "gov-5", name: "Sharqia", nameAr: "الشرقية" },
  { id: "gov-6", name: "Dakahlia", nameAr: "الدقهلية" },
  { id: "gov-7", name: "Beheira", nameAr: "البحيرة" },
  { id: "gov-8", name: "Gharbia", nameAr: "الغربية" },
  { id: "gov-9", name: "Monufia", nameAr: "المنوفية" },
  { id: "gov-10", name: "Kafr El Sheikh", nameAr: "كفر الشيخ" },
  { id: "gov-11", name: "Damietta", nameAr: "دمياط" },
  { id: "gov-12", name: "Port Said", nameAr: "بورسعيد" },
  { id: "gov-13", name: "Ismailia", nameAr: "الإسماعيلية" },
  { id: "gov-14", name: "Suez", nameAr: "السويس" },
  { id: "gov-15", name: "North Sinai", nameAr: "شمال سيناء" },
  { id: "gov-16", name: "South Sinai", nameAr: "جنوب سيناء" },
  { id: "gov-17", name: "Fayoum", nameAr: "الفيوم" },
  { id: "gov-18", name: "Beni Suef", nameAr: "بني سويف" },
  { id: "gov-19", name: "Minya", nameAr: "المنيا" },
  { id: "gov-20", name: "Assiut", nameAr: "أسيوط" },
  { id: "gov-21", name: "Sohag", nameAr: "سوهاج" },
  { id: "gov-22", name: "Qena", nameAr: "قنا" },
  { id: "gov-23", name: "Luxor", nameAr: "الأقصر" },
  { id: "gov-24", name: "Aswan", nameAr: "أسوان" },
  { id: "gov-25", name: "Red Sea", nameAr: "البحر الأحمر" },
  { id: "gov-26", name: "New Valley", nameAr: "الوادي الجديد" },
  { id: "gov-27", name: "Matrouh", nameAr: "مطروح" },
];

export const mockDistricts = [
  // Cairo Districts (القاهرة)
  { id: "dist-1", governorateId: "gov-1", name: "Nasr City", nameAr: "مدينة نصر" },
  { id: "dist-2", governorateId: "gov-1", name: "Heliopolis", nameAr: "مصر الجديدة" },
  { id: "dist-3", governorateId: "gov-1", name: "Maadi", nameAr: "المعادي" },
  { id: "dist-4", governorateId: "gov-1", name: "Zamalek", nameAr: "الزمالك" },
  { id: "dist-5", governorateId: "gov-1", name: "Downtown", nameAr: "وسط البلد" },
  { id: "dist-6", governorateId: "gov-1", name: "New Cairo", nameAr: "القاهرة الجديدة" },
  { id: "dist-7", governorateId: "gov-1", name: "Fifth Settlement", nameAr: "التجمع الخامس" },
  { id: "dist-8", governorateId: "gov-1", name: "Shorouk", nameAr: "الشروق" },
  { id: "dist-9", governorateId: "gov-1", name: "Rehab", nameAr: "الرحاب" },
  { id: "dist-10", governorateId: "gov-1", name: "Garden City", nameAr: "جاردن سيتي" },
  { id: "dist-11", governorateId: "gov-1", name: "Mokattam", nameAr: "المقطم" },
  { id: "dist-12", governorateId: "gov-1", name: "Ain Shams", nameAr: "عين شمس" },
  { id: "dist-13", governorateId: "gov-1", name: "Shubra", nameAr: "شبرا" },
  { id: "dist-14", governorateId: "gov-1", name: "Rod El Farag", nameAr: "روض الفرج" },
  { id: "dist-15", governorateId: "gov-1", name: "Hadayek El Kobba", nameAr: "حدائق القبة" },
  { id: "dist-16", governorateId: "gov-1", name: "Manial", nameAr: "المنيل" },
  { id: "dist-17", governorateId: "gov-1", name: "Sayeda Zeinab", nameAr: "السيدة زينب" },
  { id: "dist-18", governorateId: "gov-1", name: "Dar El Salam", nameAr: "دار السلام" },
  { id: "dist-19", governorateId: "gov-1", name: "Basateen", nameAr: "البساتين" },
  { id: "dist-20", governorateId: "gov-1", name: "15 May City", nameAr: "مدينة 15 مايو" },
  
  // Giza Districts (الجيزة)
  { id: "dist-21", governorateId: "gov-2", name: "Dokki", nameAr: "الدقي" },
  { id: "dist-22", governorateId: "gov-2", name: "Mohandessin", nameAr: "المهندسين" },
  { id: "dist-23", governorateId: "gov-2", name: "6th of October", nameAr: "السادس من أكتوبر" },
  { id: "dist-24", governorateId: "gov-2", name: "Sheikh Zayed", nameAr: "الشيخ زايد" },
  { id: "dist-25", governorateId: "gov-2", name: "Agouza", nameAr: "العجوزة" },
  { id: "dist-26", governorateId: "gov-2", name: "Haram", nameAr: "الهرم" },
  { id: "dist-27", governorateId: "gov-2", name: "Faisal", nameAr: "فيصل" },
  { id: "dist-28", governorateId: "gov-2", name: "Hadayek El Ahram", nameAr: "حدائق الأهرام" },
  { id: "dist-29", governorateId: "gov-2", name: "Imbaba", nameAr: "إمبابة" },
  { id: "dist-30", governorateId: "gov-2", name: "Boulaq El Dakrour", nameAr: "بولاق الدكرور" },
  { id: "dist-31", governorateId: "gov-2", name: "Warraq", nameAr: "الوراق" },
  { id: "dist-32", governorateId: "gov-2", name: "Kit Kat", nameAr: "كيت كات" },
  { id: "dist-33", governorateId: "gov-2", name: "Saft El Laban", nameAr: "صفط اللبن" },
  { id: "dist-34", governorateId: "gov-2", name: "Awsim", nameAr: "أوسيم" },
  { id: "dist-35", governorateId: "gov-2", name: "Badrasheen", nameAr: "البدرشين" },
  { id: "dist-36", governorateId: "gov-2", name: "Atfeeh", nameAr: "العياط" },
  
  // Alexandria Districts (الإسكندرية)
  { id: "dist-37", governorateId: "gov-3", name: "Smouha", nameAr: "سموحة" },
  { id: "dist-38", governorateId: "gov-3", name: "Miami", nameAr: "ميامي" },
  { id: "dist-39", governorateId: "gov-3", name: "Stanley", nameAr: "ستانلي" },
  { id: "dist-40", governorateId: "gov-3", name: "San Stefano", nameAr: "سان ستيفانو" },
  { id: "dist-41", governorateId: "gov-3", name: "Sporting", nameAr: "سبورتنج" },
  { id: "dist-42", governorateId: "gov-3", name: "Sidi Gaber", nameAr: "سيدي جابر" },
  { id: "dist-43", governorateId: "gov-3", name: "Raml Station", nameAr: "محطة الرمل" },
  { id: "dist-44", governorateId: "gov-3", name: "Gleem", nameAr: "جليم" },
  { id: "dist-45", governorateId: "gov-3", name: "Camp Shezar", nameAr: "كامب شيزار" },
  { id: "dist-46", governorateId: "gov-3", name: "Rushdy", nameAr: "رشدي" },
  { id: "dist-47", governorateId: "gov-3", name: "Cleopatra", nameAr: "كليوباترا" },
  { id: "dist-48", governorateId: "gov-3", name: "Sidi Bishr", nameAr: "سيدي بشر" },
  { id: "dist-49", governorateId: "gov-3", name: "Montaza", nameAr: "المنتزه" },
  { id: "dist-50", governorateId: "gov-3", name: "Mandara", nameAr: "المندرة" },
  { id: "dist-51", governorateId: "gov-3", name: "Asafra", nameAr: "العصافرة" },
  { id: "dist-52", governorateId: "gov-3", name: "Abou Qir", nameAr: "أبو قير" },
  { id: "dist-53", governorateId: "gov-3", name: "Amreya", nameAr: "العامرية" },
  { id: "dist-54", governorateId: "gov-3", name: "Borg El Arab", nameAr: "برج العرب" },
  
  // Qalyubia Districts (القليوبية)
  { id: "dist-55", governorateId: "gov-4", name: "Banha", nameAr: "بنها" },
  { id: "dist-56", governorateId: "gov-4", name: "Qalyub", nameAr: "قليوب" },
  { id: "dist-57", governorateId: "gov-4", name: "Shubra El Kheima", nameAr: "شبرا الخيمة" },
  { id: "dist-58", governorateId: "gov-4", name: "Obour City", nameAr: "مدينة العبور" },
  { id: "dist-59", governorateId: "gov-4", name: "Khanka", nameAr: "الخانكة" },
  { id: "dist-60", governorateId: "gov-4", name: "Shebin El Qanater", nameAr: "شبين القناطر" },
  { id: "dist-61", governorateId: "gov-4", name: "Kafr Shukr", nameAr: "كفر شكر" },
  { id: "dist-62", governorateId: "gov-4", name: "Toukh", nameAr: "طوخ" },
  { id: "dist-63", governorateId: "gov-4", name: "Qaha", nameAr: "قها" },
  
  // Sharqia Districts (الشرقية)
  { id: "dist-64", governorateId: "gov-5", name: "Zagazig", nameAr: "الزقازيق" },
  { id: "dist-65", governorateId: "gov-5", name: "10th of Ramadan City", nameAr: "مدينة العاشر من رمضان" },
  { id: "dist-66", governorateId: "gov-5", name: "Bilbeis", nameAr: "بلبيس" },
  { id: "dist-67", governorateId: "gov-5", name: "Minya El Qamh", nameAr: "منيا القمح" },
  { id: "dist-68", governorateId: "gov-5", name: "Abu Hammad", nameAr: "أبو حماد" },
  { id: "dist-69", governorateId: "gov-5", name: "Faqous", nameAr: "فاقوس" },
  { id: "dist-70", governorateId: "gov-5", name: "Kafr Saqr", nameAr: "كفر صقر" },
  { id: "dist-71", governorateId: "gov-5", name: "Hehya", nameAr: "ههيا" },
  
  // Dakahlia Districts (الدقهلية)
  { id: "dist-72", governorateId: "gov-6", name: "Mansoura", nameAr: "المنصورة" },
  { id: "dist-73", governorateId: "gov-6", name: "Talkha", nameAr: "طلخا" },
  { id: "dist-74", governorateId: "gov-6", name: "Mit Ghamr", nameAr: "ميت غمر" },
  { id: "dist-75", governorateId: "gov-6", name: "Dekernes", nameAr: "دكرنس" },
  { id: "dist-76", governorateId: "gov-6", name: "Aga", nameAr: "أجا" },
  { id: "dist-77", governorateId: "gov-6", name: "Manzala", nameAr: "المنزلة" },
  { id: "dist-78", governorateId: "gov-6", name: "Belqas", nameAr: "بلقاس" },
  { id: "dist-79", governorateId: "gov-6", name: "Gamasa", nameAr: "جمصة" },
  
  // Beheira Districts (البحيرة)
  { id: "dist-80", governorateId: "gov-7", name: "Damanhour", nameAr: "دمنهور" },
  { id: "dist-81", governorateId: "gov-7", name: "Kafr El Dawwar", nameAr: "كفر الدوار" },
  { id: "dist-82", governorateId: "gov-7", name: "Rashid", nameAr: "رشيد" },
  { id: "dist-83", governorateId: "gov-7", name: "Edko", nameAr: "إدكو" },
  { id: "dist-84", governorateId: "gov-7", name: "Abu Hummus", nameAr: "أبو حمص" },
  { id: "dist-85", governorateId: "gov-7", name: "Kom Hamada", nameAr: "كوم حمادة" },
  { id: "dist-86", governorateId: "gov-7", name: "Hosh Issa", nameAr: "حوش عيسى" },
  
  // Gharbia Districts (الغربية)
  { id: "dist-87", governorateId: "gov-8", name: "Tanta", nameAr: "طنطا" },
  { id: "dist-88", governorateId: "gov-8", name: "Mahalla El Kubra", nameAr: "المحلة الكبرى" },
  { id: "dist-89", governorateId: "gov-8", name: "Kafr El Zayat", nameAr: "كفر الزيات" },
  { id: "dist-90", governorateId: "gov-8", name: "Zefta", nameAr: "زفتى" },
  { id: "dist-91", governorateId: "gov-8", name: "Samanoud", nameAr: "السنطة" },
  { id: "dist-92", governorateId: "gov-8", name: "Basyoun", nameAr: "بسيون" },
  { id: "dist-93", governorateId: "gov-8", name: "Qutour", nameAr: "قطور" },
  
  // Monufia Districts (المنوفية)
  { id: "dist-94", governorateId: "gov-9", name: "Shebin El Kom", nameAr: "شبين الكوم" },
  { id: "dist-95", governorateId: "gov-9", name: "Menouf", nameAr: "منوف" },
  { id: "dist-96", governorateId: "gov-9", name: "Ashmoun", nameAr: "أشمون" },
  { id: "dist-97", governorateId: "gov-9", name: "Quesna", nameAr: "قويسنا" },
  { id: "dist-98", governorateId: "gov-9", name: "Birket El Sab", nameAr: "بركة السبع" },
  { id: "dist-99", governorateId: "gov-9", name: "Tala", nameAr: "تلا" },
  { id: "dist-100", governorateId: "gov-9", name: "Sers El Lyan", nameAr: "سرس الليان" },
  
  // Kafr El Sheikh Districts (كفر الشيخ)
  { id: "dist-101", governorateId: "gov-10", name: "Kafr El Sheikh", nameAr: "كفر الشيخ" },
  { id: "dist-102", governorateId: "gov-10", name: "Desouk", nameAr: "دسوق" },
  { id: "dist-103", governorateId: "gov-10", name: "Metoubes", nameAr: "مطوبس" },
  { id: "dist-104", governorateId: "gov-10", name: "Fuwwah", nameAr: "فوه" },
  { id: "dist-105", governorateId: "gov-10", name: "Baltim", nameAr: "بلطيم" },
  { id: "dist-106", governorateId: "gov-10", name: "Sidi Salem", nameAr: "سيدي سالم" },
  { id: "dist-107", governorateId: "gov-10", name: "Qallin", nameAr: "قلين" },
  
  // Damietta Districts (دمياط)
  { id: "dist-108", governorateId: "gov-11", name: "Damietta", nameAr: "دمياط" },
  { id: "dist-109", governorateId: "gov-11", name: "New Damietta", nameAr: "دمياط الجديدة" },
  { id: "dist-110", governorateId: "gov-11", name: "Ras El Bar", nameAr: "رأس البر" },
  { id: "dist-111", governorateId: "gov-11", name: "Faraskur", nameAr: "فارسكور" },
  { id: "dist-112", governorateId: "gov-11", name: "Zarqa", nameAr: "الزرقا" },
  { id: "dist-113", governorateId: "gov-11", name: "Kafr Saad", nameAr: "كفر سعد" },
  
  // Port Said Districts (بورسعيد)
  { id: "dist-114", governorateId: "gov-12", name: "Port Said", nameAr: "بورسعيد" },
  { id: "dist-115", governorateId: "gov-12", name: "Port Fouad", nameAr: "بورفؤاد" },
  { id: "dist-116", governorateId: "gov-12", name: "Al Arab", nameAr: "العرب" },
  { id: "dist-117", governorateId: "gov-12", name: "Al Manakh", nameAr: "المناخ" },
  { id: "dist-118", governorateId: "gov-12", name: "Al Zohour", nameAr: "الزهور" },
  
  // Ismailia Districts (الإسماعيلية)
  { id: "dist-119", governorateId: "gov-13", name: "Ismailia", nameAr: "الإسماعيلية" },
  { id: "dist-120", governorateId: "gov-13", name: "Fayed", nameAr: "فايد" },
  { id: "dist-121", governorateId: "gov-13", name: "Qantara Sharq", nameAr: "القنطرة شرق" },
  { id: "dist-122", governorateId: "gov-13", name: "Qantara Gharb", nameAr: "القنطرة غرب" },
  { id: "dist-123", governorateId: "gov-13", name: "Tel El Kebir", nameAr: "التل الكبير" },
  { id: "dist-124", governorateId: "gov-13", name: "Abu Suwir", nameAr: "أبو صوير" },
  
  // Suez Districts (السويس)
  { id: "dist-125", governorateId: "gov-14", name: "Suez", nameAr: "السويس" },
  { id: "dist-126", governorateId: "gov-14", name: "Arbaeen", nameAr: "الأربعين" },
  { id: "dist-127", governorateId: "gov-14", name: "Attaka", nameAr: "عتاقة" },
  { id: "dist-128", governorateId: "gov-14", name: "Faisal", nameAr: "فيصل" },
  { id: "dist-129", governorateId: "gov-14", name: "Ganayen", nameAr: "الجناين" },
  
  // North Sinai Districts (شمال سيناء)
  { id: "dist-130", governorateId: "gov-15", name: "Arish", nameAr: "العريش" },
  { id: "dist-131", governorateId: "gov-15", name: "Sheikh Zuweid", nameAr: "الشيخ زويد" },
  { id: "dist-132", governorateId: "gov-15", name: "Rafah", nameAr: "رفح" },
  { id: "dist-133", governorateId: "gov-15", name: "Bir Al-Abed", nameAr: "بئر العبد" },
  { id: "dist-134", governorateId: "gov-15", name: "Hasana", nameAr: "الحسنة" },
  { id: "dist-135", governorateId: "gov-15", name: "Nakhl", nameAr: "نخل" },
  
  // South Sinai Districts (جنوب سيناء)
  { id: "dist-136", governorateId: "gov-16", name: "Sharm El Sheikh", nameAr: "شرم الشيخ" },
  { id: "dist-137", governorateId: "gov-16", name: "Dahab", nameAr: "دهب" },
  { id: "dist-138", governorateId: "gov-16", name: "Nuweiba", nameAr: "نويبع" },
  { id: "dist-139", governorateId: "gov-16", name: "Taba", nameAr: "طابا" },
  { id: "dist-140", governorateId: "gov-16", name: "Saint Catherine", nameAr: "سانت كاترين" },
  { id: "dist-141", governorateId: "gov-16", name: "Ras Sidr", nameAr: "رأس سدر" },
  { id: "dist-142", governorateId: "gov-16", name: "Abu Redis", nameAr: "أبو رديس" },
  { id: "dist-143", governorateId: "gov-16", name: "Tor", nameAr: "الطور" },
  
  // Fayoum Districts (الفيوم)
  { id: "dist-144", governorateId: "gov-17", name: "Fayoum", nameAr: "الفيوم" },
  { id: "dist-145", governorateId: "gov-17", name: "Ibshaway", nameAr: "إبشواي" },
  { id: "dist-146", governorateId: "gov-17", name: "Tamiya", nameAr: "طامية" },
  { id: "dist-147", governorateId: "gov-17", name: "Snores", nameAr: "سنورس" },
  { id: "dist-148", governorateId: "gov-17", name: "Itsa", nameAr: "إطسا" },
  { id: "dist-149", governorateId: "gov-17", name: "Yusuf El Sediaq", nameAr: "يوسف الصديق" },
  
  // Beni Suef Districts (بني سويف)
  { id: "dist-150", governorateId: "gov-18", name: "Beni Suef", nameAr: "بني سويف" },
  { id: "dist-151", governorateId: "gov-18", name: "New Beni Suef", nameAr: "بني سويف الجديدة" },
  { id: "dist-152", governorateId: "gov-18", name: "Beba", nameAr: "ببا" },
  { id: "dist-153", governorateId: "gov-18", name: "Fashn", nameAr: "الفشن" },
  { id: "dist-154", governorateId: "gov-18", name: "Ihnasya", nameAr: "إهناسيا" },
  { id: "dist-155", governorateId: "gov-18", name: "Somosta", nameAr: "سمسطا" },
  { id: "dist-156", governorateId: "gov-18", name: "Naser", nameAr: "ناصر" },
  
  // Minya Districts (المنيا)
  { id: "dist-157", governorateId: "gov-19", name: "Minya", nameAr: "المنيا" },
  { id: "dist-158", governorateId: "gov-19", name: "Mallawi", nameAr: "ملوي" },
  { id: "dist-159", governorateId: "gov-19", name: "Samalut", nameAr: "سمالوط" },
  { id: "dist-160", governorateId: "gov-19", name: "Matay", nameAr: "مطاي" },
  { id: "dist-161", governorateId: "gov-19", name: "Bani Mazar", nameAr: "بني مزار" },
  { id: "dist-162", governorateId: "gov-19", name: "Maghagha", nameAr: "مغاغة" },
  { id: "dist-163", governorateId: "gov-19", name: "Abu Qurqas", nameAr: "أبو قرقاص" },
  { id: "dist-164", governorateId: "gov-19", name: "Deir Mawas", nameAr: "دير مواس" },
  { id: "dist-165", governorateId: "gov-19", name: "ادfaw", nameAr: "العدوة" },
  
  // Assiut Districts (أسيوط)
  { id: "dist-166", governorateId: "gov-20", name: "Assiut", nameAr: "أسيوط" },
  { id: "dist-167", governorateId: "gov-20", name: "Abnub", nameAr: "أبنوب" },
  { id: "dist-168", governorateId: "gov-20", name: "Manfalut", nameAr: "منفلوط" },
  { id: "dist-169", governorateId: "gov-20", name: "Qusiya", nameAr: "القوصية" },
  { id: "dist-170", governorateId: "gov-20", name: "Abnoub", nameAr: "أبو تيج" },
  { id: "dist-171", governorateId: "gov-20", name: "Sahel Selim", nameAr: "ساحل سليم" },
  { id: "dist-172", governorateId: "gov-20", name: "El Badari", nameAr: "البداري" },
  { id: "dist-173", governorateId: "gov-20", name: "Dayrout", nameAr: "ديروط" },
  
  // Sohag Districts (سوهاج)
  { id: "dist-174", governorateId: "gov-21", name: "Sohag", nameAr: "سوهاج" },
  { id: "dist-175", governorateId: "gov-21", name: "Akhmim", nameAr: "أخميم" },
  { id: "dist-176", governorateId: "gov-21", name: "Girga", nameAr: "جرجا" },
  { id: "dist-177", governorateId: "gov-21", name: "Dar El Salam", nameAr: "دار السلام" },
  { id: "dist-178", governorateId: "gov-21", name: "Juhayna", nameAr: "جهينة" },
  { id: "dist-179", governorateId: "gov-21", name: "Tima", nameAr: "طما" },
  { id: "dist-180", governorateId: "gov-21", name: "Tahta", nameAr: "طهطا" },
  { id: "dist-181", governorateId: "gov-21", name: "El Maragha", nameAr: "المراغة" },
  
  // Qena Districts (قنا)
  { id: "dist-182", governorateId: "gov-22", name: "Qena", nameAr: "قنا" },
  { id: "dist-183", governorateId: "gov-22", name: "Qus", nameAr: "قوص" },
  { id: "dist-184", governorateId: "gov-22", name: "Nag Hammadi", nameAr: "نجع حمادي" },
  { id: "dist-185", governorateId: "gov-22", name: "Naqada", nameAr: "نقادة" },
  { id: "dist-186", governorateId: "gov-22", name: "Deshna", nameAr: "دشنا" },
  { id: "dist-187", governorateId: "gov-22", name: "Abu Tesht", nameAr: "أبو تشت" },
  { id: "dist-188", governorateId: "gov-22", name: "Farshut", nameAr: "فرشوط" },
  { id: "dist-189", governorateId: "gov-22", name: "Qeft", nameAr: "قفط" },
  
  // Luxor Districts (الأقصر)
  { id: "dist-190", governorateId: "gov-23", name: "Luxor", nameAr: "الأقصر" },
  { id: "dist-191", governorateId: "gov-23", name: "East Bank", nameAr: "البر الشرقي" },
  { id: "dist-192", governorateId: "gov-23", name: "West Bank", nameAr: "البر الغربي" },
  { id: "dist-193", governorateId: "gov-23", name: "Esna", nameAr: "إسنا" },
  { id: "dist-194", governorateId: "gov-23", name: "Armant", nameAr: "أرمنت" },
  { id: "dist-195", governorateId: "gov-23", name: "Karnak", nameAr: "الكرنك" },
  { id: "dist-196", governorateId: "gov-23", name: "New Tiba", nameAr: "طيبة الجديدة" },
  
  // Aswan Districts (أسوان)
  { id: "dist-197", governorateId: "gov-24", name: "Aswan", nameAr: "أسوان" },
  { id: "dist-198", governorateId: "gov-24", name: "Kom Ombo", nameAr: "كوم أمبو" },
  { id: "dist-199", governorateId: "gov-24", name: "Edfu", nameAr: "إدفو" },
  { id: "dist-200", governorateId: "gov-24", name: "Daraw", nameAr: "دراو" },
  { id: "dist-201", governorateId: "gov-24", name: "Nasr El Nuba", nameAr: "نصر النوبة" },
  { id: "dist-202", governorateId: "gov-24", name: "Abu Simbel", nameAr: "أبو سمبل" },
  { id: "dist-203", governorateId: "gov-24", name: "Kalabsha", nameAr: "كلابشة" },
  
  // Red Sea Districts (البحر الأحمر)
  { id: "dist-204", governorateId: "gov-25", name: "Hurghada", nameAr: "الغردقة" },
  { id: "dist-205", governorateId: "gov-25", name: "Safaga", nameAr: "سفاجا" },
  { id: "dist-206", governorateId: "gov-25", name: "El Gouna", nameAr: "الجونة" },
  { id: "dist-207", governorateId: "gov-25", name: "Quseer", nameAr: "القصير" },
  { id: "dist-208", governorateId: "gov-25", name: "Marsa Alam", nameAr: "مرسى علم" },
  { id: "dist-209", governorateId: "gov-25", name: "Ras Ghareb", nameAr: "رأس غارب" },
  { id: "dist-210", governorateId: "gov-25", name: "Shalatin", nameAr: "شلاتين" },
  { id: "dist-211", governorateId: "gov-25", name: "Halayeb", nameAr: "حلايب" },
  
  // New Valley Districts (الوادي الجديد)
  { id: "dist-212", governorateId: "gov-26", name: "Kharga", nameAr: "الخارجة" },
  { id: "dist-213", governorateId: "gov-26", name: "Dakhla", nameAr: "الداخلة" },
  { id: "dist-214", governorateId: "gov-26", name: "Farafra", nameAr: "الفرافرة" },
  { id: "dist-215", governorateId: "gov-26", name: "Paris", nameAr: "باريس" },
  { id: "dist-216", governorateId: "gov-26", name: "Balat", nameAr: "بلاط" },
  
  // Matrouh Districts (مطروح)
  { id: "dist-217", governorateId: "gov-27", name: "Marsa Matrouh", nameAr: "مرسى مطروح" },
  { id: "dist-218", governorateId: "gov-27", name: "El Alamein", nameAr: "العلمين" },
  { id: "dist-219", governorateId: "gov-27", name: "Sidi Barani", nameAr: "سيدي براني" },
  { id: "dist-220", governorateId: "gov-27", name: "Salloum", nameAr: "السلوم" },
  { id: "dist-221", governorateId: "gov-27", name: "Siwa", nameAr: "سيوة" },
  { id: "dist-222", governorateId: "gov-27", name: "Dabaa", nameAr: "الضبعة" },
  { id: "dist-223", governorateId: "gov-27", name: "Negila", nameAr: "النجيلة" },
];

// ============================================
// RESTAURANTS
// ============================================

export const restaurants = [
  {
    id: "1",
    ownerId: "4",
    name: "Lumière",
    nameAr: "لوميير",
    cuisine: "French Fine Dining",
    cuisineAr: "مطبخ فرنسي راقي",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    description: "Experience authentic French cuisine in an elegant atmosphere",
    descriptionAr: "استمتع بتجربة المطبخ الفرنسي الأصيل في أجواء راقية",
    address: "123 Nile St, Zamalek",
    addressAr: "123 شارع النيل، الزمالك",
    governorateId: "gov-1",
    districtId: "dist-4",
    phone: "+20 2 2735 1234",
    email: "info@lumiere-eg.com",
    priceRange: "$$$$",
    status: "active",
    openTime: "12:00",
    closeTime: "00:00",
    ordersToday: 24,
    revenueToday: 4250,
    totalOrders: 1245,
    totalRevenue: 156780,
    createdAt: "2024-01-20"
  },
  {
    id: "2",
    ownerId: "5",
    name: "Sakura Zen",
    nameAr: "ساكورا زن",
    cuisine: "Modern Japanese",
    cuisineAr: "مطبخ ياباني عصري",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    description: "Contemporary Japanese cuisine with traditional flavors",
    descriptionAr: "مطبخ ياباني معاصر مع نكهات تقليدية",
    address: "45 Ahmed Orabi St, Mohandessin",
    addressAr: "45 شارع أحمد عرابي، المهندسين",
    governorateId: "gov-2",
    districtId: "dist-8",
    phone: "+20 2 3345 5678",
    email: "contact@sakurazen.com",
    priceRange: "$$$",
    status: "active",
    openTime: "13:00",
    closeTime: "23:00",
    ordersToday: 18,
    revenueToday: 2800,
    totalOrders: 892,
    totalRevenue: 98450,
    createdAt: "2024-02-01"
  },
  {
    id: "3",
    ownerId: "4",
    name: "The Obsidian Steakhouse",
    nameAr: "أوبسيديان ستيك هاوس",
    cuisine: "Steakhouse",
    cuisineAr: "مطعم لحوم",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    description: "Premium steaks and finest cuts in elegant setting",
    descriptionAr: "أفخم أنواع اللحوم في أجواء راقية",
    address: "78 Road 90, New Cairo",
    addressAr: "78 طريق 90، القاهرة الجديدة",
    governorateId: "gov-1",
    districtId: "dist-6",
    phone: "+20 2 2617 8901",
    email: "info@obsidiansteakhouse.com",
    priceRange: "$$$$",
    status: "pending",
    openTime: "17:00",
    closeTime: "01:00",
    ordersToday: 0,
    revenueToday: 0,
    totalOrders: 0,
    totalRevenue: 0,
    createdAt: "2024-11-15"
  },
  {
    id: "4",
    ownerId: "5",
    name: "Mediterraneo",
    nameAr: "ميديترينيو",
    cuisine: "Mediterranean",
    cuisineAr: "مطبخ متوسطي",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    description: "Fresh Mediterranean dishes with a modern twist",
    descriptionAr: "أطباق متوسطية طازجة بلمسة عصرية",
    address: "12 Hassan Sabry St, Zamalek",
    addressAr: "12 شارع حسن صبري، الزمالك",
    governorateId: "gov-1",
    districtId: "dist-4",
    phone: "+20 2 2736 4567",
    email: "hello@mediterraneo.com",
    priceRange: "$$$",
    status: "active",
    openTime: "11:00",
    closeTime: "23:00",
    ordersToday: 15,
    revenueToday: 1850,
    totalOrders: 654,
    totalRevenue: 78900,
    createdAt: "2024-03-10"
  },
  {
    id: "5",
    ownerId: "4",
    name: "Spice Route",
    nameAr: "طريق التوابل",
    cuisine: "Indian",
    cuisineAr: "مطبخ هندي",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    description: "Authentic Indian flavors and aromatic spices",
    descriptionAr: "نكهات هندية أصيلة وتوابل عطرية",
    address: "34 Makram Ebeid St, Nasr City",
    addressAr: "34 شارع مكرم عبيد، مدينة نصر",
    governorateId: "gov-1",
    districtId: "dist-1",
    phone: "+20 2 2274 5678",
    email: "info@spiceroute.com",
    priceRange: "$$",
    status: "active",
    openTime: "12:00",
    closeTime: "23:30",
    ordersToday: 22,
    revenueToday: 1650,
    totalOrders: 1123,
    totalRevenue: 89340,
    createdAt: "2024-02-15"
  },
  {
    id: "6",
    ownerId: "5",
    name: "La Piazza",
    nameAr: "لا بيازا",
    cuisine: "Italian",
    cuisineAr: "مطبخ إيطالي",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    description: "Traditional Italian cuisine in cozy atmosphere",
    descriptionAr: "مطبخ إيطالي تقليدي في أجواء دافئة",
    address: "56 El Merghany St, Heliopolis",
    addressAr: "56 شارع المرغني، مصر الجديدة",
    governorateId: "gov-1",
    districtId: "dist-2",
    phone: "+20 2 2291 7890",
    email: "contact@lapiazza-eg.com",
    priceRange: "$$$",
    status: "active",
    openTime: "12:00",
    closeTime: "00:00",
    ordersToday: 19,
    revenueToday: 2340,
    totalOrders: 978,
    totalRevenue: 112450,
    createdAt: "2024-01-28"
  },
  {
    id: "7",
    ownerId: "4",
    name: "Sushi Master",
    nameAr: "سوشي ماستر",
    cuisine: "Japanese Sushi",
    cuisineAr: "سوشي ياباني",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    description: "Fresh sushi prepared by master chefs",
    descriptionAr: "سوشي طازج من إعداد طهاة محترفين",
    address: "23 Syria St, Mohandessin",
    addressAr: "23 شارع سوريا، المهندسين",
    governorateId: "gov-2",
    districtId: "dist-8",
    phone: "+20 2 3346 1234",
    email: "info@sushimaster.com",
    priceRange: "$$$$",
    status: "active",
    openTime: "13:00",
    closeTime: "23:00",
    ordersToday: 16,
    revenueToday: 3200,
    totalOrders: 745,
    totalRevenue: 134500,
    createdAt: "2024-03-05"
  },
  {
    id: "8",
    ownerId: "5",
    name: "Burger Junction",
    nameAr: "برجر جنكشن",
    cuisine: "American Burgers",
    cuisineAr: "برجر أمريكي",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1065&q=80",
    description: "Gourmet burgers with premium ingredients",
    descriptionAr: "برجر فاخر بمكونات عالية الجودة",
    address: "89 Road 9, Maadi",
    addressAr: "89 طريق 9، المعادي",
    governorateId: "gov-1",
    districtId: "dist-3",
    phone: "+20 2 2519 3456",
    email: "hello@burgerjunction.com",
    priceRange: "$$",
    status: "active",
    openTime: "11:00",
    closeTime: "00:00",
    ordersToday: 31,
    revenueToday: 2100,
    totalOrders: 1567,
    totalRevenue: 98700,
    createdAt: "2024-02-20"
  }
];

// ============================================
// MENU ITEMS
// ============================================

export const menuItems = [
  // Lumière (French)
  {
    id: "101",
    restaurantId: "1",
    name: "Truffle Risotto",
    nameAr: "ريزوتو بالكمأة",
    description: "Creamy arborio rice with black truffle",
    descriptionAr: "أرز أربوريو كريمي مع الكمأة السوداء",
    price: 450,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "102",
    restaurantId: "1",
    name: "Wagyu Beef Tartare",
    nameAr: "تارتار لحم واغيو",
    description: "Premium wagyu beef with capers and quail egg",
    descriptionAr: "لحم واغيو فاخر مع الكبر وبيض السمان",
    price: 380,
    category: "Starters",
    categoryAr: "المقبلات",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a3a27cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "103",
    restaurantId: "1",
    name: "Gold Leaf Chocolate Dome",
    nameAr: "قبة الشوكولاتة بورق الذهب",
    description: "Dark chocolate dome with gold leaf decoration",
    descriptionAr: "قبة شوكولاتة داكنة مزينة بورق الذهب",
    price: 320,
    category: "Desserts",
    categoryAr: "الحلويات",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1364&q=80",
    available: true
  },
  {
    id: "104",
    restaurantId: "1",
    name: "Lobster Thermidor",
    nameAr: "لوبستر ثيرميدور",
    description: "Classic French lobster in creamy sauce",
    descriptionAr: "لوبستر فرنسي كلاسيكي بصلصة كريمية",
    price: 650,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  
  // Sakura Zen (Japanese)
  {
    id: "201",
    restaurantId: "2",
    name: "Premium Sushi Platter",
    nameAr: "طبق سوشي فاخر",
    description: "Assorted fresh sushi with wasabi and soy",
    descriptionAr: "تشكيلة سوشي طازج مع الواسابي وصلصة الصويا",
    price: 280,
    category: "Sushi",
    categoryAr: "سوشي",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    available: true
  },
  {
    id: "202",
    restaurantId: "2",
    name: "Wagyu Beef Ramen",
    nameAr: "رامن لحم واغيو",
    description: "Rich broth with wagyu beef and soft egg",
    descriptionAr: "مرق غني مع لحم واغيو وبيض طري",
    price: 220,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1480&q=80",
    available: true
  },
  {
    id: "203",
    restaurantId: "2",
    name: "Tempura Combo",
    nameAr: "تمبورا مشكل",
    description: "Crispy shrimp and vegetable tempura",
    descriptionAr: "تمبورا جمبري وخضار مقرمش",
    price: 180,
    category: "Starters",
    categoryAr: "المقبلات",
    image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "204",
    restaurantId: "2",
    name: "Mochi Ice Cream",
    nameAr: "موتشي آيس كريم",
    description: "Soft mochi filled with premium ice cream",
    descriptionAr: "موتشي طري محشو بآيس كريم فاخر",
    price: 95,
    category: "Desserts",
    categoryAr: "الحلويات",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1454&q=80",
    available: true
  },
  
  // Mediterraneo
  {
    id: "401",
    restaurantId: "4",
    name: "Greek Mezze Platter",
    nameAr: "طبق مزة يوناني",
    description: "Assorted Mediterranean dips and appetizers",
    descriptionAr: "تشكيلة صلصات ومقبلات متوسطية",
    price: 165,
    category: "Starters",
    categoryAr: "المقبلات",
    image: "https://images.unsplash.com/photo-1541529086526-db283c563270?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "402",
    restaurantId: "4",
    name: "Grilled Sea Bass",
    nameAr: "سمك قاروص مشوي",
    description: "Fresh sea bass with lemon and herbs",
    descriptionAr: "سمك قاروص طازج بالليمون والأعشاب",
    price: 320,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1580959375944-1ab5cdcddb82?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    available: true
  },
  {
    id: "403",
    restaurantId: "4",
    name: "Baklava Selection",
    nameAr: "تشكيلة بقلاوة",
    description: "Traditional Mediterranean pastries with honey",
    descriptionAr: "معجنات متوسطية تقليدية بالعسل",
    price: 85,
    category: "Desserts",
    categoryAr: "الحلويات",
    image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    available: true
  },
  
  // Spice Route (Indian)
  {
    id: "501",
    restaurantId: "5",
    name: "Chicken Tikka Masala",
    nameAr: "دجاج تكا مسالا",
    description: "Tender chicken in rich tomato cream sauce",
    descriptionAr: "دجاج طري في صلصة الطماطم والكريمة",
    price: 145,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80",
    available: true
  },
  {
    id: "502",
    restaurantId: "5",
    name: "Vegetable Samosas",
    nameAr: "سمبوسك خضار",
    description: "Crispy pastries filled with spiced vegetables",
    descriptionAr: "معجنات مقرمشة محشوة بالخضار المتبل",
    price: 65,
    category: "Starters",
    categoryAr: "المقبلات",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "503",
    restaurantId: "5",
    name: "Butter Chicken",
    nameAr: "دجاج بالزبدة",
    description: "Classic Indian butter chicken with naan",
    descriptionAr: "دجاج بالزبدة الهندي الكلاسيكي مع نان",
    price: 135,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  
  // La Piazza (Italian)
  {
    id: "601",
    restaurantId: "6",
    name: "Margherita Pizza",
    nameAr: "بيتزا مارغريتا",
    description: "Classic pizza with fresh mozzarella and basil",
    descriptionAr: "بيتزا كلاسيكية مع موتزاريلا طازجة وريحان",
    price: 125,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80",
    available: true
  },
  {
    id: "602",
    restaurantId: "6",
    name: "Fettuccine Alfredo",
    nameAr: "فيتوتشيني ألفريدو",
    description: "Creamy pasta with parmesan cheese",
    descriptionAr: "معكرونة كريمية مع جبن البارميزان",
    price: 145,
    category: "Mains",
    categoryAr: "الأطباق الرئيسية",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "603",
    restaurantId: "6",
    name: "Tiramisu",
    nameAr: "تيراميسو",
    description: "Classic Italian coffee-flavored dessert",
    descriptionAr: "حلوى إيطالية كلاسيكية بنكهة القهوة",
    price: 95,
    category: "Desserts",
    categoryAr: "الحلويات",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    available: true
  },
  
  // Burger Junction
  {
    id: "801",
    restaurantId: "8",
    name: "Classic Cheeseburger",
    nameAr: "برجر تشيز كلاسيك",
    description: "Beef patty with cheddar cheese and special sauce",
    descriptionAr: "لحم بقري مع جبن شيدر وصلصة خاصة",
    price: 95,
    category: "Burgers",
    categoryAr: "برجر",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "802",
    restaurantId: "8",
    name: "Bacon Mushroom Burger",
    nameAr: "برجر بيكون ومشروم",
    description: "Beef burger with bacon, mushrooms and swiss cheese",
    descriptionAr: "برجر لحم مع بيكون ومشروم وجبن سويسري",
    price: 115,
    category: "Burgers",
    categoryAr: "برجر",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1065&q=80",
    available: true
  },
  {
    id: "803",
    restaurantId: "8",
    name: "Loaded Fries",
    nameAr: "بطاطس محملة",
    description: "Crispy fries with cheese, bacon and sour cream",
    descriptionAr: "بطاطس مقرمشة مع جبن وبيكون وكريمة حامضة",
    price: 65,
    category: "Sides",
    categoryAr: "أطباق جانبية",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80",
    available: true
  }
];

// ============================================
// RESERVATIONS
// ============================================

export const mockReservations = [
  {
    id: "res-1",
    userId: "2",
    restaurantId: "1",
    customerName: "أحمد محمود",
    restaurantName: "Lumière",
    date: "2024-12-05",
    time: "19:00",
    partySize: 4,
    status: "confirmed",
    specialRequests: "Window table preferred",
    confirmationCode: "LUM-2024-001",
    createdAt: "2024-12-01"
  },
  {
    id: "res-2",
    userId: "3",
    restaurantId: "2",
    customerName: "فاطمة حسن",
    restaurantName: "Sakura Zen",
    date: "2024-12-03",
    time: "20:00",
    partySize: 2,
    status: "confirmed",
    specialRequests: "Anniversary celebration",
    confirmationCode: "SAK-2024-001",
    createdAt: "2024-11-28"
  },
  {
    id: "res-3",
    userId: "2",
    restaurantId: "4",
    customerName: "أحمد محمود",
    restaurantName: "Mediterraneo",
    date: "2024-12-06",
    time: "18:30",
    partySize: 6,
    status: "pending",
    specialRequests: "Business dinner",
    confirmationCode: "MED-2024-001",
    createdAt: "2024-12-02"
  },
  {
    id: "res-4",
    userId: "3",
    restaurantId: "6",
    customerName: "فاطمة حسن",
    restaurantName: "La Piazza",
    date: "2024-11-30",
    time: "19:30",
    partySize: 3,
    status: "completed",
    specialRequests: "",
    confirmationCode: "LAP-2024-001",
    createdAt: "2024-11-25"
  },
  {
    id: "res-5",
    userId: "2",
    restaurantId: "5",
    customerName: "أحمد محمود",
    restaurantName: "Spice Route",
    date: "2024-11-28",
    time: "20:30",
    partySize: 2,
    status: "cancelled",
    specialRequests: "",
    confirmationCode: "SPI-2024-001",
    createdAt: "2024-11-20"
  }
];

// ============================================
// ORDERS
// ============================================

export const recentOrders = [
  {
    id: "ORD-7721",
    userId: "2",
    restaurantId: "1",
    reservationId: "res-1",
    customer: "أحمد محمود",
    customerName: "أحمد محمود",
    restaurant: "Lumière",
    items: ["Truffle Risotto", "Vintage Red Wine"],
    itemsDetail: [
      { name: "Truffle Risotto", quantity: 2, price: 450 },
      { name: "Vintage Red Wine", quantity: 1, price: 280 }
    ],
    total: 1180,
    status: "preparing",
    time: "10 mins ago",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-7720",
    userId: "3",
    restaurantId: "1",
    customer: "فاطمة حسن",
    customerName: "فاطمة حسن",
    restaurant: "Lumière",
    items: ["Wagyu Beef Tartare", "Lobster Thermidor"],
    itemsDetail: [
      { name: "Wagyu Beef Tartare", quantity: 1, price: 380 },
      { name: "Lobster Thermidor", quantity: 1, price: 650 }
    ],
    total: 1030,
    status: "ready",
    time: "25 mins ago",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-7719",
    userId: "2",
    restaurantId: "2",
    customer: "أحمد محمود",
    customerName: "أحمد محمود",
    restaurant: "Sakura Zen",
    items: ["Premium Sushi Platter x2", "Wagyu Beef Ramen"],
    itemsDetail: [
      { name: "Premium Sushi Platter", quantity: 2, price: 280 },
      { name: "Wagyu Beef Ramen", quantity: 1, price: 220 }
    ],
    total: 780,
    status: "served",
    time: "1 hour ago",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-7718",
    userId: "3",
    restaurantId: "4",
    customer: "فاطمة حسن",
    customerName: "فاطمة حسن",
    restaurant: "Mediterraneo",
    items: ["Greek Mezze Platter", "Grilled Sea Bass"],
    itemsDetail: [
      { name: "Greek Mezze Platter", quantity: 1, price: 165 },
      { name: "Grilled Sea Bass", quantity: 1, price: 320 }
    ],
    total: 485,
    status: "served",
    time: "2 hours ago",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-7717",
    userId: "2",
    restaurantId: "8",
    customer: "أحمد محمود",
    customerName: "أحمد محمود",
    restaurant: "Burger Junction",
    items: ["Classic Cheeseburger x2", "Loaded Fries", "Soft Drinks x2"],
    itemsDetail: [
      { name: "Classic Cheeseburger", quantity: 2, price: 95 },
      { name: "Loaded Fries", quantity: 1, price: 65 },
      { name: "Soft Drinks", quantity: 2, price: 25 }
    ],
    total: 280,
    status: "pending",
    time: "5 mins ago",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

// ============================================
// FAVORITES
// ============================================

export const mockFavorites = [
  { id: "fav-1", userId: "2", restaurantId: "1" },
  { id: "fav-2", userId: "2", restaurantId: "2" },
  { id: "fav-3", userId: "2", restaurantId: "6" },
  { id: "fav-4", userId: "3", restaurantId: "1" },
  { id: "fav-5", userId: "3", restaurantId: "4" },
  { id: "fav-6", userId: "3", restaurantId: "5" },
];

// ============================================
// ADMIN STATS
// ============================================

export const adminStats = [
  { 
    label: "Total Revenue", 
    labelAr: "إجمالي الإيرادات",
    value: "EGP 1,245,000", 
    change: "+12%", 
    icon: DollarSign,
    trend: "up"
  },
  { 
    label: "Active Restaurants", 
    labelAr: "المطاعم النشطة",
    value: "8", 
    change: "+2", 
    icon: Coffee,
    trend: "up"
  },
  { 
    label: "Total Users", 
    labelAr: "إجمالي المستخدمين",
    value: "2,543", 
    change: "+8.2%", 
    icon: Users,
    trend: "up"
  },
  { 
    label: "Pending Approvals", 
    labelAr: "في انتظار الموافقة",
    value: "1", 
    change: "-4", 
    icon: Settings,
    trend: "down"
  },
];

// ============================================
// RESTAURANT DASHBOARD STATS
// ============================================

export const restaurantStats = [
  {
    label: "Today's Orders",
    labelAr: "طلبات اليوم",
    value: "24",
    change: "+15%",
    icon: ShoppingBag,
    trend: "up"
  },
  {
    label: "Today's Revenue",
    labelAr: "إيرادات اليوم",
    value: "EGP 4,250",
    change: "+8%",
    icon: DollarSign,
    trend: "up"
  },
  {
    label: "Active Reservations",
    labelAr: "الحجوزات النشطة",
    value: "12",
    change: "+3",
    icon: Calendar,
    trend: "up"
  },
  {
    label: "Average Rating",
    labelAr: "متوسط التقييم",
    value: "4.9",
    change: "+0.2",
    icon: Star,
    trend: "up"
  }
];

// ============================================
// CHART DATA
// ============================================

export const revenueChartData = [
  { month: "Jan", revenue: 45000, orders: 230 },
  { month: "Feb", revenue: 52000, orders: 280 },
  { month: "Mar", revenue: 48000, orders: 250 },
  { month: "Apr", revenue: 61000, orders: 320 },
  { month: "May", revenue: 55000, orders: 290 },
  { month: "Jun", revenue: 67000, orders: 350 },
  { month: "Jul", revenue: 72000, orders: 380 },
  { month: "Aug", revenue: 68000, orders: 360 },
  { month: "Sep", revenue: 78000, orders: 410 },
  { month: "Oct", revenue: 82000, orders: 435 },
  { month: "Nov", revenue: 89000, orders: 465 },
  { month: "Dec", revenue: 95000, orders: 490 },
];

export const popularDishesData = [
  { name: "Truffle Risotto", orders: 156, revenue: 70200 },
  { name: "Premium Sushi Platter", orders: 143, revenue: 40040 },
  { name: "Lobster Thermidor", orders: 98, revenue: 63700 },
  { name: "Wagyu Beef Tartare", orders: 87, revenue: 33060 },
  { name: "Classic Cheeseburger", orders: 234, revenue: 22230 },
];

export const ordersByHourData = [
  { hour: "12:00", orders: 5 },
  { hour: "13:00", orders: 12 },
  { hour: "14:00", orders: 18 },
  { hour: "15:00", orders: 8 },
  { hour: "16:00", orders: 4 },
  { hour: "17:00", orders: 7 },
  { hour: "18:00", orders: 15 },
  { hour: "19:00", orders: 28 },
  { hour: "20:00", orders: 35 },
  { hour: "21:00", orders: 32 },
  { hour: "22:00", orders: 22 },
  { hour: "23:00", orders: 14 },
];

// ============================================
// CUISINES
// ============================================

export const cuisineTypes = [
  { value: "french", label: "French Fine Dining", labelAr: "مطبخ فرنسي راقي" },
  { value: "japanese", label: "Japanese", labelAr: "ياباني" },
  { value: "italian", label: "Italian", labelAr: "إيطالي" },
  { value: "mediterranean", label: "Mediterranean", labelAr: "متوسطي" },
  { value: "indian", label: "Indian", labelAr: "هندي" },
  { value: "steakhouse", label: "Steakhouse", labelAr: "مطعم لحوم" },
  { value: "american", label: "American", labelAr: "أمريكي" },
  { value: "chinese", label: "Chinese", labelAr: "صيني" },
  { value: "thai", label: "Thai", labelAr: "تايلندي" },
  { value: "mexican", label: "Mexican", labelAr: "مكسيكي" },
  { value: "seafood", label: "Seafood", labelAr: "مأكولات بحرية" },
  { value: "arabic", label: "Arabic", labelAr: "عربي" },
];
