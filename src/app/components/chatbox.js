'use client';

import React, { useState, useRef, useEffect } from 'react';

import styles from './chatbox.module.css';

export default function EagleChatBox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: "user", timestamp: new Date() }];
        setMessages(newMessages);
        setInput("");

        setTimeout(() => {
            setMessages([...newMessages, {
                text: "Got your message!",
                sender: "other",
                timestamp: new Date()
            }]);
        }, 1000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessages = () => {
        let currentSender = null;
        let messageGroups = [];
        let currentGroup = [];

        messages.forEach((msg, index) => {
            if (currentSender !== msg.sender) {
                if (currentGroup.length > 0) {
                    messageGroups.push({
                        sender: currentSender,
                        messages: currentGroup
                    });
                }
                currentGroup = [msg];
                currentSender = msg.sender;
            } else {
                currentGroup.push(msg);
            }

            if (index === messages.length - 1) {
                messageGroups.push({
                    sender: currentSender,
                    messages: currentGroup
                });
            }
        });

        return messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={`messageGroup ${group.sender === "user" ? "userGroup" : "otherGroup"}`}>
                {group.messages.map((msg, msgIndex) => (
                    <div key={`msg-${groupIndex}-${msgIndex}`} className="messageContainer">
                        <div className={`message ${group.sender === "user" ? "userMessage" : "otherMessage"}`}>
                            <div className="messageText">{msg.text}</div>
                            <div className="messageTime">{formatTime(msg.timestamp)}</div>
                        </div>
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                    <div className={styles.recipient}>
                        <div className={styles.avatar}></div>
                        <div className={styles.recipientName}>John Doe</div>
                    </div>
                </div>

                <div className={styles.messagesContainer}>
                    <div className={styles.dateDivider}>Today</div>
                    {renderMessages()}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputArea}>
                    <button className={styles.appButton}>+</button>
                    <div className={styles.messageInputContainer}>
                        <input
                            type="text"
                            className="messageInput"
                            placeholder="iMessage"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button
                        className={`sendButton ${input.trim() ? 'active' : ''}`}
                        onClick={sendMessage}
                        disabled={!input.trim()}
                    >
                        {input.trim() ? '↑' : '🎤'}
                    </button>
                </div>
            </div>
        </div>
    );
}