import React, { useState } from 'react';

const SearchBar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productInput, setProductInput] = useState('');
  const [productData, setProductData] = useState(null);

  const fetchData = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const encodedProductInput = encodeURIComponent(productInput);

      const response = await fetch(`http://localhost:3000/api/${encodedProductInput}`);

      if (response.ok) {
        const data = await response.json();
        setProductData(data);
      } else {
        setProductData(null);
        console.error('Failed to fetch product data');
      }
    } catch (error) {
      setProductData(null);
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form className='flex flex-col gap-3' onSubmit={fetchData}>
        <div className='flex items-center gap-3'>
          <input
            className='flex-1 min-w-[200px] w-full p-3 border border-gray-300 rounded-lg shadow-xs text-base text-gray-500 focus:outline-none'
            type='text'
            placeholder="Product Name"
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
          />
          <button type='submit' className=' bg-gray-900 border border-gray-900 rounded-lg shadow-xs px-5 py-3 text-white text-base font-semibold hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40'>
            {isLoading ? 'Searching..' : 'Search'}
          </button>
        </div>

        {productData && Object.keys(productData).map((source) => (
          <div className='bg-white shadow-lg rounded-lg overflow-hidden my-5 ' key={source}>
            <div className='bg-red-500 text-white py-3 px-4'>
              <h1 className='font-bold text-3xl'>{source}</h1>
            </div>
            {Array.isArray(productData[source]) ? (
              productData[source].map((item, index) => (
                <div className='p-4 flex gap-10' key={index}>
                  <img src={item.img} alt={item.title} className='w-48 h-48 object-contain' />
                  <div>
                    <p className='text-xl font-semibold text-gray-800 my-2'>{item.title}</p>
                    <p className='text-lg text-gray-600 mb-2'>Price: {item.price}</p>

                    {item.originalPrice ? (
                      <p className='text-lg text-gray-600'>Original Price:<del>{item.originalPrice}</del> </p>
                    ): ''}
                    
                    {item.discount && (
                      <p className='text-lg text-green-500 py-2'>Discount: {item.discount}</p>
                    )}
                    <button>
                    <a href={item.url} target="_blank" className='bg-gray-900 border px-5 my-5 py-2 text-center border-gray-900  rounded-lg shadow-xs  text-white text-sm font-extralight hover:opacity-90 '>
                        View Product
                    </a></button>
                  </div>
                </div>
              ))
            ) : (
              <div className='p-4'>
                <p className='text-xl font-semibold text-gray-800'>No data available for this source.</p>
              </div>
            )}
          </div>
        ))}
        {!productData && <p>No data available.</p>}
      </form>
    </div>
  );
};

export default SearchBar;
