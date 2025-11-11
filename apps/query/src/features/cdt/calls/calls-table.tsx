import { isTimeoutError } from '@app/common/guards/errors';
import ContentControls from '@app/features/cdt/calls/content-controls';
import { useCallsColumns } from '@app/features/cdt/calls/hooks/use-calls-columns';
import ResizableTitle, { type ResizableTitleProps } from '@app/components/table-components/resizable-title';
import useCallsFetchArg from '@app/features/cdt/calls/use-calls-fetch-arg';
import { type CallInfo, useGetCallsByConditionQuery } from '@app/store/cdt-openapi';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { contextDataAction } from '@app/store/slices/context-slices';
import { ReactComponent as NoDataGraySvg } from '@assets/illustrations/no-data-gray.svg';
import { InfoPage } from '@app/components/info-page/info-page';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Spin, Table } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnType, TablePaginationConfig } from 'antd/lib/table';
import type { FilterValue, SorterResult, TableCurrentDataSource, TableRowSelection } from 'antd/lib/table/interface';
import {
    type CSSProperties,
    type FC,
    type Key,
    memo,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { ResizeCallbackData } from 'react-resizable';
import classNames from './calls-table.module.scss';
import { type ColumnWidthsMap, appDataActions, selectCallsColumnWidths } from '@app/store/slices/app-state.slice';
import { useCallsStore } from '@app/features/cdt/calls/calls-store';

function callsErrorMessage(error: unknown) {
    let message = 'Calls Info is Unavailable. The backend server encountered an error and could not complete request.';
    if (isTimeoutError(error)) {
        message = 'The web server failed to respond within the specified time';
    }
    return message;
}

const tableRowKey = (r: CallInfo) => `${r.ts}-${r.duration}-${r.pod?.pod}`;
const noDataIconStyle: CSSProperties = { width: 56, height: 56 };

const tableIndicator = { indicator: <Spin size="large" /> };
const CallsTable: FC = memo(() => {
    const [, set] = useCallsStore(s => s);
    const dispatch = useAppDispatch();
    const containerRef = useRef<HTMLDivElement>(null);
    const tableBodyRef = useRef<HTMLDivElement>(null);
    const storedColumnWidths = useAppSelector(selectCallsColumnWidths);
    const [columnWidths, setColumnWidths] = useState<ColumnWidthsMap>(storedColumnWidths ?? {});
    const [containerHeight, setContainerHeight] = useState<number>(500);
    const columns = useCallsColumns();
    const [callRequest, { shouldSkip, notReady }] = useCallsFetchArg();

    useLayoutEffect(() => {
        if (callRequest.view?.page === 1 && tableBodyRef.current) {
            tableBodyRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }, [callRequest.view?.page]);

    useLayoutEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.contentRect.height;
                setContainerHeight(height);
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const { isFetching, data, isError, error, refetch } = useGetCallsByConditionQuery(callRequest, {
        skip: shouldSkip,
    });

    const tableScroll: TableProps<CallInfo>['scroll'] = useMemo(() => {
        if (containerHeight) {
            return {
                x: 'max-content',
                y: containerHeight - 45,
            };
        }
        return {
            x: 'max-content',
            y: 500,
        };
    }, [containerHeight]);

    const handleResize = useCallback((columnKey: Key) => {
        return (_: unknown, data: ResizeCallbackData) => {
            const { size } = data;
            setColumnWidths(prev => {
                return { ...prev, [String(columnKey)]: size.width };
            });
        };
    }, []);
    const handleResizeStop = useCallback(
        (columnKey: Key) => {
            return (_: unknown, data: ResizeCallbackData) => {
                const { width } = data.size;
                setColumnWidths(prev => {
                    const widths = { ...prev, [String(columnKey)]: width };
                    dispatch(appDataActions.setCallsColumnWidths(widths));

                    return widths;
                });
            };
        },
        [dispatch]
    );

    const handleBottomReached = useCallback(
        (event: React.UIEvent<HTMLDivElement>) => {
            const target = event.currentTarget;
            const maxScroll = target.scrollHeight - target.clientHeight;
            const currentScroll = target.scrollTop;
            if (currentScroll === maxScroll) {
                if (!isFetching) {
                    const rows = data?.status?.filteredRecords || 0;
                    const pages = Math.ceil(rows / 100);
                    dispatch(contextDataAction.setMaxPage( pages ));
                    dispatch(contextDataAction.nextCallsPage());
                }
            }
        },
        [dispatch, isFetching, data]
    );

    const tableComponents = useMemo(() => {
        return {
            header: {
                cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => {
                    return <ResizableTitle {...props} />;
                },
            },
            body: {
                wrapper: (props: React.HTMLAttributes<HTMLDivElement>) => <div ref={tableBodyRef} onScroll={handleBottomReached} {...props} />,
            },
        } as TableProps<CallInfo>['components'];
    }, [handleBottomReached]);

    const resizableColumns = useMemo(() => {
        return columns?.map(col => {
            const width = columnWidths?.[String(col.key)] ?? (col.width as number);
            return {
                ...col,
                onHeaderCell: () => {
                    const resizableProps: ResizableTitleProps = {
                        width: width,
                        resizable: !!col.title,
                        onResize: col.key ? handleResize(col.key) : undefined,
                        onResizeStop: col.key ? handleResizeStop(col.key) : undefined,
                        columnKey: col.key,
                    };
                    return resizableProps;
                },
                width: width,
            } as ColumnType<CallInfo>;
        });
    }, [columnWidths, columns, handleResize, handleResizeStop]);

    const handleTableChange = useCallback(
        (
            pagination: TablePaginationConfig,
            filters: Record<string, FilterValue | null>,
            sorter: SorterResult<CallInfo> | Array<SorterResult<CallInfo>>,
            extra: TableCurrentDataSource<CallInfo>
        ) => {
            if (extra.action === 'sort' && !Array.isArray(sorter)) {
                dispatch(
                    contextDataAction.updateCallsTableState({
                        sortBy: sorter.column?.dataIndex?.toString() as string,
                        sortOrder: sorter.order ?? 'ascend',
                        page: 1,
                    })
                );
            }
        },
        [dispatch]
    );
    const rowSelection: TableRowSelection<CallInfo> = useMemo(() => {
        return {
            onChange: (selectedRowKeys: Key[], selectedRows: CallInfo[]) => {
                set({ selectedCalls: selectedRows });
            },
            type: 'checkbox',
        };
    }, [set]);
    if (notReady) {
        return (
            <InfoPage
                title={<></>}
                className="dashed-info-page"
                description={
                    <span>
                        No Data.
                        <br />
                        Select the Namespace/Service and Period
                    </span>
                }
                icon={<NoDataGraySvg style={noDataIconStyle} />}
            />
        );
    }
    if (isError) {
        const message = callsErrorMessage(error);
        return (
            <InfoPage
                title={<></>}
                className="dashed-info-page"
                description={
                    <span>
                        Calls Info is Unavailable. <br />
                        {message}
                    </span>
                }
                icon={<NoDataGraySvg style={noDataIconStyle} />}
                additionalContent={
                    <Button onClick={refetch} type="text" icon={<SyncOutlined />}>
                        Reload
                    </Button>
                }
            />
        );
    }

    return (
        <div className={classNames.container}>
            <ContentControls />
            <div ref={containerRef} className="table-container">
                <Table
                    rowSelection={rowSelection}
                    className="dynamicTable"
                    dataSource={data?.calls}
                    rowKey={tableRowKey}
                    onChange={handleTableChange}
                    columns={resizableColumns}
                    components={tableComponents}
                    loading={isFetching && tableIndicator}
                    scroll={tableScroll}
                />
            </div>
        </div>
    );
});

CallsTable.displayName = 'CallsTable';

export default CallsTable;
