import { Outlet } from "@remix-run/react";
import type { PanelMatch } from "~/components/page-layout";
import { RightPane } from "~/components/right-pane";

export const handle: PanelMatch = {
    secondaryPanelItem({ queryResult, schema }) {
        return (
            <div className="prose">
                <RightPane queryResult={queryResult?.result} queryError={queryResult?.error} schema={schema} />
            </div>
        );
    }
};

export default function QueryLayout() {
    return (
        <Outlet />
    );
}
