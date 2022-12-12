// deno-lint-ignore-file
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import { v4 as uuid4 } from 'https://esm.sh/uuid@9.0.0'
import { db as DB } from "https://deno.land/x/jljiu@v1.0.01/mod.ts";
import { ref, child, get, set } from "https://esm.sh/firebase@9.14.0/database"
import { db } from "./updateDB.ts";
let notionInfo = {
    id: 'a6315f71-8197-41af-8854-96a33bc0b155',
    spaceId: '993c3a7f-e1f7-4342-974a-f8abf65c40d7',
    userId: 'db17c83b-afcf-46e4-a5a8-ce99f167c637',
    cookie: 'logglytrackingsession=1abcc622-b80e-425b-bd5e-77654841eb20; NEXT_LOCALE=en-US; notion_experiment_device_id=be5d61a3-d85b-47bd-adca-b9c7880abe34; g_state={"i_l":0}; notion_browser_id=7919159a-b642-4ae9-a42c-3015b53e04c5; _gcl_au=1.1.1090681837.1661566953; cb_user_id=null; cb_group_id=null; cb_anonymous_id="51ac1758-684a-44fb-8360-cab9f87bd0c0"; mutiny.user.token=3c0acb29-a63c-44b3-83f5-8dd861e49fe6; mutiny.defaultOptOut=true; mutiny.optOut=; mutiny.optIn=true; _ga=GA1.1.932389555.1664288357; _mkto_trk=id:414-XMY-838&token:_mch-www.notion.so-1664288356716-48733; notion_locale=en-US/autodetect; notion_check_cookie_consent=false; ajs_anonymous_id=7919159ab6424ae9a42c3015b53e04c5; _ga_9ZJ8CB186L=GS1.1.1668337671.3.0.1668337671.60.0.0; csrf=fa333136-14f8-4fbe-a612-3af7b159b647; token_v2=87265696917130d1118643516ec45e0054fe1142673c53a036e08f2882fc24ecf26871dcedbbe6d9473a42ec16e04cbacd68c9e1c020f200ac31bca856f9c01a95d4ecf34353636099770f22658e; notion_user_id=db17c83b-afcf-46e4-a5a8-ce99f167c637; notion_users=["db17c83b-afcf-46e4-a5a8-ce99f167c637"]; __cf_bm=yuBse8npKInNqk138C70SnokRaXs_Ew6A71WFQRrPkw-1668337752-0-ASGZLLrY+ERUKqeGQcPvzh9SJtc7iq5LbquMbe0/Wy8KnI42xEGddMDpe/M0BkO+yxMvexe/+2KyEdHKX0HUwZ0=; notion_cookie_consent={"id":"48222933-2b88-440d-a68f-2340c022bb48","permission":{"necessary":true,"targeting":true,"preference":true,"performance":true},"policy_version":"v5"}; intercom-session-gpfdrxfd=U29VOTNjOEttYTF4UzQ1c2orWTdac2JHRGE5YlVhaXBQNE43Q2JsRHQzb0JpQVd5MzMvU0tWcW9FdXlDZlhzSi0tb3BZZnFjbk14blB6TmRrRDg1VnF3Zz09--3a46e6e0a2e029537022c71cd9472893fd6cd6f2; amp_af43d4=7919159ab6424ae9a42c3015b53e04c5.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1ghoap6qk.1ghobeceh.c88.303.f8b',
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
    return cl(res.url)
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
        download: true,
        spaceId: notionInfo.spaceId,
        userId: notionInfo.userId,
        cache: 'v2'
    }, xx)
    return await getRtnRedirect(xx.href, {
        "cookie": notionInfo.cookie
    })
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
    cl(list)
    let info:any = {
        size: 0,
        number: 0
    }
    try {
        let vv = Object.keys(list).map(async (xx) => {
            cl(list[xx].name)
            if (list[xx].name) {
                cl('isobj')
                let size: any = decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val())
                if (size.includes(' ')) size = unFormatFileSize(size)
                info.size = info.size + size
                info.number++
            }
            if (typeof (list[xx]) == 'string' && list[xx] !== '0' && mime.getType(list[xx])) {
                cl('isstring')
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