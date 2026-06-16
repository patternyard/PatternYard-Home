<script>
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import session from "$lib/stores/session.js";

    // This page is loaded by the editor (a separate origin) inside a hidden 100x100
    // iframe at `${HOME}/embed/editor?external=<editorOrigin>`. Its only job is to
    // read the logged-in user's identity from this origin's session and post it back
    // to the editor so the editor can show the signed-in username. The editor side
    // listens for `{ type: "login", packet: { loggedIn: true, username } }`.
    //
    // NOTE: the home rewrite does not populate `pm:session` with a logged-in user
    // yet (no login flow has been implemented here). Until it does, this bridge
    // correctly reports "not logged in" and posts nothing. It activates automatically
    // once the session carries a real user.
    onMount(() => {
        // Resolve and validate the origin we are allowed to talk to. We never post
        // to "*" — only to the exact, well-formed origin the editor handed us.
        const external = new URLSearchParams(window.location.search).get("external");
        let targetOrigin;
        try {
            targetOrigin = new URL(external).origin;
        } catch {
            return;
        }
        if (!/^https?:$/.test(new URL(targetOrigin).protocol)) return;

        const current = get(session);
        const username = current.userCachedDisplayName || current.userCachedUsername;
        const loggedIn = Boolean(current.userCachedId && username);
        if (!loggedIn) return;

        window.parent.postMessage(
            {
                type: "login",
                packet: {
                    loggedIn: true,
                    username,
                },
            },
            targetOrigin
        );
    });
</script>

<!-- Rendered inside a hidden iframe by the editor; intentionally has no visible UI. -->
<span style="display:none" aria-hidden="true">PatternYard editor login bridge</span>
