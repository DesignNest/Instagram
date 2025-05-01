'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SearchPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const router = useRouter()
  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/data/getUsers');
        setUsers(res.data.users);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [isOpen]);

  const filteredUsers = users.filter(
    (user: any) =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className={`fixed top-0 left-0 h-full w-[400px] z-40 bg-white border-r border-gray-200 shadow-lg px-6 py-6 transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
      }`}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-poppins">Search</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-black transition">
          <X size={22} />
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full px-4 py-2 bg-[#efefef] text-sm rounded-lg focus:outline-none "
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
            onClick={() => setQuery('')}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {query.length === 0 ? (
        <div className="flex items-center justify-center h-[70%] text-gray-400 text-sm font-medium">
          Try searching for people
        </div>
      ) : (
        <div className="mt-2">
          {filteredUsers.length > 0 ? (
            <ul className="space-y-3">
              {filteredUsers.map((user: any) => (
                <li
                  key={user.email}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={()=>{
                    router.push(`/profile/${user.email}`)
                    onClose()
                  }}
                >
                  
                  <Image
                    src={user.profilePhoto}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.fullName}</p>
                  </div>
                 
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
