import * as React from 'react'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <>
            <header className="w-full h-[25px] bg-white shadow-[0_1px_0_0_primary] py-4 text-primary font-bold flex items-center justify-center text-lg">
                <Link to="/"><span>SWStarter</span></Link>
            </header>
            <main className="bg-background w-full h-full pt-6">
                <Outlet />
            </main>
        </>
    )
}
