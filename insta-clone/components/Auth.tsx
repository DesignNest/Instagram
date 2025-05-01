'use client';
import React from 'react';

type AuthProps = {
  variant: 'login' | 'register';
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  setErrorMessage: (msg: string) => void;
  email: string;
  fullName: string;
  username: string;
  password: string;
  setEmail: (email: string) => void;
  setFullName: (name: string) => void;
  setUsername: (username: string) => void;
  setPassword: (pass: string) => void;
};

const Auth = ({
  variant,
  isLoading,
  handleSubmit,
  setErrorMessage,
  email,
  fullName,
  username,
  password,
  setEmail,
  setFullName,
  setUsername,
  setPassword
}: AuthProps) => {
  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
if(variant == 'register'){
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (variant === 'register') {
      if (fullName.trim().length < 2) {
        setErrorMessage('Full name must be at least 2 characters long.');
        return;
      }
      if (!/^[a-zA-Z0-9._]{3,30}$/.test(username)) {
        setErrorMessage('Username must be 3-30 characters long and can only include letters, numbers, underscores and periods.');
        return;
      }
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
}
    setErrorMessage('');
    handleSubmit(e);

  };

  return (
    <form onSubmit={validateAndSubmit} className="flex flex-col gap-2 w-full">
      <input 
        type="email"
        placeholder="Email"
        disabled={isLoading}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 bg-neutral-50 border border-gray-300 rounded text-sm outline-none focus:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      {variant === 'register' && (
        <>
          <input 
            type="text"
            placeholder="Full Name"
            disabled={isLoading}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-gray-300 rounded text-sm outline-none focus:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <input 
            type="text"
            placeholder="Username"
            disabled={isLoading}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-gray-300 rounded text-sm outline-none focus:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </>
      )}
      <input 
        type="password"
        placeholder="Password"
        disabled={isLoading}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 bg-neutral-50 border border-gray-300 rounded text-sm outline-none focus:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <button 
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full bg-sky-500 hover:bg-sky-600 transition text-white font-semibold text-sm py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Please wait...' : variant === 'register' ? 'Sign up' : 'Log in'}
      </button>
    </form>
  );
};

export default Auth;
