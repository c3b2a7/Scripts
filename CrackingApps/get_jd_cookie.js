const args = formatArgument(typeof $argument == "string" && $argument || '');

var debug = Number(args.debug); // 调试模式, 1: 开启; 0: 关闭

var DeleteCookie = Number(args.deleteCookie); //是否清除所有Cookie, 1: 开启; 0: 关闭.

var out = 0; //接口超时退出, 用于可能发生的网络不稳定, 0则关闭. 如QX日志出现大量"JS Context timeout"后脚本中断时, 建议填写6000

var $nobyda = nobyda();

var merge = {};

const JDCookieKey = 'CookiesJD';

(async function ReadCookie() {
    if (DeleteCookie) {
        const write = $nobyda.write("", JDCookieKey);
        throw new Error(`Cookie清除${write ? `成功` : `失败`}, 请手动关闭脚本内"DeleteCookie"选项`);
    } else if ($nobyda.isRequest) {
        GetCookie()
    } else {
        throw new Error('脚本终止, 未获取Cookie ‼️')
    }
})().catch(e => {
    $nobyda.notify("京东签到", "", e.message || JSON.stringify(e))
}).finally(() => {
    if ($nobyda.isJSBox) $intents.finish($nobyda.st);
    $nobyda.done();
})

function CookieUpdate(oldValue, newValue, path = 'cookie') {
    let item, type, name = (oldValue || newValue || '').split(/pt_pin=(.+?);/)[1];
    let total = $nobyda.read(JDCookieKey);
    try {
        total = checkFormat(JSON.parse(total || '[]'));
    } catch (e) {
        $nobyda.notify("京东签到", "", "Cookie JSON格式不正确, 即将清空\n可前往日志查看该数据内容!");
        console.log(`京东签到Cookie JSON格式异常: ${e.message || e}\n旧数据内容: ${total}`);
        total = [];
    }
    for (let i = 0; i < total.length; i++) {
        if (total[i].cookie && new RegExp(`pt_pin=${name};`).test(total[i].cookie)) {
            item = i;
            break;
        }
    }
    if (newValue && item !== undefined) {
        type = total[item][path] === newValue ? -1 : 2;
        total[item][path] = newValue;
        item = item + 1;
    } else if (newValue && path === 'cookie') {
        total.push({
            cookie: newValue
        });
        type = 1;
        item = total.length;
    }
    return {
        total: checkFormat(total),
        type, //-1: same, 1: add, 2:update
        item,
        name: decodeURIComponent(name)
    };
}

function checkFormat(value) { //check format and delete duplicates
    let n, k, c = {};
    return value.reduce((t, i) => {
        k = ((i.cookie || '').match(/(pt_key|pt_pin)=.+?;/g) || []).sort();
        if (k.length == 2) {
            if ((n = k[1]) && !c[n]) {
                i.userName = i.userName ? i.userName : decodeURIComponent(n.split(/pt_pin=(.+?);/)[1]);
                i.cookie = k.join('')
                if (i.jrBody && !i.jrBody.includes('reqData=')) {
                    console.log(`异常钢镚Body已过滤: ${i.jrBody}`)
                    delete i.jrBody;
                }
                c[n] = t.push(i);
            }
        } else {
            console.log(`异常京东Cookie已过滤: ${i.cookie}`)
        }
        return t;
    }, [])
}

