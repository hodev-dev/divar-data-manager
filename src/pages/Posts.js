import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx/xlsx.mjs';
import DataGrid from 'react-data-grid';

import delayAdapterEnhancer from 'axios-delay';





const delay = ms => new Promise(res => setTimeout(res, ms));
const api = axios.create({
    adapter: delayAdapterEnhancer(axios.defaults.adapter)
});

const Posts = () => {
    const [tokens, setTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState({});
    const [phones, setPhones] = useState([]);
    const [status, setStatus] = useState('EMPTY');
    const [req, setReq] = useState(0);
    const [reqStatus, setReqStatus] = useState(0);
    const [url, setUrl] = useState('https://divar.ir/s/ahvaz/job');
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(7);

    useEffect(() => {
        if (localStorage.getItem('phonesConfig') !== null) {
            setTokens(JSON.parse(localStorage.getItem('phonesConfig')));
            setSelectedToken(JSON.parse(localStorage.getItem('phonesConfig'))[0]);
            setReq(JSON.parse(localStorage.getItem('phonesConfig'))[0].req);
        }
        setUrl(localStorage.getItem('url'));
    }, []);

    const makeFetchClass = () => {
        if (reqStatus === 1) {
            return 'bg-yellow-600';
        } else if (reqStatus === 2) {
            return 'bg-green-700';
        }
        else if (reqStatus === 0) {
            return 'bg-red-900';
        }
        else {
            return 'bg-red-900';
        }
    }
    const handleFetch = async () => {
        let limit = endPage;
        for (let currentPage = startPage; currentPage <= limit; currentPage++) {
            console.log('request page:', currentPage);
            const request = await api.get(url + '?page=' + currentPage, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                delay: (currentPage + 1) * 2000,
            });
            var div = document.createElement('div');
            div.innerHTML = request.data.trim();
            const script = div.getElementsByTagName('script')[7];
            await eval(script.textContent);
            const data = JSON.parse(window.__PRELOADED_STATE__);
            const { items } = data.browse;
            console.log({ data });
            await handlePhone(items, currentPage);
            console.log('end of request!')
        }
    }

    const handlePhone = async (posts, currentPage) => {
        posts.forEach(async (post, index) => {
            const { title, token } = post.data;
            console.log('requesting phone...', post, index);
            try {
                const request = await api.get(`https://api.divar.ir/v5/posts/${token}/contact/`, {
                    headers: {
                        'Authorization': 'Bearer' + ' ' + selectedToken.token,
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    delay: ((index + 1) * (currentPage + 1)) * 10000,
                    credentials: 'same-origin',
                });
                setPhones((prevPhones) => {
                    const data = [...prevPhones, { contact: request.data.widgets.contact, page: currentPage, reqIndex: index, ...post.data }];
                    console.log({ data });
                    return data;
                })
                let updatedTokens = tokens.map((token) => {
                    if (Number(token.number) === Number(selectedToken.number)) {
                        token.req = token.req + 1;
                    }
                    return token;
                });
                localStorage.setItem('phonesConfig', JSON.stringify(updatedTokens));
                const filter = updatedTokens.find((token) => token.number === selectedToken.number);
                setTokens([...updatedTokens]);
                setReq(Number(filter.req));
                await delay(1000);
            } catch (error) {
                console.log(error);
            }
        });
        console.log('done');
        setStatus("SUCCESS");
    }

    const handleStore = () => {
        localStorage.setItem('phones', JSON.stringify(phones));
        console.log('saved in localStorage!');
    }

    const handleRead = () => {
        const _phones = localStorage.getItem('phones');
        if (_phones !== null) {
            setPhones(JSON.parse(_phones));
            setStatus('SUCCESS');
            console.log('loaded from localStorage!');
        } else {
            alert('رکوردی وجود ندارد')
        }
    }

    const handleUrl = (e) => {
        setUrl(e.target.value);
        localStorage.setItem('url', e.target.value);
    }

    const filterExcel = () => {
        return phones.map((phone, _index) => {
            return {
                index: _index + 1,
                page: phone.page,
                reqIndex: phone.reqIndex,
                token: phone.token,
                title: phone.title,
                city: phone.city,
                district: phone.district,
                category: phone.category,
                topDescription: phone.topDescription,
                phone: phone.contact.phone,
            }
        })
    }

    const handleExportExcel = () => {
        var ws = XLSX.utils.json_to_sheet(filterExcel(phones));
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "phones");
        XLSX.writeFile(wb, 'phones.xlsx');
    }

    const handleSelectToken = (e) => {
        if (localStorage.getItem('phonesConfig') !== null) {
            const parse = JSON.parse(localStorage.getItem('phonesConfig'));
            setSelectedToken(parse[e.target.value]);
            setReq(parse[e.target.value].req);
        }
    }
    const renderSelectToken = () => {
        const phonesConfigString = localStorage.getItem('phonesConfig');
        if (phonesConfigString !== null) {
            const phonesConfig = JSON.parse(phonesConfigString);
            return phonesConfig && phonesConfig.map((phoneConfig, index) => {
                return (
                    <option key={phoneConfig.number} className='min-h-[4rem] h-16 text-2xl  outline-none no-drag' value={index}>{phoneConfig.number}</option>
                )
            })
        }
    }

    const renderContacts = () => {
        if (status === 'EMPTY') {
            return (
                <div className='flex w-full h-16 text-white border border-zinc-700 ' dir='rtl'>
                    <div className='flex items-center justify-center w-full p-4 text-white '>{'رکوردی وجود ندارد'}</div>
                </div>
            )
        }
        else if (status === 'SUCCESS') {
            return phones.map((phone, index) => {
                return (
                    <div key={index} className='flex w-full h-16 border border-zinc-900 hover:bg-red-900' dir='rtl'>
                        <div className='flex items-center w-1/12 p-4 text-white'>{phone.page}</div>
                        <div className='flex items-center w-1/12 p-4 text-white'>{phone.reqIndex}</div>
                        <div className='flex items-center w-4/12 p-4 text-white'>{phone.title}</div>
                        <div className='flex items-center w-4/12 p-4 text-white'>{phone.contact.phone}</div>
                        <div className='flex items-center w-4/12 p-4 text-white'>{phone.category}</div>
                        <div className='flex items-center w-4/12 p-4 text-white'>{phone.city}</div>
                        <div className='flex items-center w-4/12 p-4 text-white'>{phone.district}</div>
                        <div className='flex items-center w-4/12 p-4 text-white'>{phone.topDescription}</div>
                    </div>
                )
            })
        }
        else {
            return <div>error</div>
        }
    }


    return (
        <div className='flex flex-col w-full min-h-screen bg-zinc-900 '>
            <div className='flex flex-row w-full h-auto mt-2 shadow bg-zinc-900 drag'>
                <button onClick={handleStore} className='h-12 ml-5 text-white bg-green-900 rounded-md w-36 no-drag'>دخیره</button>
                <button onClick={handleRead} className='h-12 ml-5 text-white bg-yellow-900 rounded-md w-36 no-drag'>بارگداری</button>
                <Link to='/' className='flex items-center justify-center h-12 ml-5 text-white bg-blue-900 rounded-md w-36 no-drag'>تنظیمات</Link>
                <input onChange={handleUrl} value={url} className='w-4/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' placeholder='لیتک' />
                <button onClick={handleFetch} className={`h-12 ml-5 text-white ${makeFetchClass()} rounded-md w-36 no-drag`}>استخراج اطلاعات</button>
                <button onClick={handleExportExcel} className='h-12 ml-5 text-white bg-teal-900 rounded-md w-36 no-drag'>اکسل</button>
            </div>
            <div className='flex flex-row w-full h-auto mt-2 shadow bg-zinc-900 drag'>
                <select onChange={handleSelectToken} className='w-6/12 h-12 ml-5 font-mono text-xl text-center outline-none text-zinc-300 bg-zinc-800 no-drag'>
                    {renderSelectToken()}
                </select >
                <div className='flex items-center justify-center h-12 ml-5 text-white 6/12'>
                    تعداد درخواست
                </div>
                <div className='flex items-center justify-center h-12 ml-5 text-white 6/12'>
                    {req}
                </div>
                <div className='flex items-center justify-center h-12 ml-5 text-white 6/12'>
                    <span className='ml-2'>شروع</span>
                    <input onChange={(e) => setStartPage(e.target.value)} value={startPage} type={'text'} className='w-4/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                    <span className='ml-2'>پایان</span>
                    <input onChange={(e) => setEndPage(e.target.value)} value={endPage} type={'text'} className='w-4/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                </div>
            </div>
            <div className='mt-2 no-drag bg-zinc-800'>
                <div className='flex w-full h-16 border border-zinc-900 hover:bg-red-900' dir='rtl'>
                    <div className='flex items-center w-1/12 p-4 text-white'>صفحه</div>
                    <div className='flex items-center w-1/12 p-4 text-white'>ردیف</div>
                    <div className='flex items-center w-4/12 p-4 text-white'>عنوان</div>
                    <div className='flex items-center w-4/12 p-4 text-white'>موبایل</div>
                    <div className='flex items-center w-4/12 p-4 text-white'>گروه</div>
                    <div className='flex items-center w-4/12 p-4 text-white'>شهر</div>
                    <div className='flex items-center w-4/12 p-4 text-white'>منطقه</div>
                    <div className='flex items-center w-4/12 p-4 text-white'>توضیحات</div>
                </div>
                {renderContacts()}
            </div>
        </div>
    )
}

export default Posts