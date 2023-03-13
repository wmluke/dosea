import type {LoaderArgs} from '@remix-run/node';
import {json} from '@remix-run/node';
import {Link, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {getWorkspaceById} from '~/models/workspace.server';

export async function loader({params}: LoaderArgs) {
    if (!params.workspaceId) {
        throw new Response('Not Found', {
            status: 404
        });
    }

    const workspace = await getWorkspaceById(params.workspaceId);
    if (!workspace) {
        throw new Response('Not Found', {
            status: 404
        });
    }

    return json({workspace})
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function WorkspacePage() {
    const {workspace} = useLoaderData<typeof loader>();

    return (
        <div className="drawer drawer-mobile">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle"/>
            <div className="drawer-content flex flex-col"
                 style={{scrollBehavior: 'smooth', scrollPaddingTop: '5rem'}}>
                <div className="navbar bg-base-100 lg:hidden">
                    <div className="flex-none lg:hidden">
                        <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 className="inline-block w-6 h-6 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </label>
                    </div>
                    <div className="flex-1 px-2 mx-2 text-3xl lg:hidden">{workspace.name}</div>
                    <div className="flex-none">

                    </div>
                </div>
                <div className="px-2 mx-2 my-2 bg-base-100 bg-opacity-90">
                    <Outlet></Outlet>
                </div>
            </div>
            <div className="drawer-side" style={{scrollBehavior: 'smooth', scrollPaddingTop: '5rem'}}>
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <ul className="menu menu menu-compact flex flex-col p-0 px-4 w-80 bg-base-200 text-base-content">
                    <li>
                        <div className="flex-1 px-2 mx-2 text-3xl">{workspace.name}</div>
                    </li>
                    <li className="menu-title flex flex-row flex-nowrap">
                        <div>Datasets</div>
                        <Link className="btn btn-circle btn-xs" to={`/workspace/${workspace.id}/dataset/add`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </Link>
                    </li>
                    {workspace.datasets.map((ds) => {
                        return <li key={ds.id}>
                            <NavLink to={'/workspace/' + workspace.id + '/dataset/' + ds.id}
                                     className={({isActive}) =>
                                         classNames(isActive ? 'active' : '', 'gap')
                                     }
                            >
                                {ds.name}
                            </NavLink>
                        </li>;
                    })}
                </ul>
            </div>
        </div>
    );
}
