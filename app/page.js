'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import abi from './abi.json';
import { ConnectKitButton } from "connectkit";

const CONTRACT_ADDRESS = "0x78cCd766e9701e8B124E3078790d39D873F40996";

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingTag, setEditingTag] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: notes, refetch: refetchNotes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getNotes',
    args: [],
    account: address,
    enabled: isConnected
  });

  const { data: searchResults, refetch: refetchSearch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'searchNotes',
    args: [searchKeyword],
    account: address,
    enabled: isConnected && searchKeyword.length > 0
  });

  const { writeContractAsync } = useWriteContract({
    onSuccess: () => {
      refetchNotes();
      if (searchKeyword.length > 0) refetchSearch();
    }
  });
  
  const handleCreateNote = async () => {
    if (newNote.length > 0) {
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: abi,
          functionName: 'createNote',
          args: [newNote, newTag],
        });
        setNewNote('');
        setNewTag('');
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
          args: [BigInt(index), editingContent, editingTag],
        });
        setEditingIndex(null);
        setEditingContent('');
        setEditingTag('');
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
    } catch (error) {
      console.error("Not silme sırasında bir hata oluştu:", error);
    }
  };

  const handleSearch = () => {
    refetchSearch();
  };

  const renderNote = (note, index) => {
    const isEditing = editingIndex === index;
    const date = new Date(Number(note.timestamp) * 1000);

    return (
      <li key={index} className="bg-gray-800 p-4 rounded shadow-md">
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="p-2 rounded text-black"
            />
            <input
              type="text"
              value={editingTag}
              onChange={(e) => setEditingTag(e.target.value)}
              className="p-2 rounded text-black"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateNote(index)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
              >
                Kaydet
              </button>
              <button
                onClick={() => setEditingIndex(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded"
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">{note.content}</p>
              {note.tag && (
                <span className="bg-blue-800 text-xs font-semibold px-2 py-1 rounded mt-1 inline-block">
                  {note.tag}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditingIndex(index);
                  setEditingContent(note.content);
                  setEditingTag(note.tag);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDeleteNote(index)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                Sil
              </button>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-400 mt-2">{date.toLocaleString()}</p>
        </li>
      );
    };

    const notesToRender = searchKeyword.length > 0 ? searchResults : notes;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <h1 className="text-4xl font-bold mb-8">Onchain Not Defteri</h1>
        <ConnectKitButton />
        {isConnected ? (
          <div className="mt-8 w-full max-w-lg">
            {/* Arama Kutusu */}
            <div className="flex items-center space-x-4 mb-8">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Notlarınızda arama yapın..."
                className="flex-1 p-2 rounded text-black"
              />
              <button
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Ara
              </button>
            </div>

            {/* Not Oluşturma */}
            <div className="flex items-center space-x-4 mb-8">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Yeni notunuzu buraya yazın..."
                className="flex-1 p-2 rounded text-black"
              />
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Etiket ekleyin (isteğe bağlı)..."
                className="flex-1 p-2 rounded text-black"
              />
              <button
                onClick={handleCreateNote}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Not Ekle
              </button>
            </div>

            {/* Notları Listeleme */}
            <h2 className="text-2xl font-semibold mb-4">Notlarınız:</h2>
            <ul className="space-y-4">
              {notesToRender && notesToRender.length > 0 ? (
                notesToRender.map(renderNote)
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