import { useMatches } from "@remix-run/react";
import type { RouteMatch } from "@remix-run/react/dist/components";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { PrimaryDrawer } from "~/components/primary-drawer";
import { SecondaryDrawer } from "~/components/secondary-drawer";
import { ThemeSwitcher } from "~/components/theme-switcher";
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
    hidePrimaryDrawer?: boolean
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
                               queryResult,
                               schema
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
    const primaryPanelContent = renderPanelContent(primaryPanelItems, {
        workspace,
        dataset,
        query,
        queryResult,
        schema
    });
    const secondaryPanelContent = renderPanelContent(secondaryPanelItems, {
        workspace,
        dataset,
        query,
        queryResult,
        schema
    });

    const openDrawer = matches[matches.length - 1]?.handle?.primaryDrawerOpen ?? false;
    const hidePrimaryDrawer = matches[matches.length - 1]?.handle?.hidePrimaryDrawer ?? false;

    if (hidePrimaryDrawer) {
        return (
            <PageLayoutContext.Provider value={{ workspace, dataset, query, schema, queryResult }}>
                <SecondaryDrawer
                    drawerSideContent={
                        <div className="flex h-[150vh] flex-col p-4 w-80 bg-base-200 text-base-content">
                            {secondaryPanelContent}
                        </div>
                    }>
                    <TopNavbar workspace={workspace} showBackButton={true} />
                    {children}
                </SecondaryDrawer>
            </PageLayoutContext.Provider>
        );
    }

    return (
        <PageLayoutContext.Provider value={{ workspace, dataset, query, queryResult, schema }}>
            <PrimaryDrawer
                open={openDrawer}
                drawerSideContent={primaryPanelContent}
            >
                <SecondaryDrawer
                    drawerSideContent={
                        <div className="flex h-[150vh] flex-col px-4 w-80 bg-base-200 text-base-content">
                            <div className="flex gap-0 justify-end mx-2">
                                <ThemeSwitcher />
                                <a aria-label="Github" target="_blank" href="https://github.com/wmluke/dosea"
                                   rel="noopener noreferrer"
                                   className="btn btn-ghost drawer-button btn-square normal-case">
                                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                         className="inline-block h-5 w-5 fill-current md:h-6 md:w-6">
                                        <path
                                            d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z"></path>
                                    </svg>
                                </a>

                            </div>
                            {secondaryPanelContent}
                        </div>
                    }>
                    <TopNavbar workspace={workspace} showBackButton={false} />
                    {children}
                </SecondaryDrawer>
            </PrimaryDrawer>
        </PageLayoutContext.Provider>
    );
}
