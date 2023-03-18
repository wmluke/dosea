import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteDataset } from "~/models/dataset.server";
import { loadDataset } from "~/routes/workspace.$workspaceId.dataset.$datasetId";


export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId } = params;

    const dataset = await loadDataset(datasetId, workspaceId);

    await deleteDataset(dataset.id);

    return redirect(["/workspace", workspaceId].join("/"));

}
