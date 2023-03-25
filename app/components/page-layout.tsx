import { useMatches } from "@remix-run/react";
import type { RouteMatch } from "@remix-run/react/dist/components";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { PrimaryDrawer } from "~/components/primary-drawer";
import { SecondaryDrawer } from "~/components/secondary-drawer";
import { TopNavbar } from "~/components/top-navbar";
import type { WorkspaceContext } from "~/routes/workspace";
import type { ConvertDatesToStrings } from "~/utils";

export interface PageLayoutProps {
    children: ReactNode;
}

export type PanelItemProps = ConvertDatesToStrings<WorkspaceContext> & { match: RouteMatch };
export type PanelItem = (props: PanelItemProps) => ReactNode;
export type PanelMatch = {
    primaryPanelItem?: PanelItem,
    secondaryPanelItem?: PanelItem,
    primaryDrawerOpen?: boolean,
};

export const PageLayoutContext = createContext<ConvertDatesToStrings<WorkspaceContext>>({});

export function usePageLayoutContext() {
    return useContext(PageLayoutContext);
}

/**
 * Render the last item emitted by the nested router chain
 * This enables some template inheritance style of composition
 */
function renderPanelContent(items: [PanelItem, RouteMatch][] = [], context: ConvertDatesToStrings<WorkspaceContext>) {
    const [item, match] = items.pop() ?? [];
    if (!item || !match) {
        return <></>;
    }
    return item({ match, ...context });
}

export function PageLayout({
                               children,
                               workspace,
                               dataset,
                               query,
                               tables
                           }: PageLayoutProps & ConvertDatesToStrings<WorkspaceContext>) {
    const primaryPanelItems: [PanelItem, RouteMatch][] = [];
    const secondaryPanelItems: [PanelItem, RouteMatch][] = [];
    const matches = useMatches();
    for (const match of matches) {
        const { primaryPanelItem, secondaryPanelItem }: PanelMatch = match.handle ?? {};
        if (typeof primaryPanelItem === "function") {
            primaryPanelItems.push([primaryPanelItem, match]);
        }
        if (typeof secondaryPanelItem === "function") {
            secondaryPanelItems.push([secondaryPanelItem, match]);
        }
    }
    const primaryPanelContent = renderPanelContent(primaryPanelItems, { workspace, dataset, query, tables });
    const secondaryPanelContent = renderPanelContent(secondaryPanelItems, { workspace, dataset, query, tables });

    const openDrawer = matches[matches.length - 1]?.handle?.primaryDrawerOpen ?? false;
    return (
        <PageLayoutContext.Provider value={{ workspace, dataset, query, tables }}>
            <PrimaryDrawer
                open={openDrawer}
                drawerSideContent={primaryPanelContent}
            >
                <SecondaryDrawer
                    drawerSideContent={
                        <div className="flex h-[150vh] flex-col p-4 w-80 bg-base-200 text-base-content">
                            {secondaryPanelContent}
                        </div>
                    }>
                    <TopNavbar workspace={workspace} />
                    {children}
                </SecondaryDrawer>
            </PrimaryDrawer>
        </PageLayoutContext.Provider>
    );
}
