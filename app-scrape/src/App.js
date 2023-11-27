import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
const App = () => {


  return (

      <section className="px-6 md:px-20 py-24 ">
    <div className="flex max-xl:flex-col gap-16">
        <div className='flex flex-col justify-center'>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl ">Make Your Life Easier!</h1>
        <p className="mb-8 text-sm font-normal text-gray-500 ">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore, aliquid dignissimos culpa vitae adipisci nesciunt quis natus harum deserunt laudantium!</p>
            <SearchBar/>
        </div>
    </div>
</section>
      
  );
};

export default App;
