import type { ReactNode } from "react";

export interface SecondaryDrawerProps {
    children: ReactNode | ReactNode[];
    drawerSideContent: ReactNode;
}

export function SecondaryDrawer({ children, drawerSideContent }: SecondaryDrawerProps) {
    return (
        <div className="drawer-mobile drawer drawer-end drawer-secondary">
            <input id="secondary-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content drawer-secondary-content flex flex-col"
                 style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}
            >
                {children}
            </div>
            <div className="drawer-side drawer-secondary-side"
                 style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}>
                <label htmlFor="secondary-drawer" className="drawer-overlay drawer-overlay-secondary"></label>
                {drawerSideContent}
            </div>
        </div>
    );
}
