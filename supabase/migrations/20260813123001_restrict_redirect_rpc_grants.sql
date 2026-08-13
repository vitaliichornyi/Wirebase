-- Only the anonymous redirect route ever calls these; authenticated users
-- don't need the ability to invoke them (they never go through this path).
revoke execute on function public.resolve_redirect(text) from authenticated;
revoke execute on function public.record_click(uuid, text, text, text) from authenticated;
