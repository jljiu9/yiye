// deno-lint-ignore-file
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import { v4 as uuid4 } from 'https://esm.sh/uuid@9.0.0'
import { ref, child, get, set } from "https://esm.sh/firebase@10.3.1/database"
import { db as DB } from "https://deno.land/x/jljiu/mod.ts";
const db = DB("https://xxxx-c0c6b-default-rtdb.asia-southeast1.firebasedatabase.app")
// import { db } from "./updateDB.ts";
let notionInfo = {
    id: 'a6315f71-8197-41af-8854-96a33bc0b155',
    spaceId: '993c3a7f-e1f7-4342-974a-f8abf65c40d7',
    userId: 'db17c83b-afcf-46e4-a5a8-ce99f167c637',
    downloadCookie:'file_token=1%3A2LUw5gksu6DCp937xNTp2QQ3lLCn3eEzeRGKBVaNphM%3Ac1cae675a0588cb99a12ba2cd2c2b21dc31b8dc95e878c8d%3Adb17c83b-afcf-46e4-a5a8-ce99f167c637; _cfuvid=uVgBnrmvHAPx3ge3LtmUripRGD8FzmsX7I2n2IEzaB0-1688613306775-0-604800000; _gcl_au=1.1.1181184356.1688613309; _ga=GA1.1.18262015.1688613309; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%221ddf90de-4e0b-4636-8e1b-dd71ac64acfe%22; intercom-id-gpfdrxfd=0718f586-3316-42de-9d9b-8c8cf9ca5fc8; intercom-device-id-gpfdrxfd=ab73f8b2-95f8-443d-bc63-6c18b2ebbe46; _cioid=db17c83bafcf46e4a5a8ce99f167c637; __cf_bm=2r9MUQwLhSEnBQWWrmBNhBZ29ZsOR_g6VIeVwlBEsMg-1688628067-0-Ad7QVuv9Mw5Edj/L6pFpFMsrSGa/ZVDwbTXnmWKE3TVYA9EhHXR4KWroptWus/jPHa45zo7Bv66KE9NLPUYmfC8=; _ga_9ZJ8CB186L=GS1.1.1688626983.2.1.1688628576.60.0.0; t-ip=1; tatari-session-cookie=cb6cc960-1981-4e53-8a42-ae54d75afdfb; intercom-session-gpfdrxfd=Wk5za1RmWlZpSVZmbEtVTXEyWTIzQVVBb1NBbHdJSmVHLzBJK1pOLzBGV3NscS84N3NHWjR1UmRBalc4RFdoMC0teXV5bWF2azBaYjV4QW9KQVN4enBrQT09--a8dacbb34153407e32fde198118e555916c23de3; amp_af43d4=78858b2652254683b738700aee33c549.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1h4l05rgq.1h4l1muq8.5l.1v.7k',
    cookie: 'notion_browser_id=78858b26-5225-4683-b738-700aee33c549; notion_check_cookie_consent=false; _cfuvid=uVgBnrmvHAPx3ge3LtmUripRGD8FzmsX7I2n2IEzaB0-1688613306775-0-604800000; _gcl_au=1.1.1181184356.1688613309; _ga=GA1.1.18262015.1688613309; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%221ddf90de-4e0b-4636-8e1b-dd71ac64acfe%22; intercom-id-gpfdrxfd=0718f586-3316-42de-9d9b-8c8cf9ca5fc8; intercom-device-id-gpfdrxfd=ab73f8b2-95f8-443d-bc63-6c18b2ebbe46; csrf=769362fb-146d-4448-be01-a88dacf4e03e; NEXT_LOCALE=en-US; notion_locale=en-US/legacy; __cf_bm=1PX4ETNOx16sM7yMdBBMs3rkRbQ5jePQQOTUcX8_Bkk-1688626983-0-AWR9mFrm64djNnqlO2vRaOusGe6wSRdaDzLulnqyZ6ZoVd64jS7idhkJ/00SCOTkjbLVBjahVG6a6r0FGp2gKks=; notion_experiment_device_id=b2cPg_2gSfur4VWobrhCA; t-ip=1; tatari-session-cookie=cb6cc960-1981-4e53-8a42-ae54d75afdfb; _ga_9ZJ8CB186L=GS1.1.1688626983.2.1.1688627470.60.0.0; token_v2=v02%3Auser_token_or_cookies%3Ayv5uXZaKaZ1ITWTczmrGlQBlLEy9X9QCgJ7qJFSNRgphoxN85Iny7FMUS9liYghq-EReFxU_7zcScCWlO0GdFADk1Xhf_U-MLR3O9MGNLK5587rU0oejlT_3ib8newNW_4BK; notion_user_id=db17c83b-afcf-46e4-a5a8-ce99f167c637; notion_users=%5B%22db17c83b-afcf-46e4-a5a8-ce99f167c637%22%5D; _cioid=db17c83bafcf46e4a5a8ce99f167c637; notion_cookie_consent={%22id%22:%2248222933-2b88-440d-a68f-2340c022bb48%22%2C%22permission%22:{%22necessary%22:true%2C%22targeting%22:true%2C%22preference%22:true%2C%22performance%22:true}%2C%22policy_version%22:%22v5%22}; intercom-session-gpfdrxfd=bDByV210aGpZNjMvRklmY3MyYXpKc1VLVjZRdGlad3dibGRqNk16ZVEydWozSU51YkNSM1cyeFRiZVdZM3J2dC0tNjlobjdmTXFJdktwTU5oZ285aEgyZz09--e3ef7ce410cfc40b6dd8ea1f80f3b5d513c364fc; amp_af43d4=78858b2652254683b738700aee33c549.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1h4l05rgq.1h4l0r5kr.52.1h.6j',
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

export { cl, mime, uuid4, tempUrl, notionInfo, formatFileSize, unFormatFileSize ,getFolderSize ,db}
