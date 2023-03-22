import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { loadQuery } from "~/lib/query.cache";
import { deleteQuery } from "~/models/query.server";


export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId, queryId } = params;
    const query = await loadQuery({ queryId, datasetId });
    await deleteQuery(query!.id);
    return redirect(["/workspace", workspaceId, "dataset", datasetId, "query"].join("/"));
}
