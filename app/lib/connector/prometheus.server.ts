import { PrometheusDriver } from "prometheus-query";
import type { QueryResult } from "prometheus-query/dist/types";
import type { Connection, DB } from "~/lib/connector/connection.server";
import { daysAgo } from "~/utils";

export interface PrometheusConnectionOptions {
    endpoint: string;
}

export interface PromSchema {
    labels: string[];
    metrics: string[];
    instances: string[];
    jobs: string[];
}

export class PrometheusConnection implements Connection<PromSchema, PromQueryOptions, QueryResult> {

    constructor(private readonly options: PrometheusConnectionOptions) {
    }

    public async test(): Promise<boolean> {
        const promDB = await this.connect();
        try {
            await promDB.getSchema();
            return true;
        } catch (e) {
            console.warn("Failed to connect to prometheus");
            console.warn(e);
            throw e;
        } finally {
            await promDB.close();
        }
    }


    public connect(): Promise<DB<PromSchema, PromQueryOptions, QueryResult>> {
        const url = this.normalizeAndValidate();
        const prom = new PrometheusDriver({
            endpoint: url,
            baseURL: "/api/v1"
        });

        return Promise.resolve(new PrometheusDB(prom));
    }

    public normalizeAndValidate(): string {
        return new URL(this.options.endpoint).toString();
    }
}

export interface PromQueryOptions {
    start?: number | Date;
    end?: number | Date;
    step?: string;
}

export interface PromResult {
    resultType: "matrix" | "vector" | "scalar" | "string",
    result: PromRangeVector[];
}

export interface PromRangeVector {
    metric: {
        name: string,
        labels: { [key: string]: string }
    };
    values: TimePoint[];
}

export interface TimePoint<V = number> {
    time: string;
    value: V;
}


export function convertMatrixResultsToRows(result: PromResult): { time: string; [metric: string]: number | string }[] {
    if (result.resultType !== "matrix") {
        throw "Invalid result type";
    }

    const data = new Map<string, { time: string; [metric: string]: number | string }>();
    for (const vector of result.result) {
        const { name = "aggregation", labels } = vector.metric;
        const { instance } = labels;
        for (const point of vector.values) {
            const { time, value } = point;
            const key = [time, instance].join(":");

            if (!data.has(key)) {
                data.set(key, { time, instance });
            }
            const obj = data.get(key)!;
            obj[name] = value;
        }
    }

    return Array.from(data.values());

}

export class PrometheusDB implements DB<PromSchema, PromQueryOptions, QueryResult> {

    constructor(private readonly prom: PrometheusDriver) {
    }

    public close(): Promise<void> {
        return Promise.resolve();
    }

    public exec(sql: string): Promise<any> {
        return Promise.resolve(undefined);
    }

    public async getSchema(): Promise<PromSchema> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 100);
        const [labels, metrics, instances, jobs] = await Promise.all([
            this.prom.labelNames(undefined, startDate, new Date()),
            this.prom.labelValues("__name__", undefined, startDate, new Date()),
            this.prom.labelValues("instance", undefined, startDate, new Date()),
            this.prom.labelValues("job", undefined, startDate, new Date())
        ]);
        return { labels, metrics, instances, jobs };
    }

    public async query(promQL: string, options: PromQueryOptions = {}): Promise<QueryResult> {
        console.log(options);
        const { start = daysAgo(7), end = new Date(), step = "1d" } = options;
        if (start.valueOf() === end.valueOf()) {
            return this.prom.instantQuery(promQL, start);
        }
        return this.prom.rangeQuery(promQL, start, end, step);
    }

}
