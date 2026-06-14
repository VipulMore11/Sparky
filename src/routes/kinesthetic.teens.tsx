import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/kinesthetic/teens")({ component: () => <Outlet /> });