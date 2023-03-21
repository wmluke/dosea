export interface PrimaryDrawerProps {
    drawerContent: React.ReactNode;
    drawerSideContent: React.ReactNode;
}

export function PrimaryDrawer({ drawerContent, drawerSideContent }: PrimaryDrawerProps) {
    return (
        <div className="drawer-mobile drawer drawer-primary">
            <input id="primary-drawer" type="checkbox" className="drawer-toggle drawer-primary-toggle" />
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
