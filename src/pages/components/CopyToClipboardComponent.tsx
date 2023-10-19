import React, { useState } from 'react';
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const CopyToClipboardComponent: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000); // Reset the copied state after 2 seconds
    };

    return (
        <div className="flex items-center">
            <CopyToClipboard text={textToCopy} onCopy={handleCopy}>
                <button
                    className={`bg-black hover:bg-black-500 hover:bg-gray-600 text-white rounded-r p-2 focus:outline-none ${isCopied ? 'bg-bg-black-500' : ''}`}>
                    {isCopied ? 'Copied' : <ContentCopyIcon />}
                </button>
            </CopyToClipboard>
        </div>
    );
};

export default CopyToClipboardComponent;
