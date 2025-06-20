import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types/map';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  cpf: string;
  phone: string;
  birthDate: string;
  userType: 'cliente' | 'transportadora';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Buscar perfil do usuário no Firestore
        fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = useCallback(async (user: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          id: user.uid,
          email: userData.email,
          name: userData.name,
          cpf: userData.cpf,
          phone: userData.phone,
          birthDate: userData.birthDate,
          userType: userData.userType,
          visualizationRadius: userData.visualizationRadius || 10,
          raioVisualizacao: userData.raioVisualizacao || userData.visualizationRadius || 10,
          createdAt: userData.createdAt?.toDate() || new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const register = async (userData: RegisterData) => {
    const { email, password, ...profileData } = userData;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Salvar dados do usuário no Firestore
    await setDoc(doc(db, 'usuarios', user.uid), {
      ...profileData,
      email,
      visualizationRadius: 10, // Padrão de 10km
      raioVisualizacao: 10, // Padrão de 10km
      createdAt: new Date()
    });

    // Atualizar o perfil local
    setUserProfile({
      id: user.uid,
      ...profileData,
      email,
      visualizationRadius: 10,
      raioVisualizacao: 10,
      createdAt: new Date()
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    await updateDoc(doc(db, 'usuarios', currentUser.uid), data);
    
    if (userProfile) {
      setUserProfile({ ...userProfile, ...data });
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    await updatePassword(currentUser, newPassword);
  };

  const updateUserEmail = async (newEmail: string) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    await updateEmail(currentUser, newEmail);
    await updateDoc(doc(db, 'usuarios', currentUser.uid), { email: newEmail });
    
    if (userProfile) {
      setUserProfile({ ...userProfile, email: newEmail });
    }
  };

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    updateUserProfile,
    updateUserPassword,
    updateUserEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
