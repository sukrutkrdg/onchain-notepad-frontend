'use client';

import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { useState } from 'react';
import abi from './abi.json';
import { ConnectKitButton } from "connectkit";

const CONTRACT_ADDRESS = "0x06549fC8614530A91d219fac7baA93e8ef3BF8F2";

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const [newNote, setNewNote] = useState('');

  const { data: notes, refetch: refetchNotes } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getNotes',
    args: [],
    account: address,
    enabled: isConnected
  });

  const { write: createNote } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'createNote',
    args: [newNote],
    onSuccess() {
      setNewNote('');
      refetchNotes();
    }
  });

  const handleCreateNote = () => {
    if (newNote.length > 0) {
      createNote();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Onchain Not Defteri</h1>
      <ConnectKitButton />
      {isConnected ? (
        <div className="mt-8 w-full max-w-lg">
          <div className="flex items-center space-x-4 mb-8">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Yeni notunuzu buraya yazın..."
              className="flex-1 p-2 rounded text-black"
            />
            <button
              onClick={handleCreateNote}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Not Ekle
            </button>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Notlarınız:</h2>
          <ul className="space-y-4">
            {notes && notes.length > 0 ? (
              notes.map((note, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded shadow-md">
                  <p className="text-lg">{note.content}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(Number(note.timestamp) * 1000).toLocaleString()}
                  </p>
                </li>
              ))
            ) : (
              <p>Henüz notunuz yok. Bir not ekleyerek başlayın.</p>
            )}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-xl">Lütfen cüzdanınızı bağlayın.</p>
      )}
    </main>
  );
}