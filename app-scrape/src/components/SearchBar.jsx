import React, { useState,useEffect } from 'react';


const SearchBar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [productInput, setProductInput] = useState('');
  const [productData, setProductData] = useState(null);

  const fetchData = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLoadingProgress(0);

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
      setLoadingProgress(100);
    }
  };

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prevProgress) => Math.min(prevProgress + 5, 95));
      }, 600);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Helper function to clean and convert the price to a numeric value
  const cleanAndConvertPrice = (priceString) => {
    const cleanedString = typeof priceString === 'string' ? priceString : '';
    return parseFloat(cleanedString.replace(/[^0-9.]/g, '')) || 0;
  };

  // Find the cheapest product
  const findCheapestProduct = () => {
    let cheapestProduct = null;

    Object.keys(productData || {}).forEach((source) => {
      if (Array.isArray(productData[source])) {
        productData[source].forEach((item) => {
          // Clean and convert the price to a numeric value
          const currentPrice = cleanAndConvertPrice(item.price);

          // Check if the product has a lower price
          if (!cheapestProduct || currentPrice < cleanAndConvertPrice(cheapestProduct.price)) {
            cheapestProduct = {
              ...item,
              source,
            };
          }
        });
      }
    });

    return cheapestProduct;
  };

  const renderCheapestProduct = () => {
    const cheapestProduct = findCheapestProduct();

    return cheapestProduct ? (
      
      <div className='bg-blue-300 shadow-lg rounded-lg overflow-hidden my-5'>
        
        <div className='bg-blue-500 text-white py-3 px-4'>
          <h1 className='font-medium text-2xl'>Cheapest Product</h1>
        </div>
        <div className='p-4 flex gap-10 border'>
          <img src={cheapestProduct.img} alt={cheapestProduct.title} className='w-28 h-28 object-contain' />
          <div>
            <p className='text-xl font-semibold text-gray-800 my-2'>{cheapestProduct.title}</p>
            <p className='text-lg text-gray-600 mb-2'>Price: {cheapestProduct.price}</p>

            {cheapestProduct.originalPrice && (
              <p className='text-lg text-gray-600'>Original Price:<del>{cheapestProduct.originalPrice}</del> </p>
            )}

            {cheapestProduct.discount && (
              <p className='text-lg text-green-500 py-2'>Discount: {cheapestProduct.discount}</p>
            )}
            <button>
              <a
                href={cheapestProduct.url}
                target='_blank'
                className='bg-gray-900 border px-5 py-1 text-center border-gray-900 rounded-lg shadow-xs text-white text-sm font-extralight hover:opacity-90 '
              >
                View
              </a>
            </button>
          </div>
        </div>
      </div>
    ) : null;
  };


  return (
    <div>
      <form className='flex flex-col gap-3' onSubmit={fetchData}>
        <div className='flex items-center gap-3'>
          <input
            className='flex-1 min-w-[200px] w-full p-3 border border-gray-300 rounded-lg shadow-xs text-base text-gray-500 focus:outline-none'
            type='text'
            placeholder="Please be specific with your product name eg. t-shirt, shoes, laptop etc."
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
          />
          <button type='submit' className=' bg-gray-900 border border-gray-900 rounded-lg shadow-xs px-5 py-3 text-white text-base font-semibold hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40'>
            {isLoading ? 'Searching..' : 'Search'}
          </button>
          
        </div>

        {isLoading ? (
          <div className='m-5 text-center text-sm font-light'>
            Loading... it might take sometime depending on your internet connection {loadingProgress}% complete
            <div className='relative pt-1'>
              <div className='flex mb-2 items-center justify-between'>
                <div className='text-right'>
                  <span className='text-xs font-semibold inline-block text-gray-600'>
                    {loadingProgress}%
                  </span>
                </div>
              </div>
              <div className='flex h-2 mb-4 overflow-hidden text-xs'>
                <div
                  style={{ width: `${loadingProgress}%` }}
                  className='flex flex-col justify-center bg-gray-300'
                ></div>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}

        {renderCheapestProduct()}

        {Object.keys(productData || {}).map((source) => (
          <div className='bg-white shadow-lg rounded-lg overflow-hidden my-5 ' key={source}>
            <div className='bg-red-500 text-white py-3 px-4'>
              <h1 className='font-bold text-3xl'>{source}</h1>
            </div>
            {Array.isArray(productData[source]) ? (
              productData[source].map((item, index) => (
                <div className='p-4 flex gap-10 border' key={index}>
                  <img src={item.img} alt={item.title} className='w-48 h-48 object-contain' />
                  <div>
                    <p className='text-xl font-semibold text-gray-800 my-2'>{item.title}</p>
                    <p className='text-lg text-gray-600 mb-2'>Price: Rs. {item.price}</p>

                    {item.originalPrice && (
                      <p className='text-lg text-gray-600'>Original Price:<del>{item.originalPrice}</del> </p>
                    )}
                    
                    {item.discount && (
                      <p className='text-lg text-green-500 py-2'>Discount: {item.discount}</p>
                    )}
                    <button>
                      <a href={item.url} target='_blank' className='bg-gray-900 border px-5 my-5 py-2 text-center border-gray-900  rounded-lg shadow-xs  text-white text-sm font-extralight hover:opacity-90 '>
                        View Product
                      </a>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='p-4'>
                <p className='text-xl font-semibold text-red-800'>No data available for this source.</p>
              </div>
            )}
          </div>
        ))}
        {!productData ? <p>No data available.</p> : ''}
        
      </form>
    </div>
  );
};

export default SearchBar;