    import React from 'react';
    import { useParams } from 'react-router-dom';

    const Chat = () => {
        let {id} = useParams();
        return (
            <div>
                <h1>Chat Page</h1>
                <p>{id}</p>
            </div>
        );
    };

    export default Chat;