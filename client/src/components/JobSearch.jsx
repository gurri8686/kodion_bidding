import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

export default function JobSearch({
  setSearchTerm,
  searchTerm,
  handleclearSearch,
  onSearch,
  page='jobs' // default to empty function if not provided
}) {
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Update search term immediately on change
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedValue = searchTerm.trim();

    setError('');
    setSearchTerm(trimmedValue);
    if (onSearch) {
      onSearch();
    }
  };

  const handleClearInput = () => {
    setSearchTerm('');
    setError('');
    handleclearSearch();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={page === 'applied' ? "Search by job title, client, or profile..." : "Search job title..."}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </>
  );
}
