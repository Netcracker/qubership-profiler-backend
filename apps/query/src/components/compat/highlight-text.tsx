import Highlighter from 'react-highlight-words';
import type { FC } from 'react';

export interface HighlightTextProps {
    text: string;
    searchWords: string[];
    highlightClassName?: string;
    autoEscape?: boolean;
}

export const HighlightText: FC<HighlightTextProps> = ({
    text,
    searchWords,
    highlightClassName = 'mark-text',
    autoEscape = true,
}) => {
    return (
        <Highlighter
            searchWords={searchWords}
            textToHighlight={text}
            highlightClassName={highlightClassName}
            autoEscape={autoEscape}
        />
    );
};

/**
 * @deprecated Use HighlightText component instead
 * Legacy function for backward compatibility
 */
export const highlight = (text: string, search: string): React.ReactNode => {
    if (!search) return text;
    return <HighlightText text={text} searchWords={[search]} autoEscape={true} />;
};
