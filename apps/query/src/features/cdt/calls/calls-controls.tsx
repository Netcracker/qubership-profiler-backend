import { useCallsStore } from '@app/features/cdt/calls/calls-store';

import useCallsFetchArg from "@app/features/cdt/calls/use-calls-fetch-arg";
import { createExportUrl, createCallUrl } from '@app/features/cdt/calls/create-call-url';

import { DownloadOutlined, ExportOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const CallsControls = () => {
    const [selectedCalls] = useCallsStore(s => s.selectedCalls);
    const openCallsDisabled = !selectedCalls || !Array.isArray(selectedCalls) || selectedCalls.length === 0;
    const [callRequest] = useCallsFetchArg();

    const [graphCollapsed, setGraphCollapsed] = useCallsStore(s => s.graphCollapsed);

    const handleHideGraph = () => {
        setGraphCollapsed({graphCollapsed: !graphCollapsed})
    };

    return (
        <>

            <Tooltip
                title={!openCallsDisabled ? `Show calls statistics as graph` : undefined}
                placement="bottomLeft"
            >
                <Button
                    onClick={handleHideGraph}
                    // disabled={showGraphDisabled}
                >
                    { graphCollapsed ? "Show Graph" : "Hide Graph" }
                </Button>
            </Tooltip>

            <Tooltip
                title={!openCallsDisabled ? `Download calls as CSV file ` + callRequest.filters.duration : undefined}
                placement="bottomLeft"
            >
                <Button
                    href={createExportUrl(callRequest)}
                    target="_blank"
                    type="default"
                    // disabled={!searchParamsApplied}
                    icon={<DownloadOutlined />}
                />
            </Tooltip>

            <Tooltip
                title={!openCallsDisabled && Array.isArray(selectedCalls) ? `Open selected items (${selectedCalls.length})` : undefined}
                placement="bottomLeft"
            >
                <Button
                    href={!openCallsDisabled && Array.isArray(selectedCalls) ? createCallUrl(selectedCalls) : undefined}
                    disabled={openCallsDisabled}
                    type="default"
                    icon={<ExportOutlined />}
                />
            </Tooltip>
        </>
    );
};

export default CallsControls;
