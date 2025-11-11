import type { CallParameterView, CallStatsInfo, CallsTreeInfo } from '@app/store/cdt-openapi';
import prettyMilliseconds from 'pretty-ms';

function formatValues(values: unknown[], type: string): CallParameterView[] {
    const res: CallParameterView[] = [];
    values.forEach(v => {
        let formattedValue: string;
        if (type == 'Date') formattedValue = new Date(v as number).toString();
        else if (type == 'Duration') formattedValue = prettyMilliseconds(v as number);
        else formattedValue = String(v);
        res.push({
            id: formattedValue,
        });
    });
    return res;
}

export function createParamsData(node: CallsTreeInfo): CallParameterView[] | undefined {
    const res: CallParameterView[] = [];
    if (node.params) {
        node.params.forEach(p => {
            res.push({
                id: p.id,
                children: formatValues(p.values, p.type),
            });
        });
    }
    return res;
}

export function findTreeNode(children: CallsTreeInfo[], id: string): CallsTreeInfo | undefined {
    for (const child of children) {
        if (child.id == id) return child;
        if (child.children) {
            const res = findTreeNode(child.children, id);
            if (res) return res;
        }
    }
}

export function createCallStatsTableData(infoItem: CallsTreeInfo): CallStatsInfo[] {
    return [
        {
            name: 'Duration',
            self: infoItem.duration?.self.toString(),
            total: infoItem.duration?.total,
        },
        {
            name: 'Suspension',
            self: infoItem.suspension?.self.toString(),
            total: infoItem.suspension?.total,
        },
        {
            name: 'Invocations',
            self: infoItem.invocations?.self.toString(),
            total: infoItem.invocations?.total,
        },
        {
            name: 'Avg per inv',
            self: infoItem.avg?.self.toString(),
            total: infoItem.avg?.total,
        },
        {
            name: 'Source jar',
            self: infoItem.info?.sourceJar,
        },
        {
            name: 'Line number',
            self: infoItem.info?.lineNumber,
        },
    ];
}
