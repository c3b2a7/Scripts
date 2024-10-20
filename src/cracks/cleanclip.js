let url = $request.url;

let activate = () => {
    if (!url.startsWith("https://cleanclip.macaify.com/subscription/activate")) return;
    let body = JSON.stringify({
        activated: true,
        instance_id: "xxxx",
        plan_type: "permanent",
        status: "active",
        expires_remaining_time: 0,
        expires_at: null,
        error: null
    });
    $done({
        response: {
            body,
        },
    });
};

let deactivate = () => {
    if (!url.startsWith("https://cleanclip.macaify.com/subscription/deactivate")) return;
    let body = JSON.stringify({
        deactivated: true,
        activation_limit: 2,
        activation_usage: 0,
        error: null,
    });
    $done({
        response: {
            body,
        },
    });
};

activate();
deactivate();