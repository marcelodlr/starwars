import {Link as TanStackLink, type LinkProps } from "@tanstack/react-router"

export default function Link({ to, params, children }: LinkProps) {
    return <TanStackLink to={to} params={params} className="text-link hover:brightness-80 underline text-base">{children}</TanStackLink>
}