import PodsTable from '@app/features/cdt/pods-info/pods-table';
import { useAppDispatch } from '@app/store/hooks';
import { contextDataAction } from '@app/store/slices/context-slices';
import { ContentCard } from '@app/components/content-card/content-card';
import { Input } from 'antd';
import { ESC_QUERY_PARAMS } from '@app/constants/query-params';
import {useSearchParams} from "react-router-dom";

const { Search } = Input;

const PodsInfoContainer = () => {
    const [urlParams, setUrlParams] = useSearchParams();
    const podsQuery =  urlParams.get(ESC_QUERY_PARAMS.podsQuery) || '';
    const dispatch = useAppDispatch();

    function onChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
        if (e) {
            const value = e.target.value;
            setUrlParams(params => {
                if (!value) {
                    params.delete(ESC_QUERY_PARAMS.podsQuery);
                } else {
                    params.set(ESC_QUERY_PARAMS.podsQuery, e.target.value.toString());
                }
                return params;
            });
        }
    }

    return (
        <ContentCard
            title="Pods Info"
            titleClassName="ux-typography-18px-medium"
            extra={
                <Search
                    value={podsQuery}
                    placeholder="Search"
                    size="small"
                    onChange={e => {
                        onChangeSearch(e);
                        dispatch(contextDataAction.toFirstPage());
                    }}
                    onPressEnter={() => dispatch(contextDataAction.setSearchParamsApplied(true))}
                />
            }
        >
            <PodsTable />
        </ContentCard>
    );
};


export default PodsInfoContainer;
