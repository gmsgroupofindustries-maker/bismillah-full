export const SHOP_INFO = {
  name: 'Bismillah Motors',
  tagline: 'Yamaha, Suzuki, TVS Bike Parts & Stickers',
  address: 'Jashore Sadar, 7400, Bangladesh',
  phone: '+8801974060224',
  whatsappRaw: '8801974060224', // numbers without plus for wa.me links
  email: 'marianatrench6900@gmail.com',
  deliveryFeeJashore: 60,
  deliveryFeeNationwide: 120,
};

export const BANGLADESH_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur',
  'Chittagong', 'Chuadanga', 'Comilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni',
  'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah',
  'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur',
  'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj',
  'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Nawabganj', 'Netrokona',
  'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi',
  'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet',
  'Tangail', 'Thakurgaon'
];

export function generateWhatsAppMessage(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerDistrict: string;
  notes?: string | null;
  totalAmount: number;
  deliveryFee: number;
  items: Array<{
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}) {
  const itemLines = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   SKU: \`${item.productSku}\`\n   Qty: ${item.quantity} x ৳${item.price} = ৳${item.subtotal}`
    )
    .join('\n\n');

  const message = `*🏍️ NEW ORDER ON BISMILLAH MOTORS*\n` +
    `----------------------------------------\n` +
    `*Order ID:* ${order.orderNumber}\n` +
    `*Customer:* ${order.customerName}\n` +
    `*Phone:* ${order.customerPhone}\n` +
    `*WhatsApp:* ${order.customerWhatsapp}\n` +
    `*District:* ${order.customerDistrict}\n` +
    `*Address:* ${order.customerAddress}\n` +
    (order.notes ? `*Notes:* ${order.notes}\n` : '') +
    `----------------------------------------\n` +
    `*ITEMS ORDERED:*\n` +
    `${itemLines}\n` +
    `----------------------------------------\n` +
    `*Delivery Fee:* ৳${order.deliveryFee}\n` +
    `*Total (Cash on Delivery):* ৳${order.totalAmount}\n` +
    `----------------------------------------\n` +
    `_Please confirm my order and share courier dispatch details._`;

  return message;
}

export function getWhatsAppUrl(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
