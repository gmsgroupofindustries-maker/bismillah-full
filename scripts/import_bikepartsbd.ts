import { prisma } from '../src/server/db.ts';

// Categories matching bikepartsbd.net
const CATEGORIES_DATA = [
  {
    name: 'Engine Parts',
    slug: 'engine-parts',
    description: 'Pistons, cylinder kits, valves, gaskets, crankshafts & timing gears',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Brake Parts',
    slug: 'brake-parts',
    description: 'Brake pads, master cylinders, caliper assemblies, discs & brake hoses',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Chain & Sprocket',
    slug: 'chain-and-sprocket',
    description: 'Drive chains, front & rear sprockets and complete brass chain kits',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Electrical & ECU',
    slug: 'electrical',
    description: 'ECUs, wiring harnesses, speedometers, CDI, oxygen sensors, relays & starter motors',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Headlight & Lighting',
    slug: 'headlight-and-lighting',
    description: 'Headlight assemblies, LED projection units, tail lights, indicators & mask cowlings',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Fuel Tank & Body Parts',
    slug: 'body-parts',
    description: 'Genuine fuel tanks, side panels, fairings, mudguards & rear fenders',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Suspension & Chassis',
    slug: 'suspension',
    description: 'Front fork assemblies, rear mono-shocks, chassis arms & swingarms',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tyres & Wheels',
    slug: 'tyres-and-wheels',
    description: 'MRF & Ceat tubeless tyres, alloy wheels, rim assemblies & wheel bearings',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Stickers & Graphics',
    slug: 'stickers',
    description: 'Full body sticker sets, tank pads, monogram emblems & 3D stickers',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Engine Oil & Lubricants',
    slug: 'engine-oil',
    description: 'Yamalube, Motul, Royal Enfield Liquid Gun engine oils and brake fluids',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Bike Accessories',
    slug: 'accessories',
    description: 'Crash guards, carriers, levers, handle grips, mobile holders & bike covers',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Clutch & Transmission',
    slug: 'clutch-parts',
    description: 'Clutch plates, pressure plates, clutch bells, cables & gear components',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Filters',
    slug: 'filters',
    description: 'Air filters, oil filters & fuel filter cartridges',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
  },
];

// Bike brands & popular models matching bikepartsbd.net
const BIKE_MODELS_DATA = [
  {
    brand: 'Yamaha',
    slug: 'yamaha',
    models: [
      'R15 V4 & R15M',
      'R15 V3',
      'R15 V2',
      'MT15 V2',
      'MT15 V1',
      'FZS V4',
      'FZS V3',
      'FZS V2',
      'FZS V1',
      'FZ-S Fi Hybrid',
      'Fazer V2',
      'Fazer V1',
      'FZ25',
      'FZX',
      'Saluto 125',
    ],
  },
  {
    brand: 'Suzuki',
    slug: 'suzuki',
    models: [
      'Gixxer Fi Abs',
      'Gixxer Monotone',
      'Gixxer SF Fi Abs',
      'Gixxer SF (Old Model)',
      'Gixxer SF 250',
      'Hayate & Hayate EP',
    ],
  },
  {
    brand: 'TVS',
    slug: 'tvs',
    models: [
      'RTR 4V SmartXConnect',
      'RTR 4V',
      'RTR 2V (150 & 160)',
      'Raider 125cc',
      'Metro Plus',
      'Metro 100cc',
      'Stryker 125',
    ],
  },
  {
    brand: 'Bajaj',
    slug: 'bajaj',
    models: [
      'Pulsar N160',
      'Pulsar 150',
      'Pulsar NS200',
      'Pulsar NS160',
      'Platina ES',
      'Discover 125',
    ],
  },
  {
    brand: 'Royal Enfield',
    slug: 'royal-enfield',
    models: [
      'Classic 350',
      'Hunter 350',
      'Meteor 350',
      'Bullet 350',
    ],
  },
  {
    brand: 'Honda',
    slug: 'honda',
    models: ['Honda XBlade', 'Honda Hornet 160R', 'Honda CB Shine'],
  },
  {
    brand: 'Hero',
    slug: 'hero',
    models: ['Hero Thriller 160R', 'Hero Hunk', 'Hero Splendor Plus'],
  },
];

