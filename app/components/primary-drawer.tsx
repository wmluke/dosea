export interface PrimaryDrawerProps {
    open?: boolean;
    drawerContent: React.ReactNode;
    drawerSideContent: React.ReactNode;
}

export function PrimaryDrawer({ drawerContent, drawerSideContent, open = false }: PrimaryDrawerProps) {
    return (
        <div className="drawer-mobile drawer drawer-primary">
            <input id="primary-drawer" type="checkbox" defaultChecked={open}
                   className="drawer-toggle drawer-primary-toggle" />
            <div className="drawer-content drawer-primary-content flex flex-col"
                 style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}
            >
                {drawerContent}
            </div>
            <div className="drawer-side drawer-primary-side"
                 style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}>
                <label htmlFor="primary-drawer" className="drawer-overlay"></label>
                {drawerSideContent}
            </div>
        </div>
    );
}
