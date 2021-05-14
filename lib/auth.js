import React, { useState, useEffect, useContext, createContext } from 'react';
import { createUser } from './db';
import firebase from './firebase';

const formatUser = user => {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    provider: user.provideData[0].provider,
  }
}

const authContext = createContext();

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
}

function useProvideAuth() {
  const [user, setUser] = useState(null);

  const handleUser = rawUser => {
    if (rawUser) {
      const user = formatUser(user);

      createUser(user.uid, user);
      setUser(user);
      return user;
    } else {
      setUser(false);
      return user;
    }
  }

  const signInWithGithub = () => {
    return firebase
      .auth()
      .signInWithPopup(new firebase.auth.GithubAuthProvider())
      .then(handleUser);
  }

  const signOut = () => {
    return firebase
      .auth()
      .signOut()
      .then(handleUser);
  }

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(handleUser);
    return () => unsubscribe();
  });

  return {
    user,
    signInWithGithub,
    signOut,
  }
}
