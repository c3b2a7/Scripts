let url = $request.url;

let activate = () => {
    if (!url.startsWith("https://shottr.cc/licensing/verify.php")) return;
    let body = JSON.stringify({
        tier: "1",
        explanation: "2099-01-01 23:59:59"
    });
    $done({
        response: {
            body,
        },
    });
};

activate();