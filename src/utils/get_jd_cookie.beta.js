import API from "../openapi/API.js"

const JDCookieKey = 'JD_COOKIES';

const $ = API(JDCookieKey);
const args = formatArgument(typeof $argument == "string" && $argument || '');
$.env.isNode ? $request = $.read('Request') : null;
$.debug = Number(args.debug) || ($.read('Debug') === 'true'); //Debug模式, 1: 开启; 0: 关闭.
$.DeleteCookie = Number(args.deleteCookie) || ($.read('DeleteCookie') === 'true'); //是否清除所有Cookie, 1: 开启; 0: 关闭.

runs()
    .catch(e => $.error(e.error || e.message || e))
    .finally(() => $.done());

async function runs() {
    if ($.DeleteCookie) {
        DeleteCookie();
    } else if ($.env.isRequest) {
        GetCookie()
    } else {
        throw new Error('脚本终止, 未获取Cookie ‼️')
    }
}

function DeleteCookie() {
    const write = $.delete(`#${JDCookieKey}`);
    throw new Error(`Cookie清除${write ? `成功` : `失败`}, 请手动关闭脚本内"DeleteCookie"选项`);
}

function GetCookie() {
    const req = $request;
    if (req.method !== 'OPTIONS' && req.headers) {
        const cookies = (req.headers['Cookie'] || req.headers['cookie'] || '');
        const cookiesItems = cookies.match(/(pt_key|pt_pin)=.+?;/g);
        if (/^https:\/\/(me-)?api(\.m)?\.jd\.com\/(client|api)/.test(req.url)) {
            if (cookiesItems && cookiesItems.length === 2) {
                const ck = cookiesItems.join('');
                const pk = ck.split(/pt_key=(.+?);/)[1];
                const pp = ck.split(/pt_pin=(.+?);/)[1];
                $.write(ck, pp)
                $.notify(`用户名: ${pp}`, ``, `写入京东 [账号${pp}] Cookie${write ? `成功 🎉` : `失败 ‼️`}`)
            } else {
                $.log(cookiesItems)
                throw new Error("写入Cookie失败, 关键值缺失，可能原因: 非网页获取 ‼️");
            }
        } else if (req.url === 'http://www.apple.com/') {
            throw new Error("类型错误, 手动运行请选择上下文环境为Cron ⚠️");
        }
    } else if (!req.headers) {
        throw new Error("写入Cookie失败, 请检查匹配URL或配置内脚本类型 ⚠️");
    }
}

function formatArgument(s) {
    return Object.fromEntries(s.split('&').map(item => item.split('=')))
}
