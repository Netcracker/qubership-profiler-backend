import type { FC } from 'react';
import { HighlightText } from '@app/components/compat';
import { useSearchParams } from 'react-router-dom';
import { ESC_CALL_TREE_QUERY_PARAMS } from '@app/constants/query-params';

interface CallsTreeSearchedElementProps {
    text: string;
}

const CallsTreeSearchedElement: FC<CallsTreeSearchedElementProps> = ({ text }) => {
    const [urlParams] = useSearchParams();
    const callsTreeQuery = urlParams.get(ESC_CALL_TREE_QUERY_PARAMS.callsTreeQuery) || '';

    if (!callsTreeQuery) return <>{text}</>;

    return <HighlightText text={text} searchWords={[callsTreeQuery]} autoEscape={true} />;
};

export default CallsTreeSearchedElement;
