export type Call = unknown[];

type PodMeta = {
    podId: number;
    name: string;
    serviceName: string;
    namespace: string;

    literals: unknown;
    paramsInfo: unknown;
};

export type LoadCallsResponse = {
    numRecords: number;
    displayParamHash: string;

    calls: Call[];

    metas: PodMeta[];

    errorMessage?: string;
};
