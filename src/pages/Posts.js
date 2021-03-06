import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx/xlsx.mjs';
import DataGrid from 'react-data-grid';
import { Store } from 'react-notifications-component';
import { FaSave, FaRegFileExcel, FaDatabase, FaCog, FaPlay } from 'react-icons/fa';
import RenderContacts from './components/RenderContacts';
import delayAdapterEnhancer from 'axios-delay';
const { ipcRenderer } = window.require("electron");

const delay = ms => new Promise(res => setTimeout(res, ms));
const api = axios.create({
    adapter: delayAdapterEnhancer(axios.defaults.adapter)
});

var __phones;
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
    const [name, setName] = useState('1');
    const [from, setFrom] = useState('3000505');
    const [toCollection, setToCollection] = useState([]);
    const [isShutdown, setIsShutdown] = useState(true);
    const [isSendSms, setIsSendSms] = useState(true);

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
        if (localStorage.getItem('name') !== null) {
            setName(localStorage.getItem('name'));
        }
        if (localStorage.getItem('from') !== null) {
            setFrom(localStorage.getItem('from'));
        }
        if (localStorage.getItem('toCollection') !== null) {
            setToCollection(JSON.parse(localStorage.getItem('toCollection')));
        }
        if (localStorage.getItem('isShutdown') !== null) {
            setIsShutdown(JSON.parse(localStorage.getItem('isShutdown')));
        }
        if (localStorage.getItem('isSendSms') !== null) {
            setIsSendSms(JSON.parse(localStorage.getItem('isSendSms')));
        }
    }, []);

    useEffect(() => {
        if (phones.length !== 0) {
            handleStore(phones);
        }
    }, [phones]);

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

    const handleTestSms = async () => {
        if (toCollection.length > 0) {
            for (let i = 0; i <= toCollection.length - 1; i++) {
                try {
                    console.log('sending sms to:', ' ', toCollection[i]);
                    const res = await axios.get(`http://ippanel.com:8080/?apikey=vRMQht_M9Jnn6TqwXujXWBuSqZiSRj_FId8yzbJk9tg=&pid=jqrbj1u7bqs7n7v&fnum=${from}&tnum=${toCollection[i]}&p1=num&v1=${name}&p2=count&v2=${__phones.length}`);
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
                    title: "??????",
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
            title: "?????????? ????????????",
            message: '??????????',
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
        if (isSendSms) {
            await handleTestSms();
        }
        setReqStatus(0);
        if (isShutdown) {
            handleShutdown();
        }
        setStatus(0);
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
            setReqStatus(2);
            var temp;
            console.log(i, currentPage);
            const { title, token } = posts[i].data;
            console.log('requesting phone...', posts[i], i);
            try {
                const _availableToken = getTokenBaseOnRequest();
                if (_availableToken !== undefined) {
                    console.log({ _availableToken });
                    setSelectedToken(_availableToken);
                    const request = await api.get(`https://api.divar.ir/v5/posts/${token}/contact/`, {
                        headers: {
                            'Authorization': 'Bearer' + ' ' + _availableToken.token,
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        // delay: ((index + 1) * (currentPage + 1)) * 10000,
                        credentials: 'same-origin',
                    });
                    let updatedTokens = tokens.map((token) => {
                        if (Number(token.number) === Number(_availableToken.number)) {
                            token.req = token.req + 1;
                            token.time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds().toString();
                            console.log('start wait');
                        }
                        return token;
                    });
                    console.log({ updatedTokens });
                    const filter = updatedTokens.find((token) => token.number === _availableToken.number);
                    setReq(Number(filter.req));
                    setLastReqTime(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds().toString());
                    setPhones((prevPhones) => {
                        const data = [...prevPhones, { contact: request.data.widgets.contact, page: currentPage, reqIndex: i, ...posts[i].data, ..._availableToken }];
                        __phones = data;
                        return data;
                    });
                    localStorage.setItem('phonesConfig', JSON.stringify(updatedTokens));
                    setTokens([...updatedTokens]);
                    setStatus("SUCCESS");
                    await delay(delayState);
                } else {
                    console.log('all phone has reached limit!');
                    throw '?????????? ?????? ?????? ???? ???? ?????????? ?????? ??????';
                }
            } catch (error) {
                setErrors((prevErrors) => {
                    const data = [...prevErrors, { page: currentPage, index: i, msg: error.toString(), time: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds().toString() }];
                    handleStoreError(data);
                    return data;
                })
                await delay(5000);
                Store.addNotification({
                    title: "??????",
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
        } catch (error) {
            Store.addNotification({
                title: "??????",
                message: '?????? ???? ?????????? ??????????????',
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
                title: "??????",
                message: '?????? ???? ?????????? ??????????',
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
            alert('???????????? ???????? ??????????')
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
                title: "???????? ?????????? ??????",
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

    const handleIsShutdown = (e) => {
        setIsShutdown((prevState) => !prevState);
        localStorage.setItem('isShutdown', e.target.checked.toString());
    }

    const handleIsSendSms = (e) => {
        setIsSendSms((prevState) => !prevState);
        localStorage.setItem('isSendSms', e.target.checked.toString());
    }

    const renderSelectToken = () => {
        const phonesConfigString = localStorage.getItem('phonesConfig');
        if (phonesConfigString !== null) {
            const phonesConfig = JSON.parse(phonesConfigString);
            return phonesConfig && phonesConfig.map((phoneConfig, index) => {
                if (phoneConfig.number == selectedToken.number) {
                    return (
                        <option selected key={phoneConfig.number} className='min-h-[4rem] h-16 text-2xl  outline-none no-drag' value={index}>{phoneConfig.number}</option>
                    )
                } else {
                    return (
                        <option key={phoneConfig.number} className='min-h-[4rem] h-16 text-2xl  outline-none no-drag' value={index}>{phoneConfig.number}</option>
                    )
                }
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

    const handleShutdown = () => {
        ipcRenderer.send('exit', true);
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
                <input onChange={handleUrl} value={url} className='w-6/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' placeholder='????????' />
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
                    <span className='ml-5'>?????????? ??????????????</span>
                    <span className='ml-5'>{req && req}</span>
                </div>
                <div className='flex items-center justify-center w-2/12 h-12 text-white 6/12'>
                    <span className='ml-5'>?????????? ??????????????</span>
                    <span className='ml-5'>{lastReqTime}</span>
                </div>
            </div>
            <div className='flex flex-row w-full h-auto mt-2 divide-x-2 shadow divide-zinc-800 bg-zinc-900 drag'>
                <div className='flex items-center justify-center w-auto w-4/12 h-12 ml-5 text-white'>
                    <span className='w-full ml-5'>????????</span>
                    <input onChange={handleDelayState} value={delayState} type={'text'} className='flex items-center justify-center h-12 pl-4 ml-5 text-center rounded-md outline-none w-w-4/12 text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                </div>
                <div className='flex items-center justify-center w-auto w-2/12 h-12 ml-5 text-white'>
                    <span className='min-w-[12rem] ml-10 '>?????????? ?????????????? ???? ???? ??????????</span>
                    <input onChange={handleLimit} value={reqLimit} type={'text'} className='flex items-center justify-center w-4/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                </div>
                <div className='flex items-center justify-center w-auto h-12 ml-5 text-white 6/12'>
                    <span className='ml-5'>????????</span>
                    <input onChange={handleStartPage} value={startPage} type={'text'} className='flex items-center justify-center w-3/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                    <span className='ml-5'>??????????</span>
                    <input onChange={handleEndPage} value={endPage} type={'text'} className='flex items-center justify-center w-3/12 h-12 pl-4 ml-5 text-center rounded-md outline-none text-zinc-200 bg-zinc-700 no-drag placeholder:text-center' />
                </div>
                <div className='flex items-center justify-center w-auto w-3/12 h-12 ml-5 text-white'>
                    <span className='min-w-[6rem] ml-5 '>?????????? ??????</span>
                    <input onChange={handleIsShutdown} checked={isShutdown} type={'checkbox'} className='w-6 h-6 accent-indigo-500' />
                </div>
                <div className='flex items-center justify-center w-auto w-3/12 h-12 ml-5 text-white'>
                    <span className='min-w-[6rem] ml-5 '>?????????? ??????????</span>
                    <input onChange={handleIsSendSms} checked={isSendSms} type={'checkbox'} className='w-6 h-6 accent-yellow-500' />
                </div>
            </div>
            <div className='mt-2 no-drag bg-zinc-900'>
                <div className='flex w-full h-16 border bg-zinc-800 border-zinc-800 hover:bg-red-900 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/12 p-4 text-white'>????????</div>
                    <div className='flex items-center justify-center w-1/12 p-4 text-white'>????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>??????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>????????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>??????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>??????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>?????????? ?????????????? ??????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>?????????? ??????????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>????????</div>
                </div>
                <RenderContacts status={status} phones={phones} />
            </div>
            <h1 className='p-5 text-xl text-right text-white'>??????????</h1>
            <div className='mt-2 no-drag bg-zinc-900'>
                <div className='flex w-full h-16 border bg-zinc-800 border-zinc-800 hover:bg-red-900 ' dir='rtl'>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>????????</div>
                    <div className='flex items-center justify-center w-4/12 p-4 text-white'>????????</div>
                </div>
                {renderErrors()}
            </div>
        </div>
    )
}

export default Posts