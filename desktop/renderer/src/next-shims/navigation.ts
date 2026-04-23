import { useLocation, useNavigate, useParams as useRouteParams } from "react-router-dom";

export function usePathname() {
  return useLocation().pathname;
}

export function useRouter() {
  const navigate = useNavigate();

  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
  };
}

export function useParams<T extends Record<string, string | undefined>>() {
  return useRouteParams() as T;
}

export function notFound(): never {
  throw new Error("Not found");
}
