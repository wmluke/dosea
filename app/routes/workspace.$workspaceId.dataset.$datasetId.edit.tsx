import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DatasetForm } from "~/components/dataset-form";
import { loadDataset } from "~/routes/workspace.$workspaceId.dataset.$datasetId";

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);
    return json(dataset);
}

export default function DatasetEditPage() {
    const { id, workspaceId, type, name, connection } = useLoaderData<typeof loader>();
    return <DatasetForm id={id} workspaceId={workspaceId!} name={name} type={type} connection={connection} />;
}
