'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import axios from 'axios';
import Auth from '@/components/Auth';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [variant, setVariant] = useState<'login' | 'register'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleVariant = () => {
    if (isLoading) return;
    setVariant(prev => (prev === 'login' ? 'register' : 'login'));
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: any = { email, password };

      if (variant === 'register') {
        data.fullName = fullName;
        data.username = username;
      }

      const endpoint = variant === 'register'
        ? `${window.location.origin}/api/authenticate/register`
        : `${window.location.origin}/api/authenticate/login`;

      const response = await axios.post(endpoint, data);
      const { success, message } = response.data;

      if (!success) {
        setErrorMessage(message || 'Something went wrong.');
        return;
      }

      window.location.href = '/';
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Something went wrong. Try again later.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 py-10 px-4">
      <div className="w-full max-w-[440px] border border-gray-300 bg-white px-8 sm:px-10 pt-10 pb-6 mb-3 flex flex-col items-center gap-4">
        <div className="mb-4">
          <Image 
            src="/images/insta-written.png"
            width={175}
            height={50}
            alt="Instagram Logo"
            className="object-contain"
          />
        </div>

        <Auth
          variant={variant}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          setErrorMessage={setErrorMessage}
          email={email}
          fullName={fullName}
          username={username}
          password={password}
          setEmail={setEmail}
          setFullName={setFullName}
          setUsername={setUsername}
          setPassword={setPassword}
        />

        {errorMessage && (
          <p className="text-red-500 text-xs mt-2 text-center">
            {errorMessage}
          </p>
        )}

        {variant === 'register' && (
          <p className="text-xs text-center text-neutral-500 mt-4 leading-tight">
            By signing up, you agree to our <span className="font-semibold">Terms</span>,{' '}
            <span className="font-semibold">Privacy Policy</span> and{' '}
            <span className="font-semibold">Cookies Policy</span>.
          </p>
        )}
      </div>

      <div className="w-full max-w-[440px] border border-gray-300 bg-white py-4 flex justify-center items-center text-sm">
        <p className="text-neutral-700">
          {variant === 'register' ? 'Have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={toggleVariant} 
            className="text-sky-500 font-semibold ml-1 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {variant === 'register' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>

      {variant === 'login' && (
        <div className="mt-4 text-sm text-sky-500 cursor-pointer hover:underline">
          Forgot password?
        </div>
      )}
    </div>
  );
};

export default Page;