export async function importFromBikePartsBD() {
  console.log('🚀 Starting import from bikepartsbd.net...');

  // 1. Upsert Categories
  const categoryMap = new Map<string, number>();
  for (const cat of CATEGORIES_DATA) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Upserted ${categoryMap.size} product categories`);

  // 2. Upsert Bike Brands & Models
  const bikeBrandMap = new Map<string, number>();
  const bikeModelMap = new Map<string, number>();

  for (const bb of BIKE_MODELS_DATA) {
    const brandRecord = await prisma.bikeBrand.upsert({
      where: { slug: bb.slug },
      update: { name: bb.brand },
      create: { name: bb.brand, slug: bb.slug },
    });
    bikeBrandMap.set(bb.brand.toLowerCase(), brandRecord.id);

    for (const modelName of bb.models) {
      const modelSlug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const modelRecord = await prisma.bikeModel.upsert({
        where: { slug: modelSlug },
        update: { name: modelName, bikeBrandId: brandRecord.id },
        create: { name: modelName, slug: modelSlug, bikeBrandId: brandRecord.id },
      });
      bikeModelMap.set(modelName.toLowerCase(), modelRecord.id);
    }
  }
  console.log('✅ Upserted bike brands and motorcycle models');

  // 3. Upsert Manufacturer / Spare Part Brands
  const partBrands = [
    { name: 'Yamaha Genuine Parts', slug: 'yamaha' },
    { name: 'Suzuki Genuine Parts', slug: 'suzuki' },
    { name: 'TVS Genuine Parts', slug: 'tvs' },
    { name: 'Bajaj Genuine Parts', slug: 'bajaj' },
    { name: 'Royal Enfield', slug: 'royal-enfield' },
    { name: 'Honda Genuine Parts', slug: 'honda' },
    { name: 'Hero Genuine Parts', slug: 'hero' },
    { name: 'MRF', slug: 'mrf' },
    { name: 'Motul', slug: 'motul' },
    { name: 'Yamalube', slug: 'yamalube' },
    { name: 'Kayi Corporation', slug: 'kayi-corporation' },
    { name: 'Universal', slug: 'universal' },
  ];

  const brandMap = new Map<string, number>();
  for (const b of partBrands) {
    const rec = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { name: b.name, slug: b.slug },
    });
    brandMap.set(b.slug, rec.id);
  }

  // 4. Scrape bikepartsbd.net across all main categories & pages
  const scrapingTargets = [
    { id: '', name: 'General', pages: [1, 2, 3, 4] },
    { id: '70098', name: 'Yamaha', pages: [1, 2, 3, 4] },
    { id: '69688', name: 'Suzuki', pages: [1, 2, 3] },
    { id: '71645', name: 'TVS', pages: [1, 2, 3] },
    { id: '71646', name: 'Bajaj', pages: [1, 2] },
    { id: '111446', name: 'Royal Enfield', pages: [1, 2] },
    { id: '187385', name: 'Fuel Tank', pages: [1, 2] },
    { id: '132387', name: 'Sticker', pages: [1, 2] },
    { id: '71643', name: 'Bike Accessories', pages: [1, 2] },
    { id: '205770', name: 'Engine Oil', pages: [1] },
    { id: '71644', name: 'Kayi Corporation', pages: [1] },
  ];

  interface ScrapedItem {
    slug: string;
    imageUrl: string;
    brandText: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
  }

  const scrapedMap = new Map<string, ScrapedItem>();

  const parsePage = (html: string) => {
    const regex = /<a[^>]+href=[\"']\/products\/([^\"]+)[\"'][^>]*>.*?<img[^>]+src=[\"'](https:\/\/assets\.zatiqeasy\.com\/[^\"]+)[\"'][^>]*alt=[\"']([^\"']*)[\"'].*?<div[^>]*>([A-Za-z0-9\s&;]+)<\/div><h3[^>]*>([^<]+)<\/h3>.*?<span[^>]*>([0-9,]+)<\/span>(?:<span[^>]*line-through[^>]*>([0-9,]+)<\/span>)?/gs;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const slug = m[1].trim();
      if (!scrapedMap.has(slug)) {
        scrapedMap.set(slug, {
          slug,
          imageUrl: m[2].trim(),
          brandText: m[4].replace(/&amp;/g, '&').trim(),
          title: m[5].replace(/&amp;/g, '&').trim(),
          price: parseInt(m[6].replace(/,/g, ''), 10),
          compareAtPrice: m[7] ? parseInt(m[7].replace(/,/g, ''), 10) : null,
        });
      }
    }
  };

  for (const target of scrapingTargets) {
    for (const pageNum of target.pages) {
      let url = `https://bikepartsbd.net/products?page=${pageNum}`;
      if (target.id) url += `&category_id=${target.id}`;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
        if (res.ok) {
          const html = await res.text();
          parsePage(html);
        }
      } catch (err) {
        console.warn(`Error fetching ${target.name} page ${pageNum}`);
      }
    }
  }

  console.log(`📥 Scraped ${scrapedMap.size} unique products from bikepartsbd.net`);

  // Helper to determine category from product title
  const categorizeProduct = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('oil') || t.includes('yamalube') || t.includes('motul') || t.includes('lubricant') || t.includes('fluid')) {
      return 'engine-oil';
    }
    if (t.includes('sticker') || t.includes('decal') || t.includes('monogram')) {
      return 'stickers';
    }
    if (t.includes('tyre') || t.includes('tire') || t.includes('rim') || t.includes('wheel')) {
      return 'tyres-and-wheels';
    }
    if (t.includes('tank') || t.includes('panel') || t.includes('fairing') || t.includes('fender') || t.includes('mudguard') || t.includes('mask') || t.includes('cowling') || t.includes('kan') || t.includes('seat')) {
      return 'body-parts';
    }
    if (t.includes('headlight') || t.includes('light') || t.includes('indicator') || t.includes('lamp')) {
      return 'headlight-and-lighting';
    }
    if (t.includes('caliper') || t.includes('brake') || t.includes('pad') || t.includes('disc') || t.includes('break')) {
      return 'brake-parts';
    }
    if (t.includes('chain') || t.includes('sprocket')) {
      return 'chain-and-sprocket';
    }
    if (t.includes('shock') || t.includes('fork') || t.includes('chassis') || t.includes('arm')) {
      return 'suspension';
    }
    if (t.includes('ecu') || t.includes('sensor') || t.includes('wiring') || t.includes('relay') || t.includes('speedometer') || t.includes('regulator') || t.includes('harness') || t.includes('meter')) {
      return 'electrical';
    }
    if (t.includes('clutch') || t.includes('lever')) {
      return 'clutch-parts';
    }
    if (t.includes('filter')) {
      return 'filters';
    }
    if (t.includes('piston') || t.includes('crankshaft') || t.includes('cylinder') || t.includes('valve') || t.includes('engine') || t.includes('starter') || t.includes('throttle')) {
      return 'engine-parts';
    }
    return 'accessories';
  };

  // Helper to detect bike brand
  const detectBikeBrand = (title: string, brandText: string): number | null => {
    const text = (title + ' ' + brandText).toLowerCase();
    if (text.includes('yamaha')) return bikeBrandMap.get('yamaha') || null;
    if (text.includes('suzuki') || text.includes('gixxer')) return bikeBrandMap.get('suzuki') || null;
    if (text.includes('tvs') || text.includes('apache') || text.includes('raider')) return bikeBrandMap.get('tvs') || null;
    if (text.includes('bajaj') || text.includes('pulsar') || text.includes('platina')) return bikeBrandMap.get('bajaj') || null;
    if (text.includes('royal enfield') || text.includes('classic 350')) return bikeBrandMap.get('royal-enfield') || null;
    if (text.includes('honda')) return bikeBrandMap.get('honda') || null;
    if (text.includes('hero')) return bikeBrandMap.get('hero') || null;
    return null;
  };

  // Helper to detect bike model
  const detectBikeModel = (title: string): number | null => {
    const t = title.toLowerCase();
    for (const [modelName, modelId] of bikeModelMap.entries()) {
      if (t.includes(modelName.replace(/\s+/g, ' '))) {
        return modelId;
      }
      // Specific checks
      if (modelName === 'mt15 v1' && (t.includes('mt15 v1') || t.includes('mt-15 v1'))) return modelId;
      if (modelName === 'mt15 v2' && (t.includes('mt15 v2') || t.includes('mt-15 v2'))) return modelId;
      if (modelName === 'r15 v3' && t.includes('r15 v3')) return modelId;
      if (modelName === 'r15 v4 & r15m' && (t.includes('r15 v4') || t.includes('r15m'))) return modelId;
      if (modelName === 'fzs v2' && t.includes('fzs v2')) return modelId;
      if (modelName === 'fzs v3' && t.includes('fzs v3')) return modelId;
      if (modelName === 'fzs v4' && t.includes('fzs v4')) return modelId;
      if (modelName === 'gixxer sf (old model)' && (t.includes('gixxer sf old') || t.includes('old model'))) return modelId;
      if (modelName === 'rtr 4v' && t.includes('rtr 4v')) return modelId;
      if (modelName === 'rtr 2v (150 & 160)' && (t.includes('rtr 2v') || t.includes('rtr 160'))) return modelId;
      if (modelName === 'pulsar n160' && t.includes('n160')) return modelId;
    }
    return null;
  };

  // Helper to detect manufacturer brand
  const detectBrandId = (title: string, brandText: string): number => {
    const combined = (title + ' ' + brandText).toLowerCase();
    if (combined.includes('mrf')) return brandMap.get('mrf') || brandMap.get('universal')!;
    if (combined.includes('yamalube')) return brandMap.get('yamalube') || brandMap.get('yamaha')!;
    if (combined.includes('motul')) return brandMap.get('motul') || brandMap.get('universal')!;
    if (combined.includes('royal enfield')) return brandMap.get('royal-enfield')!;
    if (combined.includes('yamaha')) return brandMap.get('yamaha')!;
    if (combined.includes('suzuki')) return brandMap.get('suzuki')!;
    if (combined.includes('tvs')) return brandMap.get('tvs')!;
    if (combined.includes('bajaj')) return brandMap.get('bajaj')!;
    if (combined.includes('honda')) return brandMap.get('honda')!;
    if (combined.includes('hero')) return brandMap.get('hero')!;
    if (combined.includes('kayi')) return brandMap.get('kayi-corporation') || brandMap.get('universal')!;
    return brandMap.get('universal') || 1;
  };

  let importedCount = 0;
  let idx = 1000;

  for (const item of scrapedMap.values()) {
    idx++;
    const catSlug = categorizeProduct(item.title);
    const categoryId = categoryMap.get(catSlug) || categoryMap.get('accessories') || 1;
    const brandId = detectBrandId(item.title, item.brandText);
    const bikeBrandId = detectBikeBrand(item.title, item.brandText);
    const bikeModelId = detectBikeModel(item.title);

    // Realistic SKU
    const skuCode = `BM-${idx}-${item.slug.slice(-6).toUpperCase()}`;

    // Rich description
    const description = `100% Genuine and authentic ${item.title}. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.`;

    const isFeatured = importedCount < 16;
    const isPopular = importedCount % 4 === 0;

    // Price adjustments if missing
    let price = item.price;
    let discountPrice = item.compareAtPrice;
    if (discountPrice && discountPrice < price) {
      // Swap if needed
      const temp = price;
      price = discountPrice;
      discountPrice = temp;
    }
    if (!price || price <= 0) {
      price = 1500;
    }

    try {
      const product = await prisma.product.upsert({
        where: { slug: item.slug },
        update: {
          name: item.title,
          price,
          discountPrice,
          categoryId,
          brandId,
          bikeBrandId,
          bikeModelId,
          stock: Math.floor(Math.random() * 25) + 10,
        },
        create: {
          name: item.title,
          slug: item.slug,
          sku: skuCode,
          description,
          price,
          discountPrice,
          stock: Math.floor(Math.random() * 25) + 10,
          isFeatured,
          isPopular,
          categoryId,
          brandId,
          bikeBrandId,
          bikeModelId,
          images: {
            create: [
              {
                url: item.imageUrl,
                isPrimary: true,
              },
            ],
          },
        },
      });

      // Ensure product image exists
      const imgCount = await prisma.productImage.count({ where: { productId: product.id } });
      if (imgCount === 0) {
        await prisma.productImage.create({
          data: {
            url: item.imageUrl,
            isPrimary: true,
            productId: product.id,
          },
        });
      }

      importedCount++;
    } catch (upsertErr) {
      // Ignore or log
    }
  }

  console.log(`🎉 Successfully synchronized ${importedCount} exact products from bikepartsbd.net!`);
}

// Run directly if invoked
importFromBikePartsBD()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Import error:', e);
    process.exit(1);
  });
