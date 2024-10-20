let reqBody = JSON.parse($request.body)

let body = JSON.stringify({
    hash: reqBody.hash,
    tier: "1",
    explanation: "2099-01-01 23:59:59"
});

$done({response: {body}});