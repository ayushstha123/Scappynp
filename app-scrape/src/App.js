import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
const App = () => {


  return (

      <section className="px-6 md:px-20 py-24 ">
    <div className="flex max-xl:flex-col gap-16">
        <div className='flex flex-col justify-center'>
        <h1 className="mb-10 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-6xl ">Get the <span className='text-blue-500'>same product </span>at the <span className='text-blue-500'>cheapest rate</span></h1>
        <p className="mb-8 text-lg font-normal text-gray-500  ">Make Your Life Easier!</p>
            <SearchBar/>
        </div>
    </div>
</section>
      
  );
};

export default App;
