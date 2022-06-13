import axios from 'axios';
import React, { useEffect, useLayoutEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { read, writeFileXLSX } from "xlsx";
import { Store } from 'react-notifications-component';

export const Home = () => {
    const [token, setToken] = useState('');
    const [phonesConfig, setPhonesConfig] = useState([]);
    const [inputPhone, setInputPhone] = useState('');
    const [inputToken, setInputToken] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [showTOTP, setShowTOPTP] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('phonesConfig') !== null) {
            setPhonesConfig(JSON.parse(localStorage.getItem('phonesConfig')))
        }
    }, [])


    const handleTokenInput = (e) => {
        setToken(e.target.value);
        localStorage.setItem('phonesConfig', e.target.value);
    }

    const handleAddToken = () => {
        const test = phonesConfig.some((config) => {
            if (config.number === inputPhone) {
                return true;
            } else {
                return false;
            }
        });
        if (test === false) {
            const newPhones = [...phonesConfig, { number: inputPhone, token: inputToken, req: 0 }];
            setPhonesConfig(newPhones)
            localStorage.setItem('phonesConfig', JSON.stringify(newPhones));
        } else {
            alert('این شماره قبلا ثبت شده است');
        }
    }

    const handleClipboard = (text) => {
        navigator.clipboard.writeText(text.toString()).then(() => {
        });
    }

    const handleDeleteToken = (index) => {
        phonesConfig.splice(index, 1);
        localStorage.setItem('phonesConfig', JSON.stringify(phonesConfig));
        setPhonesConfig([...phonesConfig]);
    }

    const handleReset = (index) => {
        phonesConfig[index].req = 0;
        localStorage.setItem('phonesConfig', JSON.stringify(phonesConfig));
    }

    const handleTOPTP = async () => {
        const res = await axios.post('https://api.divar.ir/v5/auth/authenticate', { 'phone': inputPhone }, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        });
        const { authenticate_response } = res.data;
        if (authenticate_response === "AUTHENTICATION_VERIFICATION_CODE_SENT") {
            setShowTOPTP(true);
            Store.addNotification({
                title: "Wonderful!",
                message: "کد تایید ارسال شد",
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
        }
    }

    const confirmTOTP = async () => {
        try {
            const res = await axios.post(' https://api.divar.ir/v5/auth/confirm', { 'phone': inputPhone, code: inputCode }, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            });
            const { token } = res.data;
            const test = phonesConfig.some((config) => {
                if (config.number === inputPhone) {
                    return true;
                } else {
                    return false;
                }
            });
            if (test === false) {
                const newPhones = [...phonesConfig, { number: inputPhone, token: token, req: 0 }];
                setPhonesConfig(newPhones)
                localStorage.setItem('phonesConfig', JSON.stringify(newPhones));
            } else {
                Store.addNotification({
                    title: "Wonderful!",
                    message: "این شماره قبلا ثبت شده است",
                    type: "success",
                    insert: "top",
                    container: "bottom-center",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
            }
        } catch (error) {
            Store.addNotification({
                title: "Error!",
                message: error.toString(),
                type: "danger",
                insert: "top-center",
                container: "top-center",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        }
    }

    const renderToken = () => {
        return phonesConfig && phonesConfig.map((phoneConfig, index) => {
            return (
                <div key={index} className='flex flex-col justify-center w-6/12 h-auto p-8 mt-5 shadow bg-zinc-800 no-drag'>
                    <details className='text-zinc-300 no-drag'>
                        <summary className='text-lg font-bold no-drag'>{phoneConfig.number}</summary>
                        <p className='break-words no-drag'>{phoneConfig.token}</p>
                        <div className='flex w-full'>
                            <button onClick={() => handleDeleteToken(index)} className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-red-800 cursor-pointer text-bold no-drag' to={'posts'}>حذف</button>
                            <button onClick={() => handleClipboard(phoneConfig.token)} className='flex items-center self-center justify-center w-48 h-16 mt-5 ml-5 text-white cursor-pointer bg-stone-600 text-bold no-drag' to={'posts'}>کپی</button>
                            <button onClick={() => handleReset(index)} className='flex items-center self-center justify-center w-48 h-16 mt-5 ml-5 text-white bg-yellow-600 cursor-pointer text-bold no-drag' to={'posts'}>ریست</button>
                        </div>
                    </details >
                </div >
            )
        })
    }

    const renderTOTP = () => {
        if (showTOTP) {
            return (
                <div className='flex flex-col justify-center w-6/12 h-auto p-8 mt-16 shadow bg-zinc-800 no-drag'>
                    <label className='text-right text-gray-500'>کد یکبار مصرف</label>
                    <input onChange={(e) => setInputCode(e.target.value)} value={inputCode} className=' font-mono text-center outline-none bg-zinc-900 text-white text-2xl  w-full min-h-[4rem] h-auto p-4 mt-4 text flex justify-start items-start no-drag' type={'text'} />
                    <button onClick={confirmTOTP} className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-green-800 cursor-pointer text-bold no-drag'>تایید</button>
                </div>
            )
        }
        return null;
    }

    return (
        // <div className='flex flex-col items-center justify-center w-full h-auto min-h-screen bg-zinc-900 drag '>
        //     <div className='flex flex-col justify-center w-6/12 h-auto p-8 mt-16 shadow bg-zinc-800'>
        //         <label className='text-right text-gray-500'>استخراح اطلاعات</label>
        //         <Link className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-red-800 cursor-pointer text-bold no-drag' to={'posts'}>ورود</Link>
        //     </div>
        //     <div className='flex flex-col justify-center w-6/12 h-auto p-8 mt-5 shadow bg-zinc-800'>
        //         <label className='text-right text-gray-500'>شماره موبایل</label>
        //         <input onChange={(e) => setInputPhone(e.target.value)} value={inputPhone} className=' font-mono text-center outline-none bg-zinc-900 text-white text-2xl  w-full min-h-[4rem] h-auto p-4 mt-4 text flex justify-start items-start no-drag' type={'text'} />
        //         <button className='text-right text-gray-500'>شماره موبایل</button>
        //         <label className='mt-4 text-right text-gray-500'>توکن:</label>
        //         <textarea onChange={(e) => setInputToken(e.target.value)} value={inputToken} className=' font-mono bg-zinc-900 text-white text-2xl  w-full min-h-[16rem] h-auto p-4 mt-4 text flex justify-start items-start no-drag' type={'text'} />
        //         {/* <Link className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-green-800 cursor-pointer text-bold no-drag' to={'posts'}>افزودن</Link> */}
        //         <button onClick={handleAddToken} className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-green-800 cursor-pointer text-bold no-drag' to={'posts'}>افزودن</button>
        //     </div>
        //     {renderToken()}
        // </div>
        <div className='flex flex-col items-center justify-center w-full h-auto min-h-screen bg-zinc-900 drag '>
            <div className='flex flex-col justify-center w-6/12 h-auto p-8 mt-16 shadow bg-zinc-800'>
                <Link className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-blue-800 cursor-pointer text-bold no-drag' to={'posts'}>ورود</Link>
            </div>
            <div className='flex flex-col justify-center w-6/12 h-auto p-8 mt-16 shadow bg-zinc-800'>
                <label className='text-right text-gray-500'>شماره موبایل</label>
                <input onChange={(e) => setInputPhone(e.target.value)} value={inputPhone} className=' font-mono text-center outline-none bg-zinc-900 text-white text-2xl  w-full min-h-[4rem] h-auto p-4 mt-4 text flex justify-start items-start no-drag' type={'text'} />
                <button onClick={handleTOPTP} className='flex items-center self-center justify-center w-48 h-16 mt-5 text-white bg-red-800 cursor-pointer text-bold no-drag'>دریافت کد یکبار مصرف</button>
            </div>
            {renderTOTP()}
            {renderToken()}
        </div>
    )
}
