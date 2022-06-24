import React from 'react'

const renderContacts = ({ status, phones }) => {

    if (status === 'EMPTY') {
        return (
            <div className='flex w-full h-16 text-white border border-zinc-700 ' dir='rtl'>
                <div className='flex items-center justify-center w-full p-4 text-white '>{'رکوردی وجود ندارد'}</div>
            </div>
        )
    }
    else if (status === 'SUCCESS') {
        return phones && phones.map((phone, index) => {
            return (
                <div key={phone.token.toString() + phone.page + phone.index} className='flex items-center justify-center w-full min-h-[4rem] h-auto border divide-x-2 divide-zinc-800 border-zinc-800 border-zinc-900 hover:bg-red-900' dir='rtl'>
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

export default renderContacts;