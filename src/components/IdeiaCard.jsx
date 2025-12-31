import React from 'react';

export function IdeiaCard({ titulo, status, descricao, tags, votos, comentarios }) {
  const statusColor = status === 'Aprovada' ? 'bg-green-100 text-green-800' 
                    : status === 'Rejeitada' ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-[350px] flex flex-col font-sans">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-gray-800 leading-tight">{titulo}</h3>
        <span className={`${statusColor} text-xs font-bold px-2.5 py-0.5 rounded-full uppercase`}>
          {status}
        </span>
      </div>
      <div className="mb-4 flex-grow">
        <p className="text-gray-600 text-sm mb-3">{descricao}</p>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end items-center text-gray-500 text-sm gap-4 border-t border-gray-100 pt-3 mt-auto">
        <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
          <span>💬</span> {comentarios}
        </div>
        <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer font-medium transition-colors">
          <span>👍</span> {votos}
        </div>
      </div>
    </div>
  );
}