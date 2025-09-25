'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import abi from './abi.json';
import { ConnectKitButton } from "connectkit";
import './globals.css'; // Yeni stil dosyasını ekledik

// Sözleşme adresinizi buraya girin
const CONTRACT_ADDRESS = "0x8a2313cB3341B5Da8fbe51c5f49f23D57B70130D";

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const [newNote, setNewNote] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const { data: notes, refetch: refetchNotes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getNotes',
    args: [],
    account: address,
    enabled: isConnected
  });

  const { writeContractAsync } = useWriteContract({
    onSuccess: () => refetchNotes() // İşlem başarıyla tamamlandığında notları yenile
  });
  
  const handleCreateNote = async () => {
    if (newNote.length > 0) {
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: abi,
          functionName: 'createNote',
          args: [newNote],
        });
        setNewNote('');
        console.log("Yeni not başarıyla oluşturuldu.");
      } catch (error) {
        console.error("Not oluşturma sırasında bir hata oluştu:", error);
      }
    }
  };

  const handleUpdateNote = async (index) => {
    if (editingContent.length > 0) {
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: abi,
          functionName: 'updateNote',
          args: [BigInt(index), editingContent],
        });
        setEditingIndex(null);
        setEditingContent('');
        console.log("Not başarıyla güncellendi.");
      } catch (error) {
        console.error("Not güncelleme sırasında bir hata oluştu:", error);
      }
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: 'deleteNote',
        args: [BigInt(index)],
      });
      console.log("Not başarıyla silindi.");
    } catch (error) {
      console.error("Not silme sırasında bir hata oluştu:", error);
    }
  };

  const renderNote = (note, index) => {
    const isEditing = editingIndex === index;
    const date = new Date(Number(note.timestamp) * 1000);

    return (
      <li key={index} className="note-item">
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full p-2 rounded text-black"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateNote(index)}
                className="btn btn-green flex-1"
              >
                Kaydet
              </button>
              <button
                onClick={() => setEditingIndex(null)}
                className="btn btn-red flex-1"
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <p className="text-lg">{note.content}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">
                {date.toLocaleString()}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingIndex(index);
                    setEditingContent(note.content);
                  }}
                  className="btn btn-yellow"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDeleteNote(index)}
                  className="btn btn-red"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24">
      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8">
        Onchain Not Defteri
      </h1>
      <div className="w-full max-w-xl text-center mb-8">
        <ConnectKitButton />
      </div>

      {isConnected ? (
        <div className="w-full max-w-xl">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Yeni notunuzu buraya yazın..."
              className="flex-1 p-3 rounded-lg text-black w-full"
            />
            <button
              onClick={handleCreateNote}
              className="btn btn-blue w-full sm:w-auto"
            >
              Not Ekle
            </button>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Notlarınız:
          </h2>
          <ul className="space-y-4">
            {notes && notes.length > 0 ? (
              notes.map(renderNote)
            ) : (
              <p className="text-center text-lg text-gray-400">
                Henüz notunuz yok. Bir not ekleyerek başlayın.
              </p>
            )}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-xl text-white">
          Lütfen cüzdanınızı bağlayın.
        </p>
      )}
    </main>
  );
}