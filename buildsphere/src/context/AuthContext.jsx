import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { readJSON, removeKey, writeJSON } from '../utils/storage';

/*
 * DEMO AUTHENTICATION — NOT SECURE.
 * There is no server. Accounts live in this browser's localStorage and the
 * "session" is just a flag. Passwords are hashed (SHA-256) before saving so
 * no plaintext password is stored, but this is still only a prototype.
 */

const SESSION_KEY = 'buildsphere:session';
const USERS_KEY = 'buildsphere:users';

const AuthContext = createContext(null);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function hashPassword(email, password) {
  const input = `buildsphere-demo:${email}:${password}`;
  if (window.crypto?.subtle) {
    const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for non-secure origins where SubtleCrypto is unavailable.
  let hash = 5381;
  for (const char of input) hash = (hash * 33) ^ char.charCodeAt(0);
  return `fallback-${(hash >>> 0).toString(16)}`;
}

export function nameFromEmail(email) {
  const local = email.split('@')[0] || '';
  const name = local
    .split(/[._\-\d]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
  return name || 'Student';
}

function readSession() {
  return readJSON(SESSION_KEY, null, window.localStorage) ?? readJSON(SESSION_KEY, null, window.sessionStorage);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  /** remember = true → localStorage (survives closing the browser); false → sessionStorage (this tab only). */
  const startSession = useCallback((sessionUser, remember) => {
    const value = { ...sessionUser, remember, demo: true, startedAt: Date.now() };
    removeKey(SESSION_KEY, window.localStorage);
    removeKey(SESSION_KEY, window.sessionStorage);
    writeJSON(SESSION_KEY, value, remember ? window.localStorage : window.sessionStorage);
    setUser(value);
  }, []);

  const login = useCallback(
    async ({ email, password, remember }) => {
      await wait(800); // Simulated network delay so the loading state is visible.
      const normalized = email.trim().toLowerCase();
      const account = readJSON(USERS_KEY, []).find((u) => u.email === normalized);

      // If this email was registered in the demo, the password must match.
      // Any other valid email is accepted so the demo is easy to try.
      if (account) {
        const hash = await hashPassword(normalized, password);
        if (hash !== account.passwordHash) {
          throw new Error('That password doesn’t match the demo account saved for this email.');
        }
      }

      startSession(
        {
          name: account?.name ?? nameFromEmail(normalized),
          email: normalized,
          college: account?.college ?? '',
        },
        remember
      );
    },
    [startSession]
  );

  /** Saves a demo account. Does not sign in — call startSession afterwards. */
  const register = useCallback(async ({ name, email, password, college }) => {
    await wait(900);
    const normalized = email.trim().toLowerCase();
    const users = readJSON(USERS_KEY, []);
    if (users.some((u) => u.email === normalized)) {
      throw new Error('A demo account with this email already exists in this browser. Log in instead.');
    }
    const record = {
      name: name.trim(),
      email: normalized,
      college: college.trim(),
      passwordHash: await hashPassword(normalized, password),
      createdAt: Date.now(),
    };
    writeJSON(USERS_KEY, [...users, record]);
    return { name: record.name, email: record.email, college: record.college };
  }, []);

  const hasDemoAccount = useCallback(
    (email) => readJSON(USERS_KEY, []).some((u) => u.email === email.trim().toLowerCase()),
    []
  );

  const removeDemoAccount = useCallback((email) => {
    const normalized = email.trim().toLowerCase();
    const users = readJSON(USERS_KEY, []);
    const next = users.filter((u) => u.email !== normalized);
    writeJSON(USERS_KEY, next);
    return next.length !== users.length;
  }, []);

  const logout = useCallback(() => {
    removeKey(SESSION_KEY, window.localStorage);
    removeKey(SESSION_KEY, window.sessionStorage);
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (changes) => {
      if (!user) return;
      const next = { ...user, ...changes };
      writeJSON(SESSION_KEY, next, user.remember ? window.localStorage : window.sessionStorage);
      const users = readJSON(USERS_KEY, []);
      const index = users.findIndex((u) => u.email === user.email);
      if (index >= 0) {
        users[index] = { ...users[index], name: next.name, college: next.college };
        writeJSON(USERS_KEY, users);
      }
      setUser(next);
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, login, register, startSession, logout, updateUser, hasDemoAccount, removeDemoAccount }),
    [user, login, register, startSession, logout, updateUser, hasDemoAccount, removeDemoAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
