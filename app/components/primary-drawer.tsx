import type { ReactNode } from "react";

export interface PrimaryDrawerProps {
    open?: boolean;
    children: ReactNode | ReactNode[];
    drawerSideContent: ReactNode;
}

export function PrimaryDrawer({ children, drawerSideContent, open = false }: PrimaryDrawerProps) {
    return (
        <div className="drawer-tablet drawer drawer-primary">
            <input id="primary-drawer" type="checkbox" defaultChecked={open}
                   className="drawer-toggle drawer-primary-toggle" />
            <div className="drawer-content drawer-primary-content flex flex-col"
                 style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}
            >
                {children}
            </div>
            <div className="drawer-side drawer-primary-side"
                 style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}>
                <label htmlFor="primary-drawer" className="drawer-overlay"></label>
                {drawerSideContent}
            </div>
        </div>
    );
}
