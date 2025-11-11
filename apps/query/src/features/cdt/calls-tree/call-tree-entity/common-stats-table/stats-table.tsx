import { type StatsInfo } from '@app/store/cdt-openapi';
import { Table } from 'antd';
import { memo, type FC } from 'react';
import { useCallsTreeData } from '../../calls-tree-context';
import { columnsFactory, type TableData } from './columns';

const StatsTable: FC = () => {
    const { data, isFetching } = useCallsTreeData();

    function createTableData(): StatsInfo[] {
        if (data) {
            const totalTime = data.info.reduce((a, b) => a + (b.values.at(0) as number), 0);
            const res: StatsInfo[] = [];
            data.info.forEach(p => {
                const timeValue = p.values.at(0) as number;
                res.push({
                    name: p.id,
                    totalTime: timeValue,
                    totalTimePercent: timeValue / totalTime,
                });
            });
            return res;
        }
        return [];
    }

    return (
        <div className="table-container">
            <Table<TableData>
                columns={columnsFactory()}
                dataSource={createTableData()}
                loading={isFetching}
                className="ux-table-with-native-expand"
            />
        </div>
    );
};

export default memo(StatsTable);
