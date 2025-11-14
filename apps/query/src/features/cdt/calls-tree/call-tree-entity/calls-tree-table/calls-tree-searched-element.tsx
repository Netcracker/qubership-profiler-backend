import type { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ESC_CALL_TREE_QUERY_PARAMS } from '@app/constants/query-params';
import Highlighter from 'react-highlight-words';

interface CallsTreeSearchedElementProps {
    text: string;
}

const CallsTreeSearchedElement: FC<CallsTreeSearchedElementProps> = ({ text }) => {
    const [urlParams] = useSearchParams();
    const callsTreeQuery = urlParams.get(ESC_CALL_TREE_QUERY_PARAMS.callsTreeQuery) || '';

    return (
        <Highlighter
            searchWords={[callsTreeQuery]}
            autoEscape={true}
            textToHighlight={text}
            highlightClassName="mark-text"
        />
    );
};

export default CallsTreeSearchedElement;
