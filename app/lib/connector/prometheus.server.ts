import { PrometheusDriver } from "prometheus-query";
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

export class PrometheusConnection implements Connection<PromSchema> {

    constructor(private readonly options: PrometheusConnectionOptions) {
    }

    public connect(): Promise<DB<PromSchema>> {
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

export class PrometheusDB implements DB<PromSchema, PromQueryOptions> {

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

    public query(promQL: string, options: PromQueryOptions = {}): Promise<any> {
        const { start = daysAgo(7), end = new Date(), step = "1d" } = options;
        if (start.valueOf() === end.valueOf()) {
            return this.prom.instantQuery(promQL, start);
        }
        return this.prom.rangeQuery(promQL, start, end, step);
    }

}
