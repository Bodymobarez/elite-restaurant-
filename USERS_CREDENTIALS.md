# 👥 بيانات المستخدمين | User Credentials

تم إنشاء البيانات بنجاح في قاعدة البيانات! يمكنك الآن تسجيل الدخول باستخدام الحسابات التالية:

## 🔐 بيانات الدخول | Login Credentials

### 1. مدير النظام | Admin
- **البريد الإلكتروني | Email:** `admin@elite.com`
- **كلمة المرور | Password:** `password123`
- **الصلاحيات | Permissions:** 
  - إدارة جميع المطاعم
  - إدارة جميع المستخدمين
  - عرض الإحصائيات الشاملة
  - الموافقة على المطاعم الجديدة
  - إدارة الحجوزات والطلبات

---

### 2. صاحب المطعم | Restaurant Owner
- **البريد الإلكتروني | Email:** `owner@elite.com`
- **كلمة المرور | Password:** `password123`
- **الصلاحيات | Permissions:**
  - إدارة المطاعم الخاصة به
  - إدارة قائمة الطعام
  - إدارة الحجوزات
  - إدارة الطلبات
  - عرض الإحصائيات الخاصة بمطاعمه

---

### 3. المستخدم العادي | Customer
- **البريد الإلكتروني | Email:** `user@elite.com`
- **كلمة المرور | Password:** `password123`
- **الصلاحيات | Permissions:**
  - تصفح المطاعم
  - حجز الطاولات
  - طلب الطعام
  - إضافة المطاعم إلى المفضلة
  - عرض الملف الشخصي

---

## 📊 مستخدمون إضافيون | Additional Users

### عملاء إضافيون | Additional Customers
1. **customer1@example.com** | password123 | محمد علي
2. **customer2@example.com** | password123 | فاطمة أحمد
3. **customer3@example.com** | password123 | سارة حسن

### أصحاب مطاعم إضافيون | Additional Restaurant Owners
1. **owner2@elite.com** | password123 | خالد إبراهيم
2. **owner3@elite.com** | password123 | نور الدين

---

## 🍽️ المطاعم المتاحة | Available Restaurants

تم إنشاء 5 مطاعم في قاعدة البيانات:

1. **Sequoia** - Mediterranean & Oriental (Zamalek, Cairo)
2. **Kazoku** - Japanese Fine Dining (Garden City, Cairo)
3. **The Steakhouse** - American Steakhouse (New Cairo)
4. **Maison Thomas** - Italian & Mediterranean (Sheikh Zayed, Giza)
5. **Balbaa Village** - Seafood & Grills (San Stefano, Alexandria)

---

## 📍 المحافظات والمناطق | Governorates & Districts

تم إنشاء 8 محافظات و 21 منطقة:

### المحافظات | Governorates
- القاهرة | Cairo
- الجيزة | Giza
- الإسكندرية | Alexandria
- البحر الأحمر | Red Sea
- جنوب سيناء | South Sinai
- القليوبية | Qalyubia
- الشرقية | Sharqia
- الدقهلية | Dakahlia

---

## 🚀 كيفية الاستخدام | How to Use

### تسجيل الدخول | Login

1. افتح التطبيق في المتصفح: http://localhost:3000
2. اضغط على زر "تسجيل الدخول" | Click "Login"
3. أدخل البريد الإلكتروني وكلمة المرور | Enter email and password
4. استمتع باستخدام التطبيق! | Enjoy using the app!

### مثال API | API Example

```bash
# تسجيل دخول Admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elite.com","password":"password123"}'

# تسجيل دخول Owner
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@elite.com","password":"password123"}'

# تسجيل دخول User
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@elite.com","password":"password123"}'
```

---

## ⚙️ تشغيل السيرفر | Running the Server

```bash
cd /Users/ahmed/Downloads/EliteEatsHub
set -a && source .env && set +a && PORT=3000 npm run dev
```

---

## 🔄 إعادة تهيئة البيانات | Reset Database

إذا أردت إعادة إنشاء البيانات:

```bash
# تطبيق migrations
npx drizzle-kit push

# تشغيل seed
npx tsx server/seed-data.ts
```

---

## ✅ تم التفعيل | Activated Features

- ✅ **قاعدة البيانات** | Database connected (Neon PostgreSQL)
- ✅ **المستخدمون** | Users (Admin, Owner, Customer)
- ✅ **المطاعم** | Restaurants (5 active restaurants)
- ✅ **المحافظات** | Governorates (8 governorates)
- ✅ **المناطق** | Districts (21 districts)
- ✅ **نظام التسجيل** | Authentication system
- ✅ **الترجمة** | Bilingual support (Arabic/English)

---

## 📝 ملاحظات | Notes

- جميع كلمات المرور: **password123**
- السيرفر يعمل على البورت: **3000**
- قاعدة البيانات: **Neon PostgreSQL**
- التشفير: **bcrypt (10 rounds)**

---

## 🎉 تم بنجاح!

النظام جاهز للاستخدام بكامل المميزات والصلاحيات!
