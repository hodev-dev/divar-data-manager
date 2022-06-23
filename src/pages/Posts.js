import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx/xlsx.mjs';
import DataGrid from 'react-data-grid';
import { Store } from 'react-notifications-component';
import { FaSave, FaRegFileExcel, FaDatabase, FaCog, FaPlay } from 'react-icons/fa';

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
    const [reqLimit, setReqLimit] = useState(2);
    const [lastReqTime, setLastReqTime] = useState('-');
    const [reqStatus, setReqStatus] = useState(0);
    const [url, setUrl] = useState('https://divar.ir/s/ahvaz/job');
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(7);
    const [delayState, setDelayState] = useState(20000);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (localStorage.getItem('phonesConfig') !== null) {
            if (JSON.parse(localStorage.getItem('phonesConfig')).length > 0) {
                setTokens(JSON.parse(localStorage.getItem('phonesConfig')));
                setSelectedToken(JSON.parse(localStorage.getItem('phonesConfig'))[0]);
                setReq(JSON.parse(localStorage.getItem('phonesConfig'))[0].req);
                setLastReqTime(JSON.parse(localStorage.getItem('phonesConfig'))[0].time);
            }
        }
        if (localStorage.getItem('startPage') !== null) {
            setStartPage(localStorage.getItem('startPage'));
        }
        if (localStorage.getItem('endPage') !== null) {
            setEndPage(localStorage.getItem('endPage'));
        }
        if (localStorage.getItem('delayState') !== null) {
            setDelayState(localStorage.getItem('delayState'));
        }
        if (localStorage.getItem('reqLimit') !== null) {
            setReqLimit(localStorage.getItem('reqLimit'));
        }
        if (localStorage.getItem('url') !== null) {
            setUrl(localStorage.getItem('url'));
        }
    }, []);

    // useEffect(() => {
    //     getTokenBaseOnRequest();
    // }, [selectedToken]);

    const makeFetchClass = () => {
        if (reqStatus === 1) {
            return 'bg-yellow-500';
        } else if (reqStatus === 2) {
            return 'bg-green-500';
        }
        else if (reqStatus === 0) {
            return 'bg-red-500';
        }
        else {
            return 'bg-red-900';
        }
    }
    const handleFetch = async () => {
        let limit = endPage;
        setReqStatus(1);
        for (let currentPage = startPage; currentPage <= limit; currentPage++) {
            try {
                console.log('request page:', currentPage);
                const request = await api.get(url + '?page=' + currentPage, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                });
                var div = document.createElement('div');
                div.innerHTML = request.data.trim();
                var script = div.getElementsByTagName('script')[7];
                await eval(script.textContent);
                var data = JSON.parse(window.__PRELOADED_STATE__);
                var { items } = data.browse;
                await delay(2000);
                console.log({ data });
                await handlePhone(items, currentPage);
                await delay(2000);
                console.log('end of request!');
            } catch (error) {
                setErrors((prevErrors) => [...prevErrors, { page: currentPage, index: currentPage, msg: error.toString(), time: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds().toString() }])
                await delay(5000);
                Store.addNotification({
                    title: "خطا",
                    message: error.toString(),
                    type: "danger",
                    insert: "top-right",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                break;
            }
        }
        Store.addNotification({
            title: "پایان عملیات",
            message: 'پایان',
            type: "success",
            insert: "top-right",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
                duration: 500000000000000000000000000000000,
                onScreen: true
            }
        });
        setReqStatus(0);
    }

    const getTokenBaseOnRequest = () => {
        if (tokens.length > 0) {
            const token = tokens.find((token) => token.req <= reqLimit - 1);
            return token
        }
    }

    const handlePhone = async (posts, currentPage) => {
        console.log({ posts });
        for (let i = 0; i <= posts.length - 1; i++) {
            setReqStatus(2)
            console.log(i, currentPage);
            const { title, token } = posts[i].data;
            console.log('requesting phone...', posts[i], i);
            try {
                const _availableToken = getTokenBaseOnRequest();
                if (_availableToken !== undefined) {
                    console.log({ _availableToken });
                    const request = await api.get(`https://api.divar.ir/v5/posts/${token}/contact/`, {
                        headers: {
                            'Authorization': 'Bearer' + ' ' + _availableToken.token,
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        // delay: ((index + 1) * (currentPage + 1)) * 10000,
                        credentials: 'same-origin',
                    });
                    setPhones((prevPhones) => {
                        const data = [...prevPhones, { contact: request.data.widgets.contact, page: currentPage, reqIndex: i, ...posts[i].data, ..._availableToken }];
                        handleStore(data);
                        return data;
                    });
                    let updatedTokens = tokens.map((token) => {
                        if (Number(token.number) === Number(_availableToken.number)) {
                            token.req = token.req + 1;
                            token.time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds().toString();
                        }
                        return token;
                    });
                    localStorage.setItem('phonesConfig', JSON.stringify(updatedTokens));
                    const filter = updatedTokens.find((token) => token.number === selectedToken.number);
                    setTokens([...updatedTokens]);
                    setReq(Number(filter.req));
                    setLastReqTime(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds().toString());
                    setStatus("SUCCESS");
                    console.log('start wait');
                    await delay(delayState);
                } else {
                    console.log('all phone has reached limit!');
                    throw 'ظرفیت همه شما ره ها تکمیل شده است';
                }
            } catch (error) {
                setErrors((prevErrors) => {
                    const data = [...prevErrors, { page: currentPage, index: i, msg: error.toString(), time: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds().toString() }];
                    handleStoreError(data);
                    return data;
                })
                await delay(5000);
                Store.addNotification({
                    title: "خطا",
                    message: error.toString(),
                    type: "danger",
                    insert: "top-right",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                break;
            }
        }
        console.log('done', ' ', currentPage);
    }

    const handleStore = (data) => {
        try {
            if (data) {
                localStorage.setItem('phones', JSON.stringify(data));
            } else {
                localStorage.setItem('phones', JSON.stringify(phones));
            }
            Store.addNotification({
                title: "دخیره شد",
                message: 'با موقیت ذخیره شد',
                type: "success",
                insert: "top-right",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        } catch (error) {
            Store.addNotification({
                title: "خطا",
                message: 'خطا در ذخیره اطلاعات',
                type: "danger",
                insert: "top-right",
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

    const handleStoreError = (data) => {
        try {
            if (data) {
                localStorage.setItem('errors', JSON.stringify(data));
            } else {
                localStorage.setItem('errors', JSON.stringify(errors));
            }
        } catch (error) {
            Store.addNotification({
                title: "خطا",
                message: 'خطا در ذخیره خطاها',
                type: "danger",
                insert: "top-right",
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

    const handleRead = () => {
        const _phones = localStorage.getItem('phones');
        const _errors = localStorage.getItem('errors');
        if (_phones !== null) {
            setPhones(JSON.parse(_phones));
            setErrors(JSON.parse(_errors));
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
        XLSX.writeFile(wb, '.xlsx');
    }

    const handleSelectToken = (e) => {
        if (localStorage.getItem('phonesConfig') !== null) {
            const parse = JSON.parse(localStorage.getItem('phonesConfig'));
            setSelectedToken(parse[e.target.value]);
            setReq(parse[e.target.value].req);
            setLastReqTime(parse[e.target.value].time)
            Store.addNotification({
                title: "توکن تغییر کرد",
                message: parse[e.target.value].token,
                type: "info",
                insert: "top-right",
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

    const handleStartPage = (e) => {
        setStartPage(e.target.value);
        localStorage.setItem('startPage', e.target.value.toString());
    }

    const handleEndPage = (e) => {
        setEndPage(e.target.value);
        localStorage.setItem('endPage', e.target.value.toString());
    }

    const handleDelayState = (e) => {
        setDelayState(e.target.value);
        localStorage.setItem('delayState', e.target.value.toString());
    }

    const handleLimit = (e) => {
        setReqLimit(e.target.value);
        localStorage.setItem('reqLimit', e.target.value.toString());
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

    const renderErrors = () => {
        return errors && errors.map((error, index) => {
            return (
                <div key={index} className='flex items-center justify-center w-full h-16 border divide-x-2 divide-zinc-800 border-zinc-800 border-zinc-900 hover:bg-red-900' dir='rtl'>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>{error.page}</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>{error.index}</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>{error.msg}</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>{error.time}</div>
                </div>
            )
        })
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
            return phones && phones.sort((a, b) => parseFloat(a.page) - parseFloat(b.page)).map((phone, index) => {
                return (
                    <div key={index} className='flex items-center justify-center w-full min-h-[4rem] h-auto border divide-x-2 divide-zinc-800 border-zinc-800 border-zinc-900 hover:bg-red-900' dir='rtl'>
                        <div className='flex flex-wrap items-center justify-center w-1/12 p-4 text-white'>{phone.page}</div>
                        <div className='flex flex-wrap items-center justify-center w-1/12 p-4 text-white'>{phone.reqIndex}</div>
                        <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.title}</div>
                        <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.contact.phone}</div>
                        <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.category}</div>
                        <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.city}</div>
                        <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.district}</div>
                        {/* <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.topDescription}</div> */}
                        <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.number}</div>
                        <div className='flex flex-wrap items-center justify-center w-4/12 p-4 text-white'>{phone.req}</div>
                        <div className='flex flex-wrap items-center justify-center w-4/12 h-auto p-4 text-white break-words break-all'>{phone.token}</div>
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
                <button onClick={handleStore} className='flex items-center justify-center w-24 h-12 ml-5 text-white rounded-md bg-zinc-700 no-drag'>
                    <FaSave size={24} />
                </button>
                <button onClick={handleRead} className='flex items-center justify-center w-24 h-12 ml-5 text-white rounded-md bg-zinc-700 no-drag'>
                    <FaDatabase size={24} />
                </button>
                <button onClick={handleExportExcel} className='flex items-center justify-center w-24 h-12 ml-5 text-white rounded-md bg-zinc-700 no-drag'>
                    <FaRegFileExcel size={24} />
                </button>
                <input onChange={handleUrl} value={url} className='w-6/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' placeholder='لیتک' />
                <button onClick={handleFetch} className={`flex items-center justify-center h-12 ml-5 text-white ${makeFetchClass()} rounded-md w-24 no-drag`}>
                    <FaPlay size={24} />
                </button>
                <Link to='/' className='flex items-center justify-center w-24 h-12 ml-5 text-white rounded-md bg-zinc-700 no-drag'>
                    <FaCog size={24} />
                </Link>
            </div>
            <div className='flex flex-row w-full h-auto mt-2 divide-x-2 shadow divide-zinc-800 bg-zinc-900 drag'>
                <select onChange={handleSelectToken} className='w-3/12 h-12 ml-5 font-mono text-xl text-center outline-none text-zinc-300 bg-zinc-700 no-drag'>
                    {renderSelectToken()}
                </select >
                <div className='flex items-center justify-center w-2/12 h-12 text-white 6/12'>
                    <span className='ml-5'>تعداد درخواست</span>
                    <span className='ml-5'>{req && req}</span>
                </div>
                <div className='flex items-center justify-center w-2/12 h-12 text-white 6/12'>
                    <span className='ml-5'>اخرین درخواست</span>
                    <span className='ml-5'>{lastReqTime}</span>
                </div>
            </div>
            <div className='flex flex-row w-full h-auto mt-2 divide-x-2 shadow divide-zinc-800 bg-zinc-900 drag'>
                <div className='flex items-center justify-center w-auto w-4/12 h-12 ml-5 text-white'>
                    <span className='w-full ml-5'>وقفه</span>
                    <input onChange={handleDelayState} value={delayState} type={'text'} className='flex items-center justify-center h-12 pl-4 ml-5 text-center rounded-md outline-none w-w-4/12 text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                </div>
                <div className='flex items-center justify-center w-auto w-1/12 h-12 ml-5 text-white'>
                    <span className='min-w-[12rem] ml-5 '>تعداد درخواست با هر شماره</span>
                    <input onChange={handleLimit} value={reqLimit} type={'text'} className='flex items-center justify-center w-4/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                </div>
                <div className='flex items-center justify-center w-auto h-12 ml-5 text-white 6/12'>
                    <span className='ml-5'>شروع</span>
                    <input onChange={handleStartPage} value={startPage} type={'text'} className='flex items-center justify-center w-3/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                    <span className='ml-5'>پایان</span>
                    <input onChange={handleEndPage} value={endPage} type={'text'} className='flex items-center justify-center w-3/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                </div>
            </div>
            <div className='mt-2 no-drag bg-zinc-900'>
                <div className='flex w-full h-16 border bg-zinc-800 border-zinc-800 hover:bg-red-900 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/12 p-4 text-white'>صفحه</div>
                    <div className='flex items-center justify-center w-1/12 p-4 text-white'>ردیف</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>عنوان</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>موبایل</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>گروه</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>شهر</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>منطقه</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>شماره درخواست دهنده</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>تعداد درخواست</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>توکن</div>
                </div>
                {renderContacts()}
            </div>
            <h1 className='p-5 text-xl text-right text-white'>خطاها</h1>
            <div className='mt-2 no-drag bg-zinc-900'>
                <div className='flex w-full h-16 border bg-zinc-800 border-zinc-800 hover:bg-red-900 ' dir='rtl'>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>صفحه</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>ردیف</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>پیام</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>زمات</div>
                </div>
                {renderErrors()}
            </div>
        </div>
    )
}

export default Posts