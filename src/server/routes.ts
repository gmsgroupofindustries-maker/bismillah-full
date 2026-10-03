import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from './db.ts';
import { generateToken, requireAdmin, AuthenticatedRequest } from './auth.ts';
import { SHOP_INFO, BANGLADESH_DISTRICTS, generateWhatsAppMessage, getWhatsAppUrl } from './constants.ts';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION (ADMIN)
// ==========================================
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

apiRouter.post('/auth/google-admin', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const allowedAdminEmails = ['gmsgroupofindustries@gmail.com', 'admin@bismillahmotors.com'];

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user && allowedAdminEmails.includes(normalizedEmail)) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: 'GOOGLE_AUTH_SESSION',
          name: 'Owner Admin',
          role: 'ADMIN',
        },
      });
    }

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Access denied. This account does not have store administrator privileges.',
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google Admin Auth error:', error);
    return res.status(500).json({ error: 'Failed to authenticate admin via Google' });
  }
});

apiRouter.get('/auth/me', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.adminUser });
});

// ==========================================
// 2. PUBLIC PRODUCTS CATALOG & SEARCH
// ==========================================
apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const {
      category,
      brand,
      bikeBrand,
      bikeModel,
      search,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      isPopular,
      sort,
      page = '1',
      limit = '16',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string) || 16));
    const skip = (pageNum - 1) * take;

    // Build Prisma where clause
    const where: any = {};

    if (category) {
      where.category = {
        slug: String(category),
      };
    }

    if (brand) {
      where.brand = {
        slug: String(brand),
      };
    }

    if (bikeBrand) {
      where.bikeBrand = {
        slug: String(bikeBrand),
      };
    }

    if (bikeModel) {
      where.bikeModel = {
        slug: String(bikeModel),
      };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (inStock === 'true' || inStock === '1') {
      where.stock = { gt: 0 };
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (isPopular === 'true') {
      where.isPopular = true;
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      orderBy = [{ isPopular: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          category: true,
          brand: true,
          bikeBrand: true,
          bikeModel: true,
          images: {
            orderBy: { isPrimary: 'desc' },
          },
        },
      }),
    ]);

    return res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / take),
      limit: take,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

apiRouter.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        bikeBrand: true,
        bikeModel: true,
        images: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Fetch up to 4 related products from same category or bike brand
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        OR: [
          { categoryId: product.categoryId },
          { bikeBrandId: product.bikeBrandId || undefined },
          { brandId: product.brandId },
        ],
      },
      take: 4,
      include: {
        category: true,
        brand: true,
        images: true,
      },
      orderBy: { isPopular: 'desc' },
    });

    return res.json({ product, relatedProducts });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

// ==========================================
// 3. TAXONOMIES (CATEGORIES, BRANDS, BIKE MODELS)
// ==========================================
apiRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

apiRouter.get('/brands', async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

apiRouter.get('/bike-brands', async (_req: Request, res: Response) => {
  try {
    const bikeBrands = await prisma.bikeBrand.findMany({
      include: {
        models: {
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(bikeBrands);
  } catch (error) {
    console.error('Error fetching bike brands:', error);
    return res.status(500).json({ error: 'Failed to fetch bike brands' });
  }
});

apiRouter.get('/districts', (_req: Request, res: Response) => {
  return res.json({
    districts: BANGLADESH_DISTRICTS,
    shopInfo: SHOP_INFO,
  });
});

// ==========================================
// 4. CHECKOUT & ORDERS (CASH ON DELIVERY)
// ==========================================
apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerWhatsapp,
      customerAddress,
      customerDistrict,
      notes,
      items,
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !customerDistrict) {
      return res.status(400).json({
        error: 'Name, Phone, Address, and District are mandatory fields for delivery.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Please select products.' });
    }

    // Determine delivery charge: Jashore Sadar = ৳60, Elsewhere = ৳120
    const isJashore = customerDistrict.trim().toLowerCase() === 'jashore';
    const deliveryFee = isJashore ? SHOP_INFO.deliveryFeeJashore : SHOP_INFO.deliveryFeeNationwide;

    // Verify products and calculate total
    let itemsSubtotal = 0;
    const validatedItems: Array<{
      productId: number;
      productName: string;
      productSku: string;
      price: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: Number(item.productId) },
      });

      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} was not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available stock is ${product.stock}.`,
        });
      }

      const activePrice = product.discountPrice ? product.discountPrice : product.price;
      const subtotal = activePrice * item.quantity;
      itemsSubtotal += subtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        price: activePrice,
        quantity: item.quantity,
        subtotal,
      });
    }

    const totalAmount = itemsSubtotal + deliveryFee;

    // Generate unique order number e.g. BM-20261002-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BM-${dateStr}-${randomSuffix}`;

    // Execute order creation in Prisma transaction and decrement stock
    const newOrder = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create order
      return tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerWhatsapp: (customerWhatsapp || customerPhone).trim(),
          customerAddress: customerAddress.trim(),
          customerDistrict: customerDistrict.trim(),
          notes: notes ? notes.trim() : null,
          totalAmount,
          deliveryFee,
          status: 'Pending',
          items: {
            create: validatedItems.map((vi) => ({
              productId: vi.productId,
              productName: vi.productName,
              productSku: vi.productSku,
              price: vi.price,
              quantity: vi.quantity,
              subtotal: vi.subtotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });

    // Generate pre-filled WhatsApp message for user to send directly
    const whatsappMessage = generateWhatsAppMessage({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerWhatsapp: newOrder.customerWhatsapp,
      customerAddress: newOrder.customerAddress,
      customerDistrict: newOrder.customerDistrict,
      notes: newOrder.notes,
      totalAmount: newOrder.totalAmount,
      deliveryFee: newOrder.deliveryFee,
      items: newOrder.items,
    });

    const whatsappUrl = getWhatsAppUrl(SHOP_INFO.whatsappRaw, whatsappMessage);

    return res.status(201).json({
      success: true,
      order: newOrder,
      whatsappMessage,
      whatsappUrl,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Order could not be placed. Please try again.' });
  }
});

// Order tracking by Order Number and Phone
apiRouter.get('/orders/track/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    const where: any = { orderNumber };
    if (phone) {
      where.customerPhone = { contains: String(phone).trim() };
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please verify your order number.' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Order tracking error:', error);
    return res.status(500).json({ error: 'Failed to look up order' });
  }
});

