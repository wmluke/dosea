import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import type { Dataset, DatasetQuery } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import type { PanelMatch } from "~/components/page-layout";
import { QueryForm } from "~/components/query-form";
import { RightPane } from "~/components/right-pane";
import { SectionDropdown } from "~/components/section-dropdown";
import { runQueryCache } from "~/lib/query.cache";
import { saveQuery } from "~/models/query.server";
import { useWorkspaceContext } from "~/routes/workspace";
import { loadDataset } from "~/routes/workspace.$workspaceId.dataset.$datasetId";

export async function action({ params, request }: ActionArgs) {
    const { workspaceId, datasetId } = params;
    await loadDataset(datasetId, workspaceId);
    const form = await request.formData();
    const queryId = form.get("queryId") as string;
    const name = form.get("name") as string;
    const queryOptionsJson = form.get("queryOptionsJson") as string;
    const q = form.get("q") as string;
    if (!q) {
        throw Error("Missing field q");
    }
    const query = await saveQuery({
        id: queryId,
        query: q,
        name,
        queryOptionsJson,
        datasetId: datasetId!
    });
    runQueryCache.delete([queryId, datasetId].join("::"));
    return redirect(`/workspace/${workspaceId}/dataset/${datasetId}/query/${query.id}`);
}

export const handle: PanelMatch = {
    secondaryPanelItem({ schema }) {
        return (
            <div className="prose">
                <RightPane schema={schema} />
            </div>
        );
    }
};

export default function DatasetExplorePage() {
    const { dataset, query } = useWorkspaceContext();

    const deleteUrl = [
        "/workspace",
        dataset?.workspaceId,
        "dataset",
        dataset?.id,
        "query",
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
