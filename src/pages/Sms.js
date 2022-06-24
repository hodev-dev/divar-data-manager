import axios from 'axios';
import React, { useEffect, useLayoutEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { read, writeFileXLSX } from "xlsx";
import { Store } from 'react-notifications-component';

const delay = ms => new Promise(res => setTimeout(res, ms));

const Sms = () => {
    const [name, setName] = useState('1');
    const [from, setFrom] = useState('3000505');
    const [to, setTo] = useState('');
    const [toCollection, setToCollection] = useState([]);

    useEffect(() => {
        if (localStorage.getItem('name') !== null) {
            setName(localStorage.getItem('name'));
        }
        if (localStorage.getItem('from') !== null) {
            setFrom(localStorage.getItem('from'));
        }
        if (localStorage.getItem('toCollection') !== null) {
            setToCollection(JSON.parse(localStorage.getItem('toCollection')));
        }
    }, [])

    const handleName = (e) => {
        setName(e.target.value);
        localStorage.setItem('name', e.target.value);
    }

    const handleFrom = (e) => {
        setFrom(e.target.value);
        localStorage.setItem('from', e.target.value);
    }

    const handleTo = (e) => {
        setTo(e.target.value);
    }

    const handleAddToCollection = () => {
        setToCollection((prevState) => {
            const data = [...prevState, to];
            localStorage.setItem('toCollection', JSON.stringify(data));
            return data;
        });
    }

    const handleRemove = (index) => {
        toCollection.splice(index, 1);
        setToCollection([...toCollection]);
        localStorage.setItem('toCollection', JSON.stringify(toCollection));
    }

    const handleTestSms = async () => {
        if (toCollection.length > 0) {
            for (let i = 0; i <= toCollection.length - 1; i++) {
                try {
                    console.log('sending sms to:', ' ', toCollection[i]);
                    const res = await axios.get(`http://ippanel.com:8080/?apikey=vRMQht_M9Jnn6TqwXujXWBuSqZiSRj_FId8yzbJk9tg=&pid=jqrbj1u7bqs7n7v&fnum=${from}&tnum=${toCollection[i]}&p1=num&v1=${name}&p2=count&v2=3000`);
                    Store.addNotification({
                        title: "Success!",
                        message: toCollection[i].toString(),
                        type: "success",
                        insert: "top",
                        container: "top-right",
                        animationIn: ["animate__animated", "animate__fadeIn"],
                        animationOut: ["animate__animated", "animate__fadeOut"],
                        dismiss: {
                            duration: 5000,
                            onScreen: true
                        }
                    });
                } catch (error) {
                    console.log(error);
                    Store.addNotification({
                        title: "Error!",
                        message: error.toString(),
                        type: "danger",
                        insert: "top",
                        container: "top-right",
                        animationIn: ["animate__animated", "animate__fadeIn"],
                        animationOut: ["animate__animated", "animate__fadeOut"],
                        dismiss: {
                            duration: 5000,
                            onScreen: true
                        }
                    });
                }
            }
        }
    };

    const renderToCollection = () => {
        return toCollection.map((to, index) => {
            return (
                <div key={to} className='flex flex-row items-center justify-center w-6/12 h-auto p-8 mt-5 text-white shadow bg-zinc-800'>
                    <div className='flex justify-start w-6/12 text-lg tracking-widest'>{to}</div>
                    <div className='flex justify-end w-6/12'>
                        <button onClick={() => handleRemove(index)} className='w-48 h-16 bg-red-500'>حذف</button>
                    </div>
                </div>
            )
        });
    }

    return (
        <div className='w-full min-h-screen bg-zinc-900'>
            <div className='w-full h-16 bg-zinc-800'>
                <Link className='flex items-center self-center justify-center w-48 h-16 text-white cursor-pointer bg-rose-800 text-bold no-drag' to={'/'}>بازگشت</Link>
            </div>
            <div className='flex flex-col items-center justify-center w-full h-auto min-h-screen bg-zinc-900 drag '>
                <div className='flex flex-col justify-center w-6/12 h-auto p-8 mt-5 shadow bg-zinc-800'>
                    <label className='text-right text-gray-500'>نام سیستم</label>
                    <input onChange={handleName} value={name} className=' font-mono text-center outline-none bg-zinc-900 text-white text-2xl  w-full min-h-[4rem] h-auto p-4 mt-4 text flex justify-start items-start no-drag' type={'text'} />
                    <label className='mt-5 text-right text-gray-500'>شماره فرستنده</label>
                    <input onChange={handleFrom} value={from} className=' font-mono text-center outline-none bg-zinc-900 text-white text-2xl  w-full min-h-[4rem] h-auto p-4 mt-4 text flex justify-start items-start no-drag' type={'text'} />
                    <label className='mt-5 text-right text-gray-500'>شماره گیرنده</label>
                    <input onChange={handleTo} value={to} className=' font-mono text-center outline-none bg-zinc-900 text-white text-2xl  w-full min-h-[4rem] h-auto p-4 mt-4 text flex justify-start items-start no-drag' type={'text'} />
                    <button onClick={handleAddToCollection} className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-green-700 rounded-md cursor-pointer text-bold no-drag'>افزودن شماره گرنده</button>
                    <button onClick={handleTestSms} className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-indigo-700 rounded-md cursor-pointer text-bold no-drag'>تست</button>
                </div>
                {renderToCollection()}
            </div>
        </div>
    )
}

export default Sms;