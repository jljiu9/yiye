// deno-lint-ignore-file
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import { v4 as uuid4 } from 'https://esm.sh/uuid@9.0.0'
import { db as DB } from "https://deno.land/x/jljiu@v1.0.01/mod.ts";
import { getDatabase, ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js"
// import { db } from "./updateDB.ts";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
const firebaseConfig = {
  databaseURL: "https://xxxx-c0c6b-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// 初始化 Firebase 和数据库
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


let notionInfo = {
    id: 'a6315f71-8197-41af-8854-96a33bc0b155',
    spaceId: '993c3a7f-e1f7-4342-974a-f8abf65c40d7',
    userId: 'db17c83b-afcf-46e4-a5a8-ce99f167c637',
    downloadCookie:'file_token=1%3AmHkRwfJU0BD7uBPlbtE1pvsyL-BwjIpzVUxRKpsg0Tw%3Ac72d8d85283d074eb0a13dd3739c02c068168199cf49dd52%3Adb17c83b-afcf-46e4-a5a8-ce99f167c637; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%2251ac1758-684a-44fb-8360-cab9f87bd0c0%22; mutiny.user.token=3c0acb29-a63c-44b3-83f5-8dd861e49fe6; mutiny.defaultOptOut=true; mutiny.optOut=; mutiny.optIn=true; _ga=GA1.1.932389555.1664288357; ajs_anonymous_id=7919159ab6424ae9a42c3015b53e04c5; intercom-device-id-gpfdrxfd=c78c58f2-e474-40f4-bff2-70fe6b46e674; _tt_enable_cookie=1; _ttp=qD-u0tzDV5iu1LbR-1Xhi2O95ka; _ga_9ZJ8CB186L=GS1.1.1676365921.8.1.1676365980.1.0.0; _gcl_au=1.1.746338760.1677331493; _cioid=db17c83bafcf46e4a5a8ce99f167c637; tatari-session-cookie=0bddfb41-9cc9-b5aa-a403-0a8a857a4a6f; intercom-session-gpfdrxfd=R1N3aVZuRFRXS3hKd3dVY0g5UnNZRmM2aDFtV25WRlphaEQ1NU1EemJMeWFwbFVxZTMzZ1ZVWERCcE1qVGx6My0tOUZyWFBOTkhxTzZCazQ1elU4anpLZz09--f143a9989eb3318681622620db2e0543c7f2063f; __cf_bm=9pURreIHlfQyKddiiC2hi7RzifVBBDAquFyzM.P6ebM-1683737094-0-AYIVR4bnQ+moIkUMQS9iPH0flkjIayuAzSao3pF+rkuPH42FFTjIkGvHo/y5b1wk6LCl2rA9zUxs7ytq9F3KEVA=; _cfuvid=Pj_Rhcmsa5tyWJzuLZHH2dAgU6B3198fKv0PcwYMJFQ-1683737094746-0-604800000; amp_af43d4=7919159ab6424ae9a42c3015b53e04c5.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1h037stne.1h039c61c.eg9.3im.i2v',
    cookie: 'notion_browser_id=4e891293-cfa3-450b-9831-c652e2e4878d; device_id=3468284c-a13e-4c37-a213-d70a454d94df; notion_check_cookie_consent=false; _gcl_au=1.1.30990774.1724597695; _ga=GA1.1.1651438390.1724597696; _fbp=fb.1.1724597696586.507921723191697627; _hjSession_3664679=eyJpZCI6ImFiNDM2ODhkLTIwYWUtNDVkNi04MDdkLWJjM2UyNzlmMmIxYyIsImMiOjE3MjQ1OTc2OTY2NjgsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjoxLCJzcCI6MH0=; Metadata_visitor_id=m09oxvjgv6v9lrwfv; Metadata_session_id=m09oxvjg6yoi4wp9lmn; NEXT_LOCALE=zh-CN; notion_locale=zh-CN/autodetect; _rdt_uuid=1724597696273.9150953d-117d-4e4d-9f56-e44cebe591df; _ga_9ZJ8CB186L=GS1.1.1724597696.1.1.1724597705.51.0.0; _hjSessionUser_3664679=eyJpZCI6IjNjMjcwMzEyLWRkNjEtNTRmZC04OTUyLTQ3NDgyY2Y3MjAyMyIsImNyZWF0ZWQiOjE3MjQ1OTc2OTY2NjcsImV4aXN0aW5nIjp0cnVlfQ==; token_v2=v02%3Auser_token_or_cookies%3ASCcd9j7QnhiluSmAWwnCbQNZCsl23OfOwWKvTrcEgKDBM8x6klQD213NyFizELgksbAcC1ibuYpwucEiC0UgWxAqYBCLvOAVgmS-RHZ6CwazLeEaVgrGhCc7CRPQa9t6M7jw; notion_user_id=ab99e127-78a8-46c6-8270-766f19eeb5fa; notion_users=%5B%22ab99e127-78a8-46c6-8270-766f19eeb5fa%22%5D; _cioid=ab99e12778a846c68270766f19eeb5fa; __cf_bm=_NZwc5qLnKqvkc3sg84vG3tAQ4KeDQ5O7ncMtmI3QQc-1724597744-1.0.1.1-nCcV68nCxqOSm5L26vmgLoRsMK5pfHBEWkrAGt3CseDBGh6AKsigM_y3hFVnj.WwSB_KhbpJZiL10nsZQhrYKA; _cfuvid=vbap8RvfjZ4sUGXaPzrzl.I_YPQQSrXHcxvgQNsA9qM-1724597744497-0.0.1.1-604800000; amp_af43d4=4e891293cfa3450b9831c652e2e4878d.YWI5OWUxMjc3OGE4NDZjNjgyNzA3NjZmMTllZWI1ZmE=..1i650grjc.1i650jj03.2k.5.2p', // 请替换为您的Notion cookie
}

let userInfo = {
    tree: {},
    files: [],
    folder: []
}
const cl = (x: any): any => {
    console.log(x)
    return x
}
let getRtnRedirect = async (url: RequestInfo, header?: any): Promise<any> => {
    const res = await fetch(url, {
        method: 'get',
        headers: header
    });
    return res.url
}
let setObjOfUrlSearchParams = (obj: { [x: string]: any }, url: URL) => {
    Object.keys(obj).map(x => {
        url.searchParams.set(x, obj[x])
    })
}

let tempUrl = async (url: string, name: string) => {
    let xx = new URL('https://www.notion.so/signed/' + encodeURIComponent(url))
    setObjOfUrlSearchParams({
        table: 'block',
        name: name,
        id: notionInfo.id,
        download: false,
        spaceId: notionInfo.spaceId,
        userId: notionInfo.userId,
        cache: 'v2'
    }, xx)
    let temp = await getRtnRedirect(xx.href, {
        "cookie": notionInfo.cookie
    })
    return temp
}
const formatFileSize = function (bytes: number) {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
}
const unFormatFileSize = (size: string) => {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB']
    let xx: any = {}
    sufixes.map((x, index) => xx[x] = Math.pow(1024, index))
    return Number.parseFloat(size) * xx[size.split(' ').find(x => sufixes.includes(x)) as any]
}

let getFolderSize =async (user_cookie:string,path:string) => {
    let list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree' + path))).val()
    if (list == null) return
    let info:any = {
        size: 0,
        number: 0
    }
    try {
        let vv = Object.keys(list).map(async (xx) => {
            if (list[xx].name) {
                let size: any = decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val())
                if (size.includes(' ')) size = unFormatFileSize(size)
                info.size = info.size + size
                info.number++
            }
            if (typeof (list[xx]) == 'string' && list[xx] !== '0' && mime.getType(list[xx])) {
                let size: any = decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val())
                if (size.includes(' ')) size = unFormatFileSize(size)
                info.size = info.size + size
                info.number++
            } else {
    
            }
        })
        await Promise.all(vv)
        info.size = formatFileSize(info.size)
    } catch (error) {
        console.log(error)
    }
    return info
}

export { cl, mime, uuid4, tempUrl, notionInfo, formatFileSize, unFormatFileSize ,getFolderSize}