import { prisma } from "~/db.server";

export interface ChartConfigInput {
    id?: string;
    configJson: string;
    type: string;
    queryId: string;
}

export function getChartConfigById(id: string) {
    return prisma.chartConfig.findUnique({ where: { id } });
}

export function getChartConfigsByQueryId(queryId: string) {
    return prisma.chartConfig.findMany({
        where: {
            queryId,
        },
    });
}

export function saveChartConfig({ id, configJson, queryId, type }: ChartConfigInput) {
    if (id) {
        return prisma.chartConfig.update({
            data: { configJson, type },
            where: { id },
        });
    }
    return prisma.chartConfig.create({
        data: { configJson, queryId, type },
    });
}
