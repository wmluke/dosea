import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import type { Dataset, DatasetQuery } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { QueryForm } from "~/components/query-form";
import { SectionDropdown } from "~/components/section-dropdown";
import { saveQuery } from "~/models/query.server";
import { loadDataset } from "~/routes/workspace.$workspaceId.dataset.$datasetId";
import { loadQuery } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId, queryId, chartId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);
    const query = await loadQuery({ queryId, datasetId });

    return json({ dataset, query, chartId });
}

export async function action({ params, request }: ActionArgs) {
    const { workspaceId, datasetId } = params;
    await loadDataset(datasetId, workspaceId);
    const form = await request.formData();
    const queryId = form.get("queryId") as string;
    const q = form.get("q") as string;
    if (!q) {
        throw Error("Missing field q");
    }
    const query = await saveQuery({
        id: queryId,
        query: q,
        datasetId: datasetId!
    });
    return redirect(`/workspace/${workspaceId}/dataset/${datasetId}/explore/${query.id}`);
}

export default function DatasetExplorePage() {
    const data = useLoaderData<typeof loader>();
    const dataset = data.dataset;
    const query = data.query;
    const deleteUrl = [
        "/workspace",
        dataset.workspaceId,
        "dataset",
        dataset.id,
        "explore",
        query?.id,
        "delete"
    ].join("/");
    return (
        <>
            <section id="query-form">
                <div className="flex justify-between mt-6">
                    <h3 className="prose text-xl flex gap-2">
                        <MagnifyingGlassIcon className="h-7 w-7" />
                        Query
                    </h3>
                    <SectionDropdown>
                        <Link className="text-sm" to={deleteUrl} reloadDocument>
                            Delete Query
                        </Link>
                    </SectionDropdown>
                </div>
                <QueryForm dataset={dataset as unknown as Dataset}
                           query={query as unknown as DatasetQuery} />
            </section>
            <Outlet />
        </>
    );
}
