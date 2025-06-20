
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Route, Present, Credenciado } from '../types/map';

export class FirestoreService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    const routesRef = collection(db, 'routes');
    const q = query(routesRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
  }

  async addRoute(route: Omit<Route, 'id'>): Promise<string> {
    const routesRef = collection(db, 'routes');
    const docRef = await addDoc(routesRef, {
      ...route,
      userId: this.userId,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateRoute(routeId: string, route: Partial<Route>): Promise<void> {
    const routeRef = doc(db, 'routes', routeId);
    await updateDoc(routeRef, {
      ...route,
      updatedAt: Timestamp.now()
    });
  }

  async deleteRoute(routeId: string): Promise<void> {
    const routeRef = doc(db, 'routes', routeId);
    await deleteDoc(routeRef);
  }

  // Presents
  async getPresents(): Promise<Present[]> {
    const presentsRef = collection(db, 'presents');
    const q = query(presentsRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Present));
  }

  async addPresent(present: Omit<Present, 'id'>): Promise<string> {
    const presentsRef = collection(db, 'presents');
    const docRef = await addDoc(presentsRef, {
      ...present,
      userId: this.userId,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updatePresent(presentId: string, present: Partial<Present>): Promise<void> {
    const presentRef = doc(db, 'presents', presentId);
    await updateDoc(presentRef, {
      ...present,
      updatedAt: Timestamp.now()
    });
  }

  async deletePresent(presentId: string): Promise<void> {
    const presentRef = doc(db, 'presents', presentId);
    await deleteDoc(presentRef);
  }

  // Credenciados
  async getCredenciados(): Promise<Credenciado[]> {
    const credenciadosRef = collection(db, 'credenciados');
    const q = query(credenciadosRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Credenciado));
  }

  async addCredenciado(credenciado: Omit<Credenciado, 'id'>): Promise<string> {
    const credenciadosRef = collection(db, 'credenciados');
    const docRef = await addDoc(credenciadosRef, {
      ...credenciado,
      userId: this.userId,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateCredenciado(credenciadoId: string, credenciado: Partial<Credenciado>): Promise<void> {
    const credenciadoRef = doc(db, 'credenciados', credenciadoId);
    await updateDoc(credenciadoRef, {
      ...credenciado,
      updatedAt: Timestamp.now()
    });
  }

  async deleteCredenciado(credenciadoId: string): Promise<void> {
    const credenciadoRef = doc(db, 'credenciados', credenciadoId);
    await deleteDoc(credenciadoRef);
  }

  // Real-time listeners
  subscribeToRoutes(callback: (routes: Route[]) => void) {
    const routesRef = collection(db, 'routes');
    const q = query(routesRef, where('userId', '==', this.userId));
    return onSnapshot(q, (snapshot) => {
      const routes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
      callback(routes);
    });
  }

  subscribeToPresents(callback: (presents: Present[]) => void) {
    const presentsRef = collection(db, 'presents');
    const q = query(presentsRef, where('userId', '==', this.userId));
    return onSnapshot(q, (snapshot) => {
      const presents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Present));
      callback(presents);
    });
  }

  subscribeToCredenciados(callback: (credenciados: Credenciado[]) => void) {
    const credenciadosRef = collection(db, 'credenciados');
    const q = query(credenciadosRef, where('userId', '==', this.userId));
    return onSnapshot(q, (snapshot) => {
      const credenciados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Credenciado));
      callback(credenciados);
    });
  }
}
