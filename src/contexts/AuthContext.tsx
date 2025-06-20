
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types/map';

interface UserRegistrationData {
  email: string;
  password: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (data: UserRegistrationData) => {
    const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    const userData: User = {
      id: user.uid,
      email: data.email,
      nomeCompleto: data.nomeCompleto,
      cpf: data.cpf,
      telefone: data.telefone,
      dataNascimento: data.dataNascimento,
      raioVisualizacao: 10, // 10km padrão
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'usuarios', user.uid), userData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    
    const userRef = doc(db, 'usuarios', currentUser.uid);
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    await updateDoc(userRef, updateData);
    
    if (data.email && data.email !== currentUser.email) {
      await updateEmail(currentUser, data.email);
    }
    
    // Atualizar estado local
    if (userData) {
      setUserData({ ...userData, ...updateData });
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) return;
    await updatePassword(currentUser, newPassword);
  };

  const fetchUserData = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'usuarios', uid));
    if (userDoc.exists()) {
      setUserData({ id: uid, ...userDoc.data() } as User);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
