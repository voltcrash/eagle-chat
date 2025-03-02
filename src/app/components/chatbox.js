'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './chatbox.module.css';

export default function EagleChatBox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: "Contract Review", date: "March 1" },
        { id: 2, title: "Tenant Rights", date: "March 1" },
        { id: 3, title: "Copyright Question", date: "February 28" },
        { id: 4, title: "Divorce Proceedings", date: "February 27" },
        { id: 5, title: "Business Formation", date: "February 25" },
    ]);
    const [selectedChat, setSelectedChat] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: "user", timestamp: new Date() }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`/api/chat?timestamp=${Date.now()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await res.json();
            console.log("🔍 API Response:", data);

            if (!data.reply) throw new Error("Invalid API response");

            setMessages([...newMessages, { text: data.reply, sender: "bot", timestamp: new Date() }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages([...newMessages, { text: "Error: Could not get response.", sender: "bot", timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const selectChat = (id) => {
        setSelectedChat(id);
        // In future implementation, this would load the actual chat history
        // For now, we're just simulating the selection
        setMessages([]);
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
            <div key={groupIndex} className={group.sender === "user" ? styles.userGroup : styles.botGroup}>
                {group.messages.map((msg, msgIndex) => (
                    <div key={`msg-${groupIndex}-${msgIndex}`} className={styles.messageContainer}>
                        {group.sender === "user" ? (
                            <div className={styles.userMessage}>
                                <div className={styles.messageText}>{msg.text}</div>
                                <div className={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                            </div>
                        ) : (
                            <div className={styles.botMessageContainer}>
                                <ReactMarkdown components={{
                                    p: ({ node, ...props }) => <p {...props} />,
                                    hr: ({ node, ...props }) => <hr className={styles.customHr} {...props} />,
                                    code: ({ node, inline, className, children, ...props }) => (
                                        <code className={styles.inlineCode} {...props}>
                                            {children}
                                        </code>
                                    ),
                                    pre: ({ node, children, ...props }) => (
                                        <pre className={styles.codeBlock} {...props}>
                                            {children}
                                        </pre>
                                    )
                                }}>{msg.text}</ReactMarkdown>
                                <div className={styles.botMessageTime}>{formatTime(msg.timestamp)}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logo}></div>
                        <h1 className={styles.brandName}>EagleChat*</h1>
                    </div>
                    <button className={styles.newChatButton}>+ New Chat</button>
                </div>

                <div className={styles.chatHistoryContainer}>
                    <h2 className={styles.historyTitle}>Chat History</h2>
                    {chatHistory.map(chat => (
                        <div
                            key={chat.id}
                            className={`${styles.chatHistoryItem} ${selectedChat === chat.id ? styles.selectedChat : ''}`}
                            onClick={() => selectChat(chat.id)}
                        >
                            <div className={styles.chatHistoryTitle}>{chat.title}</div>
                            <div className={styles.chatHistoryDate}>{chat.date}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.chatContainer}>
                <div className={styles.messagesContainer}>
                    <div className={styles.dateDivider}>Today</div>
                    {renderMessages()}
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingDots}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputArea}>
                    <div className={styles.messageInputContainer}>
                        <input
                            type="text"
                            className={styles.messageInput}
                            placeholder="Ask a legal question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button
                        className={`${styles.sendButton} ${input.trim() ? styles.active : ''}`}
                        onClick={sendMessage}
                        disabled={!input.trim()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}