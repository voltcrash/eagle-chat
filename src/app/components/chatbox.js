'use client';

import React, {useState, useRef, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './chatbox.module.css';

export default function EagleChatBox() {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        {id: 1, title: "Contract Review", date: "March 1"},
        {id: 2, title: "Tenant Rights", date: "March 1"},
        {id: 3, title: "Copyright Question", date: "February 28"},
        {id: 4, title: "Divorce Proceedings", date: "February 27"},
        {id: 5, title: "Business Formation", date: "February 25"},
    ]);
    const [selectedChat, setSelectedChat] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, {text: input, sender: "user", timestamp: new Date()}];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`/api/chat?timestamp=${Date.now()}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({message: input}),
            });

            const data = await res.json();
            console.log("🔍 API Response:", data);

            if (!data.reply) throw new Error("Invalid API response");

            setMessages([...newMessages, {text: data.reply, sender: "bot", timestamp: new Date()}]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages([...newMessages, {
                text: "Error: Could not get response.",
                sender: "bot",
                timestamp: new Date()
            }]);
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
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const selectChat = (id) => {
        setSelectedChat(id);
        // In future implementation, this would load the actual chat history
        // For now, we're just simulating the selection
        setMessages([]);
    };

    // Group messages by day
    const groupMessagesByDate = () => {
        const groups = {};

        messages.forEach(msg => {
            const date = msg.timestamp.toLocaleDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });

        return groups;
    };

    // Format the date divider text
    const formatDateDivider = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toLocaleDateString()) {
            return "Today";
        } else if (dateStr === yesterday.toLocaleDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'});
        }
    };

    // Improved message rendering with cleaner grouping and styling
    const renderMessages = () => {
        const dateGroups = groupMessagesByDate();

        return Object.entries(dateGroups).map(([date, dateMessages]) => (
            <div key={date}>
                <div className={styles.dateDivider}>{formatDateDivider(date)}</div>

                {dateMessages.map((msg, index) => {
                    const isFirstInGroup = index === 0 || dateMessages[index - 1].sender !== msg.sender;
                    const isLastInGroup = index === dateMessages.length - 1 || dateMessages[index + 1].sender !== msg.sender;

                    return (
                        <div
                            key={index}
                            className={msg.sender === "user" ? styles.userGroup : styles.botGroup}
                            style={{marginBottom: isLastInGroup ? '16px' : '2px'}}
                        >
                            <div className={styles.messageContainer}>
                                {msg.sender === "user" ? (
                                    <div className={styles.userMessage}>
                                        <div className={styles.messageText}>{msg.text}</div>
                                        <div className={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                                    </div>
                                ) : (
                                    <div className={styles.botMessageContainer}>
                                        <div className={styles.markdownContent}>
                                            <ReactMarkdown components={{
                                                p: ({node, ...props}) => <p style={{margin: '0.75em 0'}} {...props} />,
                                                hr: ({node, ...props}) => <hr style={{
                                                    border: 'none',
                                                    borderTop: '1px solid #444',
                                                    margin: '1em 0'
                                                }} {...props} />,
                                                h1: ({node, ...props}) => <h1
                                                    style={{margin: '1em 0 0.5em', fontSize: '1.8em'}} {...props} />,
                                                h2: ({node, ...props}) => <h2
                                                    style={{margin: '1em 0 0.5em', fontSize: '1.5em'}} {...props} />,
                                                h3: ({node, ...props}) => <h3
                                                    style={{margin: '1em 0 0.5em', fontSize: '1.3em'}} {...props} />,
                                                ul: ({node, ...props}) => <ul
                                                    style={{margin: '0.5em 0', paddingLeft: '1.5em'}} {...props} />,
                                                ol: ({node, ...props}) => <ol
                                                    style={{margin: '0.5em 0', paddingLeft: '1.5em'}} {...props} />,
                                                li: ({node, ...props}) => <li
                                                    style={{margin: '0.25em 0'}} {...props} />,
                                                code: ({node, inline, className, children, ...props}) => (
                                                    inline ?
                                                        <code style={{
                                                            background: '#333',
                                                            padding: '0.1em 0.3em',
                                                            borderRadius: '3px',
                                                            fontFamily: 'monospace'
                                                        }} {...props}>
                                                            {children}
                                                        </code> :
                                                        <code {...props}>{children}</code>
                                                ),
                                                pre: ({node, children, ...props}) => (
                                                    <pre style={{
                                                        background: '#292929',
                                                        padding: '1em',
                                                        borderRadius: '5px',
                                                        overflow: 'auto',
                                                        margin: '0.75em 0',
                                                        fontFamily: 'monospace'
                                                    }} {...props}>
                                                        {children}
                                                    </pre>
                                                ),
                                                blockquote: ({node, ...props}) => (
                                                    <blockquote style={{
                                                        borderLeft: '3px solid #555',
                                                        paddingLeft: '1em',
                                                        margin: '0.75em 0',
                                                        color: '#aaa'
                                                    }} {...props} />
                                                ),
                                                table: ({node, ...props}) => (
                                                    <div style={{overflowX: 'auto', margin: '1em 0'}}>
                                                        <table style={{
                                                            borderCollapse: 'collapse',
                                                            width: '100%'
                                                        }} {...props} />
                                                    </div>
                                                ),
                                                th: ({node, ...props}) => (
                                                    <th style={{
                                                        padding: '8px 12px',
                                                        border: '1px solid #444',
                                                        textAlign: 'left',
                                                        backgroundColor: '#333'
                                                    }} {...props} />
                                                ),
                                                td: ({node, ...props}) => (
                                                    <td style={{
                                                        padding: '8px 12px',
                                                        border: '1px solid #444',
                                                        textAlign: 'left'
                                                    }} {...props} />
                                                ),
                                            }}>{msg.text}</ReactMarkdown>
                                        </div>
                                        <div className={styles.botMessageTime}>{formatTime(msg.timestamp)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        ));
    };

    return (
        <div className={styles.appContainer}>
            <div className={`${styles.sidebar} ${sidebarVisible ? styles.sidebarVisible : styles.sidebarHidden}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logo}></div>
                        <h1 className={styles.brandName}>EagleChat*</h1>
                    </div>
                    <button className={styles.newChatButton} onClick={() => window.location.reload()}>
                        New Chat
                    </button>
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
                <div className={styles.sidebarToggle} onClick={() => setSidebarVisible(!sidebarVisible)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>

                <div className={styles.messagesContainer}>
                    {messages.length > 0 ? renderMessages() : (
                        <div className={styles.emptyStateContainer}>
                            <div className={styles.emptyStateIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 10h12M6 14h12M12 2V22M6 10l6-4 6 4M6 14l6 4 6-4" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className={styles.emptyStateText}>Start a new conversation</div>
                        </div>
                    )}
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingDots}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}/>
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
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}