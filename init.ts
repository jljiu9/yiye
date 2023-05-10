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
    cookie: 'logglytrackingsession=1abcc622-b80e-425b-bd5e-77654841eb20; NEXT_LOCALE=en-US; notion_experiment_device_id=be5d61a3-d85b-47bd-adca-b9c7880abe34; g_state={"i_l":0}; notion_browser_id=7919159a-b642-4ae9-a42c-3015b53e04c5; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%2251ac1758-684a-44fb-8360-cab9f87bd0c0%22; mutiny.user.token=3c0acb29-a63c-44b3-83f5-8dd861e49fe6; mutiny.defaultOptOut=true; mutiny.optOut=; mutiny.optIn=true; _ga=GA1.1.932389555.1664288357; _mkto_trk=id:414-XMY-838&token:_mch-www.notion.so-1664288356716-48733; ajs_anonymous_id=7919159ab6424ae9a42c3015b53e04c5; intercom-device-id-gpfdrxfd=c78c58f2-e474-40f4-bff2-70fe6b46e674; tatari-cookie-test=25888; _tt_enable_cookie=1; _ttp=qD-u0tzDV5iu1LbR-1Xhi2O95ka; _ga_9ZJ8CB186L=GS1.1.1676365921.8.1.1676365980.1.0.0; token_v2=2679a1aff349515c1bff66c7012b92d58546a1813638921a820c2606e5631bb3dab400bf3f7e0ddd5c6a0e813b324415d31b8ed41d95d7b566ef96a1a6a907400a96319c7421718e773b50d6716f; notion_user_id=db17c83b-afcf-46e4-a5a8-ce99f167c637; notion_cookie_consent={%22id%22:%2248222933-2b88-440d-a68f-2340c022bb48%22%2C%22permission%22:{%22necessary%22:true%2C%22targeting%22:true%2C%22preference%22:true%2C%22performance%22:true}%2C%22policy_version%22:%22v5%22}; notion_users=[%22db17c83b-afcf-46e4-a5a8-ce99f167c637%22]; _gcl_au=1.1.746338760.1677331493; notion_check_cookie_consent=false; t-ip=1; _cioid=db17c83bafcf46e4a5a8ce99f167c637; notion_locale=en-US/autodetect; tatari-session-cookie=0bddfb41-9cc9-b5aa-a403-0a8a857a4a6f; amp_af43d4=7919159ab6424ae9a42c3015b53e04c5.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1h0308kpl.1h030gf1f.ec7.3ho.htv; intercom-session-gpfdrxfd=eHlBVlF6cjhkMG5SU0kvb2NBVjFnaXFUM1pnM0tsWGNSY1V5V3hjTHJuTlBNOUpNZTZ4VE8rbkx3aGJuZ3BlKy0tMXV2QlIycXRKQm1JQXU3clJRUE1WUT09--5a9f8c38830f78b2d565ce7af3e8a72f51420173; __cf_bm=tV_znwzy.C7p7g3NtrzTXtin5RSyKs9_kdLYfBzqKvU-1683728373-0-ATHkF51D0t6LcqaExyrdc6U3Yin+x0xIb27kOVNiGEcL2T9aRWpJWC406Qm+xpbERnf0DoKgi/L61lN0yYGkySA=; _cfuvid=oLKUydyWXDHNOPnuuTN_0.Q7Ws58LHj8Y_kaNLyaJCE-1683728373566-0-604800000',
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