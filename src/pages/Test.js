import React, { useEffect } from 'react'
import { Link } from "react-router-dom";
import axios from 'axios';
const delay = ms => new Promise(res => setTimeout(res, ms));

const Test = () => {

    const handleTest = async () => {
        let limit = 4;
        for (let i = 1; i <= limit; i++) {
            try {
                console.log('requesting ' + ' ' + i);
                await delay(5000);
                const res = await axios.get('https://jsonplaceholder.typicode.com/posts/' + i);
                await delay(5000);
                console.log('waiting');
            } catch (error) {
                console.log(error);
            }
        }
    }
    return (
        <div className='w-full h-screen'>
            <Link to='/' className='flex items-center justify-center h-12 ml-5 text-white bg-blue-900 rounded-md w-36 no-drag'>تنظیمات</Link>
            <button onClick={handleTest} className='w-48 h-16 bg-red-500'>start</button>
        </div>
    )
}

export default Test