// ==========================================
// 5. ADMIN DASHBOARD & MANAGEMENT (SECURE)
// ==========================================
apiRouter.get('/admin/dashboard', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      allOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'Pending' } }),
      prisma.order.count({ where: { status: 'Delivered' } }),
      prisma.product.count(),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        select: { id: true, name: true, sku: true, stock: true, price: true },
        take: 10,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.findMany({
        where: { status: { not: 'Cancelled' } },
        select: { totalAmount: true, createdAt: true },
      }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return res.json({
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
});

// Admin Orders list with filtering and status update
apiRouter.get('/admin/orders', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = String(status);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { customerDistrict: { contains: q } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    ]);

    return res.json({
      orders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Admin orders list error:', error);
    return res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

apiRouter.patch('/admin/orders/:id/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: { items: true },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin Product CRUD
apiRouter.post('/admin/products', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      sku,
      description,
      price,
      discountPrice,
      stock,
      isFeatured,
      isPopular,
      categoryId,
      brandId,
      bikeBrandId,
      bikeModelId,
      images,
    } = req.body;

    if (!name || !sku || !price || !categoryId || !brandId) {
      return res.status(400).json({ error: 'Name, SKU, Price, Category, and Brand are required.' });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        sku: sku.trim().toUpperCase(),
        description: description ? description.trim() : '',
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock) || 0,
        isFeatured: Boolean(isFeatured),
        isPopular: Boolean(isPopular),
        categoryId: Number(categoryId),
        brandId: Number(brandId),
        bikeBrandId: bikeBrandId ? Number(bikeBrandId) : null,
        bikeModelId: bikeModelId ? Number(bikeModelId) : null,
        images: {
          create: Array.isArray(images) && images.length > 0
            ? images.map((img: string | { url: string; isPrimary?: boolean }, idx: number) => ({
                url: typeof img === 'string' ? img : img.url,
                isPrimary: typeof img === 'string' ? idx === 0 : Boolean(img.isPrimary),
              }))
            : [
                {
                  url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
                  isPrimary: true,
                },
              ],
        },
      },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });

    return res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A product with this SKU or Slug already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

apiRouter.put('/admin/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      sku,
      description,
      price,
      discountPrice,
      stock,
      isFeatured,
      isPopular,
      categoryId,
      brandId,
      bikeBrandId,
      bikeModelId,
      images,
    } = req.body;

    const productId = Number(id);

    // Update images if provided
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: string | { url: string; isPrimary?: boolean }, idx: number) => ({
            productId,
            url: typeof img === 'string' ? img : img.url,
            isPrimary: typeof img === 'string' ? idx === 0 : Boolean(img.isPrimary),
          })),
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name?.trim(),
        slug: slug?.trim(),
        sku: sku?.trim().toUpperCase(),
        description: description?.trim(),
        price: price !== undefined ? parseFloat(price) : undefined,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isPopular: isPopular !== undefined ? Boolean(isPopular) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        brandId: brandId ? Number(brandId) : undefined,
        bikeBrandId: bikeBrandId !== undefined ? (bikeBrandId ? Number(bikeBrandId) : null) : undefined,
        bikeModelId: bikeModelId !== undefined ? (bikeModelId ? Number(bikeModelId) : null) : undefined,
      },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });

    return res.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A product with this SKU or Slug already exists.' });
    }
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

apiRouter.patch('/admin/products/:id/stock', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock))) {
      return res.status(400).json({ error: 'Valid stock number is required' });
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { stock: Math.max(0, parseInt(stock)) },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating stock:', error);
    return res.status(500).json({ error: 'Failed to update stock' });
  }
});

apiRouter.delete('/admin/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    return res.json({ success: true, message: 'Product successfully deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Admin Categories CRUD
apiRouter.post('/admin/categories', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const cat = await prisma.category.create({
      data: { name: name.trim(), slug: cleanSlug, description, imageUrl },
    });
    return res.status(201).json(cat);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

apiRouter.delete('/admin/categories/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: Number(id) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete category. Ensure no products are linked.' });
  }
});

// Admin Brands CRUD
apiRouter.post('/admin/brands', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, logoUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Brand name is required' });
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const brand = await prisma.brand.create({
      data: { name: name.trim(), slug: cleanSlug, logoUrl },
    });
    return res.status(201).json(brand);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create brand' });
  }
});

apiRouter.delete('/admin/brands/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { id: Number(id) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete brand' });
  }
});
