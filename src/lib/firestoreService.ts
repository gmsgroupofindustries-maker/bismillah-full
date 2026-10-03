import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';

export interface FirestoreOrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface FirestoreOrderPayload {
  orderId: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  district: string;
  city: string;
  items: FirestoreOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
  notes?: string;
}

/**
 * Creates and stores a new order in Firebase Firestore
 */
export async function saveOrderToFirestore(orderData: FirestoreOrderPayload): Promise<void> {
  const collectionPath = 'orders';
  const orderDocRef = doc(db, collectionPath, orderData.orderId);

  try {
    await setDoc(orderDocRef, {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${orderData.orderId}`);
  }
}

/**
 * Fetch orders for a specific logged-in user
 */
export async function fetchUserOrdersFromFirestore(userId: string): Promise<FirestoreOrderPayload[]> {
  const collectionPath = 'orders';
  try {
    const q = query(collection(db, collectionPath), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as FirestoreOrderPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    return [];
  }
}

/**
 * Save customer inquiry to Firestore
 */
export async function saveInquiryToFirestore(data: {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}): Promise<string> {
  const collectionPath = 'inquiries';
  const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, collectionPath, inquiryId);

  try {
    await setDoc(docRef, {
      inquiryId,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      subject: data.subject || 'General Inquiry',
      message: data.message,
      status: 'unread',
      createdAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
    });
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${inquiryId}`);
    return '';
  }
}