function GetCookie() {
    const req = $request;
    if (req.method != 'OPTIONS' && req.headers) {
        const CV = (req.headers['Cookie'] || req.headers['cookie'] || '');
        const ckItems = CV.match(/(pt_key|pt_pin)=.+?;/g);
        if (/^https:\/\/(me-|)api(\.m|)\.jd\.com\/(client\.|api)/.test(req.url)) {
            if (ckItems && ckItems.length == 2) {
                const value = CookieUpdate(null, ckItems.join(''))
                if (value.type !== -1) {
                    const write = $nobyda.write(JSON.stringify(value.total, null, 2), "CookiesJD")
                    $nobyda.notify(`用户名: ${value.name}`, ``, `${value.type == 2 ? `更新` : `写入`}京东 [账号${value.item}] Cookie${write ? `成功 🎉` : `失败 ‼️`}`)
                } else {
                    console.log(`\n用户名: ${value.name}\n与历史京东 [账号${value.item}] Cookie相同, 跳过写入 ⚠️`)
                }
            } else {
                throw new Error("写入Cookie失败, 关键值缺失\n可能原因: 非网页获取 ‼️");
            }
        } else if (/^https:\/\/ms\.jr\.jd\.com\/gw\/generic\/hy\/h5\/m\/appSign\?/.test(req.url) && req.body) {
            const value = CookieUpdate(CV, req.body, 'jrBody');
            if (value.type) {
                const write = $nobyda.write(JSON.stringify(value.total, null, 2), "CookiesJD")
                $nobyda.notify(`用户名: ${value.name}`, ``, `获取京东 [账号${value.item}] 钢镚Body${write ? `成功 🎉` : `失败 ‼️`}`)
            } else {
                throw new Error("写入钢镚Body失败\n未获取该账号Cookie或关键值缺失‼️");
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

function nobyda() {
    const isRequest = typeof $request != "undefined"
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const isLoon = typeof $loon != "undefined"
    const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
    const isNode = typeof require == "function" && !isJSBox;
    const NodeSet = 'CookieSet.json'
    const node = (() => {
        if (isNode) {
            const request = require('request');
            const fs = require("fs");
            const path = require("path");
            return ({
                request,
                fs,
                path
            })
        } else {
            return null
        }
    })()
    const notify = (title, subtitle, message, rawopts) => {
        const Opts = (rawopts) => { //Modified from https://github.com/chavyleung/scripts/blob/master/Env.js
            if (!rawopts) return rawopts
            if (typeof rawopts === 'string') {
                if (isLoon) return rawopts
                else if (isQuanX) return {
                    'open-url': rawopts
                }
                else if (isSurge) return {
                    url: rawopts
                }
                else return undefined
            } else if (typeof rawopts === 'object') {
                if (isLoon) {
                    let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
                    let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
                    return {
                        openUrl,
                        mediaUrl
                    }
                } else if (isQuanX) {
                    let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
                    let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
                    return {
                        'open-url': openUrl,
                        'media-url': mediaUrl
                    }
                } else if (isSurge) {
                    let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
                    return {
                        url: openUrl
                    }
                }
            } else {
                return undefined
            }
        }
        console.log(`${title}\n${subtitle}\n${message}`)
        if (isQuanX) $notify(title, subtitle, message, Opts(rawopts))
        if (isSurge) $notification.post(title, subtitle, message, Opts(rawopts))
        if (isJSBox) $push.schedule({
            title: title,
            body: subtitle ? subtitle + "\n" + message : message
        })
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
        if (isNode) {
            try {
                if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet)))
                    node.fs.writeFileSync(node.path.resolve(__dirname, NodeSet), JSON.stringify({}));
                const dataValue = JSON.parse(node.fs.readFileSync(node.path.resolve(__dirname, NodeSet)));
                if (value) dataValue[key] = value;
                if (!value) delete dataValue[key];
                return node.fs.writeFileSync(node.path.resolve(__dirname, NodeSet), JSON.stringify(dataValue));
            } catch (er) {
                return AnError('Node.js持久化写入', null, er);
            }
        }
        if (isJSBox) {
            if (!value) return $file.delete(`shared://${key}.txt`);
            return $file.write({
                data: $data({
                    string: value
                }),
                path: `shared://${key}.txt`
            })
        }
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
        if (isNode) {
            try {
                if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet))) return null;
                const dataValue = JSON.parse(node.fs.readFileSync(node.path.resolve(__dirname, NodeSet)))
                return dataValue[key]
            } catch (er) {
                return AnError('Node.js持久化读取', null, er)
            }
        }
        if (isJSBox) {
            if (!$file.exists(`shared://${key}.txt`)) return null;
            return $file.read(`shared://${key}.txt`).string
        }
    }
    const AnError = (name, keyname, er, resp, body) => {
        if (typeof (merge) != "undefined" && keyname) {
            if (!merge[keyname].notify) {
                merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`
            } else {
                merge[keyname].notify += `\n${name}: 异常, 已输出日志 ‼️ (2)`
            }
            merge[keyname].error = 1
        }
        return console.log(`\n‼️${name}发生错误\n‼️名称: ${er.name}\n‼️描述: ${er.message}${JSON.stringify(er).match(/"line"/) ? `\n‼️行列: ${JSON.stringify(er)}` : ``}${resp && resp.status ? `\n‼️状态: ${resp.status}` : ``}${body ? `\n‼️响应: ${resp && resp.status != 503 ? body : `Omit.`}` : ``}`)
    }
    const done = (value = {}) => {
        if (isQuanX) return $done(value)
        if (isSurge) isRequest ? $done(value) : $done()
    }
    return {
        AnError,
        isRequest,
        isJSBox,
        isSurge,
        isQuanX,
        isLoon,
        isNode,
        notify,
        write,
        read,
        done
    }
}