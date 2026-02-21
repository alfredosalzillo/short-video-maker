import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface CopyButtonProps {
  value: string;
  size?: 'small' | 'medium' | 'large';
  edge?: 'start' | 'end' | false;
}

const CopyButton: React.FC<CopyButtonProps> = ({ value, size = 'small', edge = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
      <IconButton onClick={handleCopy} edge={edge} size={size}>
        {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default CopyButton;
