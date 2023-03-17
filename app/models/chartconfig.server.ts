import { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export interface ChartConfigInput {
    id?: string;
    configJson: string;
    type: string;
    queryId: string;
}

export function getChartConfigById(id: string) {
    return prisma.chartConfig.findUnique({
        where: { id },
        include: { query: true }
    });
}

export type ChartWithQuery = Prisma.PromiseReturnType<typeof getChartConfigById>

export function getChartConfigsByQueryId(queryId: string) {
    return prisma.chartConfig.findMany({
        where: {
            queryId
        },
        include: {
            query: true
        }
    });
}

export function saveChartConfig({ id, configJson, queryId, type }: ChartConfigInput) {
    if (id) {
        return prisma.chartConfig.update({
            data: { configJson, type },
            where: { id }
        });
    }
    return prisma.chartConfig.create({
        data: { configJson, queryId, type }
    });
}

export function deleteChartConfig(id: string) {
    return prisma.chartConfig.delete({ where: { id } });
}
