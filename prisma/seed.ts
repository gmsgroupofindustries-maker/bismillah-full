import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Bismillah Motors...');

  // 1. Seed Admin User
  const adminPassword = await bcrypt.hash('admin123456', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bismillahmotors.com' },
    update: {
      passwordHash: adminPassword,
      name: 'Bismillah Motors Admin',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@bismillahmotors.com',
      passwordHash: adminPassword,
      name: 'Bismillah Motors Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created/verified:', adminUser.email);

  // 2. Seed Categories
  const categoriesData = [
    {
      name: 'Engine Parts',
      slug: 'engine-parts',
      description: 'Pistons, cylinder kits, valves, gaskets, crankshafts & engine timing components',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Brake Parts',
      slug: 'brake-parts',
      description: 'Brake pads, discs, master cylinders, caliper assemblies & hydraulic brake hoses',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Chain & Sprocket',
      slug: 'chain-and-sprocket',
      description: 'High tensile drive chains, front & rear sprockets and brass chain kits',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Electrical',
      slug: 'electrical',
      description: 'ECUs, wiring harnesses, headlamp units, speedometers, CDI, sensors & relays',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Filters',
      slug: 'filters',
      description: 'Original air filters, oil filters and high-performance fuel filters',
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Clutch Parts',
      slug: 'clutch-parts',
      description: 'Clutch plates, pressure plates, clutch cables, levers and clutch center hub',
      imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Body Parts',
      slug: 'body-parts',
      description: 'Fuel tanks, fairings, side panels, mudguards, alloy wheels and cowlings',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Stickers & Decals',
      slug: 'stickers-and-accessories',
      description: '3D tank pads, rim tapes, OEM body graphics & monster custom decals',
      imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Accessories & Lubricants',
      slug: 'accessories',
      description: 'Yamalube fluids, engine oils, crash guards, mobile holders and bike covers',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const categoryMap = new Map<string, number>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Seeded ${categoriesData.length} categories`);

  // 3. Seed Brands
  const brandsData = [
    { name: 'Yamaha Genuine Parts', slug: 'yamaha', logoUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=120&q=80' },
    { name: 'Suzuki Genuine Parts', slug: 'suzuki', logoUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=120&q=80' },
    { name: 'TVS Genuine Parts', slug: 'tvs', logoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=120&q=80' },
    { name: 'Bajaj Genuine Parts', slug: 'bajaj', logoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80' },
    { name: 'Honda Genuine Parts', slug: 'honda', logoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=120&q=80' },
    { name: 'Royal Enfield', slug: 'royal-enfield', logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=120&q=80' },
    { name: 'MRF Tyres & Rubber', slug: 'mrf', logoUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=120&q=80' },
  ];

  const brandMap = new Map<string, number>();
  for (const b of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    brandMap.set(b.slug, created.id);
  }
  console.log(`✅ Seeded ${brandsData.length} brands`);

  // 4. Seed Bike Brands & Models
  const bikeBrandData = [
    {
      name: 'Yamaha',
      slug: 'bike-yamaha',
      models: [
        { name: 'Yamaha R15 V3', slug: 'yamaha-r15-v3' },
        { name: 'Yamaha R15 V4 / R15M', slug: 'yamaha-r15-v4' },
        { name: 'Yamaha MT-15', slug: 'yamaha-mt-15' },
        { name: 'Yamaha FZ-S V2/V3', slug: 'yamaha-fzs-v2-v3' },
        { name: 'Yamaha Saluto 125', slug: 'yamaha-saluto-125' },
      ],
    },
    {
      name: 'Suzuki',
      slug: 'bike-suzuki',
      models: [
        { name: 'Suzuki Gixxer 155 (Monotone/Carb)', slug: 'suzuki-gixxer-155' },
        { name: 'Suzuki Gixxer SF (FI / ABS)', slug: 'suzuki-gixxer-sf' },
        { name: 'Suzuki Hayate 110', slug: 'suzuki-hayate-110' },
      ],
    },
    {
      name: 'TVS',
      slug: 'bike-tvs',
      models: [
        { name: 'TVS Apache RTR 160 4V', slug: 'tvs-apache-rtr-160-4v' },
        { name: 'TVS Apache RTR 160 2V', slug: 'tvs-apache-rtr-160-2v' },
        { name: 'TVS Metro / Metro Plus', slug: 'tvs-metro' },
        { name: 'TVS Stryker 125', slug: 'tvs-stryker-125' },
      ],
    },
    {
      name: 'Bajaj',
      slug: 'bike-bajaj',
      models: [
        { name: 'Bajaj Pulsar 150', slug: 'bajaj-pulsar-150' },
        { name: 'Bajaj Pulsar NS160', slug: 'bajaj-pulsar-ns160' },
        { name: 'Bajaj Platina 100/110', slug: 'bajaj-platina' },
        { name: 'Bajaj Discover 125', slug: 'bajaj-discover-125' },
      ],
    },
  ];

  const bikeBrandMap = new Map<string, number>();
  const bikeModelMap = new Map<string, number>();

  for (const bb of bikeBrandData) {
    const createdBb = await prisma.bikeBrand.upsert({
      where: { slug: bb.slug },
      update: { name: bb.name },
      create: { name: bb.name, slug: bb.slug },
    });
    bikeBrandMap.set(bb.slug, createdBb.id);

    for (const bm of bb.models) {
      const createdBm = await prisma.bikeModel.upsert({
        where: { slug: bm.slug },
        update: { name: bm.name, bikeBrandId: createdBb.id },
        create: { name: bm.name, slug: bm.slug, bikeBrandId: createdBb.id },
      });
      bikeModelMap.set(bm.slug, createdBm.id);
    }
  }
  console.log(`✅ Seeded bike brands and models`);

  // 5. Seed Comprehensive Products inspired by bikepartsbd.net
  const products = [
    {
      name: 'Yamalube Brake Fluid DOT 4 (Heavy Duty 250ml)',
      slug: 'yamalube-brake-fluid-dot-4-250ml',
      sku: 'YAM-BF-DOT4-250',
      description: '100% genuine Yamalube DOT 4 Brake Fluid designed specifically for Yamaha, Suzuki, and TVS disc brake systems. Delivers high boiling point resistance against vapor lock under intense braking.',
      price: 710,
      discountPrice: 580,
      stock: 35,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'accessories',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-r15-v3',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Oxygen Sensor (O2 Sensor) for Yamaha R15 V3 / MT-15 Original',
      slug: 'oxygen-sensor-yamaha-r15-v3-mt15',
      sku: 'YAM-O2S-R15V3',
      description: 'OEM Yamaha Genuine Oxygen Sensor for FI fuel injection management. Solves check engine light, rich fuel smell, and poor mileage on R15 V3 and MT-15.',
      price: 8200,
      discountPrice: 6695,
      stock: 8,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'electrical',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-r15-v3',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Fuel Tank for TVS Metro Red (Original OEM Metallic Red)',
      slug: 'fuel-tank-tvs-metro-red-oem',
      sku: 'TVS-FT-METRO-RED',
      description: 'Heavy gauge steel original TVS Metro fuel tank with factory anti-rust electro-coating and authentic graphics pre-applied. Direct bolt-on fit.',
      price: 16000,
      discountPrice: 12400,
      stock: 5,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'body-parts',
      brandSlug: 'tvs',
      bikeBrandSlug: 'bike-tvs',
      bikeModelSlug: 'tvs-metro',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Fuel Tank for TVS Metro Black & Blue Graphics',
      slug: 'fuel-tank-tvs-metro-black-blue',
      sku: 'TVS-FT-METRO-BLK',
      description: 'Original TVS Metro glossy black fuel tank with dynamic blue graphics. High capacity, factory pressure-tested for zero leakage.',
      price: 14500,
      discountPrice: 12900,
      stock: 4,
      isFeatured: false,
      isPopular: false,
      categorySlug: 'body-parts',
      brandSlug: 'tvs',
      bikeBrandSlug: 'bike-tvs',
      bikeModelSlug: 'tvs-metro',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Fuel Tank for BAJAJ Platina 100/110 Original Black-Red',
      slug: 'fuel-tank-bajaj-platina-black-red',
      sku: 'BAJ-FT-PLATINA-01',
      description: 'Genuine Bajaj Platina fuel tank with high durability, genuine lock collar fitting, and factory original Platina badging.',
      price: 13500,
      discountPrice: 10300,
      stock: 7,
      isFeatured: true,
      isPopular: false,
      categorySlug: 'body-parts',
      brandSlug: 'bajaj',
      bikeBrandSlug: 'bike-bajaj',
      bikeModelSlug: 'bajaj-platina',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Full Main Wiring Harness Assy for Yamaha FZ-S V2/V3 FI',
      slug: 'main-wiring-harness-assy-yamaha-fzs-v2-v3',
      sku: 'YAM-WH-FZSV23',
      description: 'Complete original factory wiring loom with waterproof couplers, relay sockets, fuse box, and ECU connector pinouts for Yamaha FZ-S.',
      price: 16500,
      discountPrice: 12440,
      stock: 6,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'electrical',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-fzs-v2-v3',
      imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Engine Control Unit (ECU) for TVS Apache RTR 160 4V',
      slug: 'engine-control-unit-ecu-tvs-apache-rtr-160-4v',
      sku: 'TVS-ECU-RTR4V',
      description: 'Factory programmed TVS genuine ECU with race-tuned throttle mapping and ignition timing curves. Guaranteed seamless idle and instant acceleration.',
      price: 13000,
      discountPrice: 9900,
      stock: 9,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'electrical',
      brandSlug: 'tvs',
      bikeBrandSlug: 'bike-tvs',
      bikeModelSlug: 'tvs-apache-rtr-160-4v',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Primary Driven Gear & Clutch Bell Assy for Suzuki Gixxer 155',
      slug: 'primary-driven-gear-clutch-assy-suzuki-gixxer',
      sku: 'SUZ-CL-GEAR-155',
      description: 'Original Suzuki hardened steel primary driven gear set and clutch outer housing. Eliminates clutch chatter noise and slipping during shifts.',
      price: 4400,
      discountPrice: 3450,
      stock: 12,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'clutch-parts',
      brandSlug: 'suzuki',
      bikeBrandSlug: 'bike-suzuki',
      bikeModelSlug: 'suzuki-gixxer-155',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Chain Sprocket Set (Drive Kit) for Suzuki Gixxer 155 / SF',
      slug: 'chain-sprocket-set-suzuki-gixxer-155-sf',
      sku: 'SUZ-CS-GX155',
      description: 'Heavy duty O-ring drive chain kit with induction heat-treated front 15T and rear 45T sprockets. Long service life over 25,000 KM.',
      price: 7200,
      discountPrice: 6050,
      stock: 18,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'chain-and-sprocket',
      brandSlug: 'suzuki',
      bikeBrandSlug: 'bike-suzuki',
      bikeModelSlug: 'suzuki-gixxer-155',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Digital Speedometer Meter Console Assy for TVS Metro',
      slug: 'speedometer-assy-tvs-metro-plus',
      sku: 'TVS-SP-METRO-01',
      description: 'Original crystal clear analog/digital hybrid meter console for TVS Metro series. Features speedo cable gear drive and trip meter.',
      price: 9800,
      discountPrice: 7850,
      stock: 8,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'electrical',
      brandSlug: 'tvs',
      bikeBrandSlug: 'bike-tvs',
      bikeModelSlug: 'tvs-metro',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Digital Speedometer Assy for Suzuki Gixxer SF FI ABS',
      slug: 'speedometer-assy-gixxer-sf-fi-abs',
      sku: 'SUZ-SP-GXSF-ABS',
      description: 'Full inverted LCD instrument console for Gixxer SF with gear position indicator, RPM shift light, clock, and dual trip computers.',
      price: 9900,
      discountPrice: 7550,
      stock: 6,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'electrical',
      brandSlug: 'suzuki',
      bikeBrandSlug: 'bike-suzuki',
      bikeModelSlug: 'suzuki-gixxer-sf',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Original Front Hydraulic Brake Hose Pipe for Suzuki Gixxer',
      slug: 'front-brake-hose-pipe-suzuki-gixxer',
      sku: 'SUZ-BH-FR-GX',
      description: 'Reinforced braided inner core brake fluid pipe with banjo fittings and rubber sleeves. Prevents line expansion under hard lever pressure.',
      price: 2060,
      discountPrice: 1530,
      stock: 22,
      isFeatured: false,
      isPopular: false,
      categorySlug: 'brake-parts',
      brandSlug: 'suzuki',
      bikeBrandSlug: 'bike-suzuki',
      bikeModelSlug: 'suzuki-gixxer-155',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Front Fork Suspension Assembly Set for TVS Apache RTR 160 4V',
      slug: 'front-fork-assembly-tvs-apache-rtr-160-4v',
      sku: 'TVS-FK-RTR4V',
      description: 'Pair of left and right telescopic front fork shock absorbers with progressive damping springs and oil seals. Restores smooth plush highway handling.',
      price: 22000,
      discountPrice: 16900,
      stock: 4,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'body-parts',
      brandSlug: 'tvs',
      bikeBrandSlug: 'bike-tvs',
      bikeModelSlug: 'tvs-apache-rtr-160-4v',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Original Front Brake Caliper Assy for TVS Apache RTR 4V (Gold)',
      slug: 'caliper-assy-gold-tvs-apache-rtr-160-4v',
      sku: 'TVS-CAL-RTR4V-GLD',
      description: 'Genuine ByBre twin piston gold caliper assembly loaded with semi-metallic brake pads and bleeder valve for TVS Apache RTR.',
      price: 3350,
      discountPrice: 2580,
      stock: 14,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'brake-parts',
      brandSlug: 'tvs',
      bikeBrandSlug: 'bike-tvs',
      bikeModelSlug: 'tvs-apache-rtr-160-4v',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Front Brake Caliper Assy Right for Yamaha FZS V2 / V3',
      slug: 'front-caliper-assy-right-yamaha-fzs-v2-v3',
      sku: 'YAM-CAL-FZSV23',
      description: 'OEM Yamaha twin-pot front disc brake caliper assembly. High thermal resistance with smooth piston return action.',
      price: 4300,
      discountPrice: 3070,
      stock: 11,
      isFeatured: true,
      isPopular: false,
      categorySlug: 'brake-parts',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-fzs-v2-v3',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Rear Alloy Rim Wheel for Suzuki Gixxer 155 Monotone',
      slug: 'alloy-rim-rear-suzuki-gixxer-monotone',
      sku: 'SUZ-RIM-RR-GX',
      description: 'Factory cast aluminum 17-inch rear alloy wheel rim. Precision balanced with bearing races and tubeless valve seat.',
      price: 20500,
      discountPrice: 16810,
      stock: 3,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'body-parts',
      brandSlug: 'suzuki',
      bikeBrandSlug: 'bike-suzuki',
      bikeModelSlug: 'suzuki-gixxer-155',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Throttle Body Assy for Yamaha R15 V3 FI',
      slug: 'throttle-body-assy-yamaha-r15-v3',
      sku: 'YAM-TB-R15V3',
      description: 'Genuine Yamaha 30mm precision throttle body with integrated throttle position sensor (TPS) and idle speed stepper motor.',
      price: 8600,
      discountPrice: 6970,
      stock: 7,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'engine-parts',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-r15-v3',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Crankshaft Assembly for Yamaha Saluto 125',
      slug: 'crankshaft-assembly-yamaha-saluto-125',
      sku: 'YAM-CS-SALUTO',
      description: 'Original forged crankshaft with connecting rod, needle bearings and balancing counterweights for Yamaha Saluto 125.',
      price: 10500,
      discountPrice: 7600,
      stock: 5,
      isFeatured: false,
      isPopular: false,
      categorySlug: 'engine-parts',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-saluto-125',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Rear Shock Absorber for Bajaj Pulsar 150 (Nitrox Gas)',
      slug: 'rear-shock-absorber-bajaj-pulsar-150-nitrox',
      sku: 'BAJ-SA-P150-NTX',
      description: 'Endurance genuine Bajaj dual canister Nitrox gas charged rear suspension unit with 5-step adjustable spring preload.',
      price: 6000,
      discountPrice: 4950,
      stock: 15,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'body-parts',
      brandSlug: 'bajaj',
      bikeBrandSlug: 'bike-bajaj',
      bikeModelSlug: 'bajaj-pulsar-150',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'MRF REVZ-M 140/60 R17 Tubeless Radial Rear Tyre',
      slug: 'mrf-revz-m-140-60-r17-radial-tyre',
      sku: 'MRF-TY-REVZM140',
      description: 'Premium radial motorcycle rear tyre engineered for Yamaha R15 V3, Suzuki Gixxer, and TVS Apache RTR 4V with exceptional wet grip.',
      price: 6800,
      discountPrice: 6150,
      stock: 20,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'accessories',
      brandSlug: 'mrf',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-r15-v3',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: '3D Embossed Monster Decal & Tank Pad Sticker Kit for Yamaha R15 V3',
      slug: '3d-tank-pad-monster-decal-sticker-kit-yamaha-r15-v3',
      sku: 'STK-TP-R15V3-MON',
      description: 'Waterproof resin-coated 3D protective tank pad with scratch-resistant clear polyurethane dome and full motorcycle side decals.',
      price: 990,
      discountPrice: 750,
      stock: 50,
      isFeatured: true,
      isPopular: true,
      categorySlug: 'stickers-and-accessories',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-r15-v3',
      imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'High Performance Air Filter for Yamaha R15 V3 / MT-15',
      slug: 'high-performance-air-filter-yamaha-r15-v3-mt15',
      sku: 'FLT-AF-R15V3',
      description: 'Multi-layer high airflow cotton gauze air filter element. Delivers up to 15% better air volume for instant throttle punch.',
      price: 1450,
      discountPrice: 1150,
      stock: 30,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'filters',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-r15-v3',
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'FCC Clutch Plate Set (5-Piece) for Yamaha FZ-S V2/V3',
      slug: 'fcc-clutch-plate-set-yamaha-fzs-v2-v3',
      sku: 'CLT-FCC-FZSV23',
      description: 'Japanese FCC high-friction paper-based clutch friction disc kit. Eliminates clutch slippage on heavy torque loads.',
      price: 2400,
      discountPrice: 1850,
      stock: 25,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'clutch-parts',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-fzs-v2-v3',
      imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Headlight Assembly for TVS Apache RTR 160 2V with Visor',
      slug: 'headlight-assembly-tvs-apache-rtr-160-2v',
      sku: 'TVS-HL-RTR2V-VIS',
      description: 'Complete OEM front headlight assembly featuring halogen reflector dish, clear lens, and matching tinted flyscreen visor.',
      price: 6000,
      discountPrice: 4340,
      stock: 8,
      isFeatured: false,
      isPopular: true,
      categorySlug: 'electrical',
      brandSlug: 'tvs',
      bikeBrandSlug: 'bike-tvs',
      bikeModelSlug: 'tvs-apache-rtr-160-2v',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Rocker Arm & Shaft Set for Yamaha R15 V3 VVA Engine',
      slug: 'rocker-arm-shaft-set-yamaha-r15-v3-vva',
      sku: 'YAM-RA-R15V3-VVA',
      description: 'Genuine Yamaha intake and exhaust rocker arms equipped with VVA roller pins and hardened pivot shafts.',
      price: 1670,
      discountPrice: 1080,
      stock: 16,
      isFeatured: false,
      isPopular: false,
      categorySlug: 'engine-parts',
      brandSlug: 'yamaha',
      bikeBrandSlug: 'bike-yamaha',
      bikeModelSlug: 'yamaha-r15-v3',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Clutch Lever with Pivot Bracket for Bajaj Pulsar NS160',
      slug: 'clutch-lever-pivot-bracket-bajaj-pulsar-ns160',
      sku: 'BAJ-LV-NS160-CL',
      description: 'High tensile aluminum alloy clutch lever with ergonomic curve and safety breakaway tip for Bajaj Pulsar NS160.',
      price: 440,
      discountPrice: 310,
      stock: 40,
      isFeatured: false,
      isPopular: false,
      categorySlug: 'clutch-parts',
      brandSlug: 'bajaj',
      bikeBrandSlug: 'bike-bajaj',
      bikeModelSlug: 'bajaj-pulsar-ns160',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
    },
  ];

  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug)!;
    const brandId = brandMap.get(p.brandSlug)!;
    const bikeBrandId = p.bikeBrandSlug ? bikeBrandMap.get(p.bikeBrandSlug) : null;
    const bikeModelId = p.bikeModelSlug ? bikeModelMap.get(p.bikeModelSlug) : null;

    const createdProduct = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        isFeatured: p.isFeatured,
        isPopular: p.isPopular,
        categoryId,
        brandId,
        bikeBrandId,
        bikeModelId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        isFeatured: p.isFeatured,
        isPopular: p.isPopular,
        categoryId,
        brandId,
        bikeBrandId,
        bikeModelId,
      },
    });

    // Seed primary image
    await prisma.productImage.deleteMany({
      where: { productId: createdProduct.id },
    });

    await prisma.productImage.create({
      data: {
        url: p.imageUrl,
        isPrimary: true,
        productId: createdProduct.id,
      },
    });
  }
  console.log(`✅ Seeded ${products.length} comprehensive motorcycle products`);

  // 6. Seed Sample Orders with realistic Bangladesh addresses & statuses
  const sampleOrders = [
    {
      orderNumber: 'BM-20261001-0081',
      customerName: 'Rafiqul Islam',
      customerPhone: '01711223344',
      customerWhatsapp: '+8801711223344',
      customerAddress: 'House 14, Road 3, Mujib Sarak, Jashore Sadar',
      customerDistrict: 'Jashore',
      notes: 'Please call before delivery. Need urgently for R15 V3 servicing.',
      totalAmount: 7275,
      deliveryFee: 60,
      status: 'Delivered',
      items: [
        {
          productSku: 'YAM-O2S-R15V3',
          productName: 'Oxygen Sensor (O2 Sensor) for Yamaha R15 V3 / MT-15 Original',
          price: 6695,
          quantity: 1,
          subtotal: 6695,
        },
        {
          productSku: 'YAM-BF-DOT4-250',
          productName: 'Yamalube Brake Fluid DOT 4 (Heavy Duty 250ml)',
          price: 580,
          quantity: 1,
          subtotal: 580,
        },
      ],
    },
    {
      orderNumber: 'BM-20261002-0092',
      customerName: 'Tanvir Ahmed',
      customerPhone: '01855667788',
      customerWhatsapp: '+8801855667788',
      customerAddress: 'Holding 42, Agrabad C/A, Chittagong',
      customerDistrict: 'Chittagong',
      notes: 'Ship via Sundarban Courier service Agrabad branch.',
      totalAmount: 12520,
      deliveryFee: 120,
      status: 'Shipped',
      items: [
        {
          productSku: 'TVS-FT-METRO-RED',
          productName: 'Fuel Tank for TVS Metro Red (Original OEM Metallic Red)',
          price: 12400,
          quantity: 1,
          subtotal: 12400,
        },
      ],
    },
    {
      orderNumber: 'BM-20261002-0105',
      customerName: 'Kazi Mahbubur Rahman',
      customerPhone: '01912345678',
      customerWhatsapp: '+8801912345678',
      customerAddress: 'Plot 7, Sector 11, Uttara, Dhaka',
      customerDistrict: 'Dhaka',
      notes: 'Please verify packaging so sprockets do not scratch during courier transit.',
      totalAmount: 6170,
      deliveryFee: 120,
      status: 'Confirmed',
      items: [
        {
          productSku: 'SUZ-CS-GX155',
          productName: 'Chain Sprocket Set (Drive Kit) for Suzuki Gixxer 155 / SF',
          price: 6050,
          quantity: 1,
          subtotal: 6050,
        },
      ],
    },
    {
      orderNumber: 'BM-20261002-0112',
      customerName: 'Shakil Hossain',
      customerPhone: '01677889900',
      customerWhatsapp: '+8801677889900',
      customerAddress: 'Village: Chanchra, Post: Chanchra, Jashore Sadar',
      customerDistrict: 'Jashore',
      notes: 'Cash on delivery payment will be ready.',
      totalAmount: 3510,
      deliveryFee: 60,
      status: 'Pending',
      items: [
        {
          productSku: 'SUZ-CL-GEAR-155',
          productName: 'Primary Driven Gear & Clutch Bell Assy for Suzuki Gixxer 155',
          price: 3450,
          quantity: 1,
          subtotal: 3450,
        },
      ],
    },
  ];

  for (const o of sampleOrders) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber: o.orderNumber },
    });

    if (!existing) {
      await prisma.order.create({
        data: {
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerWhatsapp: o.customerWhatsapp,
          customerAddress: o.customerAddress,
          customerDistrict: o.customerDistrict,
          notes: o.notes,
          totalAmount: o.totalAmount,
          deliveryFee: o.deliveryFee,
          status: o.status,
          items: {
            create: o.items.map((item) => ({
              productName: item.productName,
              productSku: item.productSku,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        },
      });
    }
  }
  console.log(`✅ Seeded sample realistic orders`);

  console.log('🎉 Seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
