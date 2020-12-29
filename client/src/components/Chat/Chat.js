import React, {useState, useEffect} from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import InfoBar from '../InfoBar/InfoBar.js'
import Input from '../Input/Input.js'
import Messages from '../Messages/Messages';
import TextContainer from '../TextContainer/TextContainer';

import './Chat.css'

let socket;

const Chat = ({location}) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const ENDPOINT = 'localhost:5000';

    useEffect(()=>{
        //const data = queryString.parse(location.search);
        const {name, room} = queryString.parse(location.search);
        //console.log(location.search);
        //console.log(name , room);
        //console.log(data)

        socket = io(ENDPOINT, {transport:['websocket']});

        setName(name);
        setRoom(room);

        socket.emit('join',{name, room}, (error)=>{
            if(error){
                alert(error);
            }
        });
        console.log(socket);

        return () => {
            socket.emit('disconnect');
            socket.off();
        }

    }, [ENDPOINT, location.search]);

    useEffect(()=>{
        socket.on('message', (message)=>{
            setMessages([...messages, message]);
        })
    }, [messages])

    const sendMessage = (event)=>{
        event.preventDefault();
        if(message){
            socket.emit('sendMessage', message, ()=> setMessage(''))
        }
    }
    console.log(message, messages);
    return (
        <div className ="outerContainer">
            <div className = "container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users}/>
        </div>
    )
};

export default Chat;