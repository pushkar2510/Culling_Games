import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useToast } from './ToastContext';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Listen to Firebase auth state; rebuild user object from ID token claims
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = tokenResult.claims.role || null;
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role,
          });
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login: authenticate with Firebase directly on the client
  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await credential.user.getIdTokenResult();
      const role = tokenResult.claims.role || null;

      const userObj = {
        uid: credential.user.uid,
        email: credential.user.email,
        role,
      };
      setUser(userObj);

      addToast(`Access Granted: ${role}`, 'success');

      if (role === 'MASTER') navigate('/master/dashboard');
      else if (role === 'COORDINATOR') navigate('/coordinator/dashboard');
      else navigate('/team/dashboard');

      return true;
    } catch (error) {
      const errMsg = error.message || 'Login failed. Check credentials.';
      addToast(errMsg, 'error');
      throw error;
    }
  };

  // Register: calls backend which creates the Firebase Auth user + Firestore doc
  const register = async (formData) => {
    try {
      await api.post('/auth/register', {
        name: formData.teamName,
        email: formData.email,
        password: formData.password,
        role: 'TEAM',
      });

      addToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Registration failed';
      addToast(errMsg, 'error');
      throw error;
    }
  };

  // Logout: sign out of Firebase (all tokens invalidated client-side)
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log('Firebase sign-out error:', e);
    } finally {
      setUser(null);
      navigate('/login');
      addToast('Logged out successfully', 'info');
    }
  };

  // Expose token getter so api.js can call it
  const getToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

