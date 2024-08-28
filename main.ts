// deno-lint-ignore-file
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import { v4 as uuid4 } from 'https://esm.sh/uuid@9.0.0'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase 配置
const firebaseConfig = {
  databaseURL: "https://xxxx-c0c6b-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// 初始化 Firebase 和数据库
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Notion 相关信息
const notionInfo = {
    id: 'a6315f71-8197-41af-8854-96a33bc0b155',
    spaceId: '993c3a7f-e1f7-4342-974a-f8abf65c40d7',
    userId: 'db17c83b-afcf-46e4-a5a8-ce99f167c637',
    cookie:'file_token=v02%3Afile_token%3A9kKJmDqMIIR34ZKjYldtgqVcMXI5y12ipipmmo_ZxCTSqm84M71QcAWiZe_3o5C-h4ulXh-V4dXTI3yUD9vgjjxAA0XoeMyXGNghTCTKF-Amf3h4V_kbRvB8B1qTOIavOifd8y5pyvU4akA4W0JmGJ7np4Fh; logglytrackingsession=1abcc622-b80e-425b-bd5e-77654841eb20; notion_experiment_device_id=be5d61a3-d85b-47bd-adca-b9c7880abe34; notion_browser_id=7919159a-b642-4ae9-a42c-3015b53e04c5; cb_user_id=null; cb_group_id=null; _ga=GA1.1.932389555.1664288357; _mkto_trk=id:414-XMY-838&token:_mch-www.notion.so-1664288356716-48733; intercom-device-id-gpfdrxfd=c78c58f2-e474-40f4-bff2-70fe6b46e674; tatari-cookie-test=25854168; intercom-id-gpfdrxfd=a21f227d-e325-4dc9-b2ab-6daaa178a506; cb_anonymous_id=%2208a09ba8-3e45-4890-ba05-ec7dcd617ec4%22; _cioid=db17c83bafcf46e4a5a8ce99f167c637; device_id=b3f16c18-a3b4-4ad8-8b57-3c94663788e9; _hjSessionUser_3664679=eyJpZCI6IjcwMGU0NDUxLTU4OWUtNTY4Yy04ODE0LWQwN2FkYmE2NTdlOSIsImNyZWF0ZWQiOjE3MDcyODIyMTI1MzIsImV4aXN0aW5nIjp0cnVlfQ==; tatari-session-cookie=0bddfb41-9cc9-b5aa-a403-0a8a857a4a6f; _uetvid=0eb54c3044f611ee8ce80b2316718ae4|g9zjm9|1707310268896|3|1|bat.bing.com/p/insights/c/o; _gcl_au=1.1.780540888.1724168009; token_v2=v02%3Auser_token_or_cookies%3AeOaVJPO-J5wsIdHp25CyqkrFCn1pG2aK1gVP-_Ens3rWrJzqQmmfdM2SIDO_2JUNPuFJqOR6HHNHHNc5nbZ1b6FWt4qrOYNroSTpn4jYjMsvSNjcRZ9_ccviLCR5sqAfcjOV; notion_user_id=db17c83b-afcf-46e4-a5a8-ce99f167c637; notion_cookie_consent={%22id%22:%2248222933-2b88-440d-a68f-2340c022bb48%22%2C%22permission%22:{%22necessary%22:true%2C%22targeting%22:true%2C%22preference%22:true%2C%22performance%22:true}%2C%22policy_version%22:%22v5%22}; notion_users=[%22db17c83b-afcf-46e4-a5a8-ce99f167c637%22]; NEXT_LOCALE=en-US; Metadata_visitor_id=m08l0djr11yn7x1k1swo; notion_check_cookie_consent=false; _ga_9ZJ8CB186L=GS1.1.1724601071.39.0.1724601071.60.0.0; _rdt_uuid=1724168009352.7569b69a-7a77-4dce-8505-061248d1b6a4; amp_af43d4=7919159ab6424ae9a42c3015b53e04c5.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1i651gkcj.1i65412cn.hdm.3tf.lb5; __cf_bm=fMGNnGzv7dzSIlQVJlRXHSTKPVzIcU3tajpgmeJ4XG0-1724683900-1.0.1.1-zLW16oX9v0LJEyQnZM27dOm3ECjYsfVEiH3EWvUvErCXz4MT2MRf1BiGFwo0Fk0fhUSF35isGdGSt5r8bQH3pw; _cfuvid=lxkkY_X877eZHE3mrlReU42RthCdq6fiCk24chpMaO8-1724683900429-0.0.1.1-604800000; notion_locale=en-US/user_choice'
}

// 刷新notion cookie
const parseCookieString = (cookieString: string) =>{
    const cookies = {};
    cookieString.split(';').forEach(pair => {
      const [name, value] = pair.trim().split('=');
      cookies[name] = value;
    });
    return cookies;
}
async function refreshNotionSession(cookie: string) {
    const response = await fetch("https://www.notion.so/f/refresh", {
        "headers": {
            "cookie": cookie,
        },
    });
    const setCookieHeader = response.headers.get('set-cookie');
    // 处理并更新cookie
    let updatedCookies = {};
    if (setCookieHeader) {
        const cookieStrings = setCookieHeader.split(', ');
        cookieStrings.forEach(cookieString => {
            const [name, ...rest] = cookieString.split('=');
            const value = rest.join('=').split(';')[0];
            updatedCookies[name.trim()] = value;
        });
    }
    // 合并新旧cookie
    const oldCookies = parseCookieString(cookie);
    const mergedCookies = { ...oldCookies, ...updatedCookies };
    // 转换回字符串格式
    const finalCookieString = Object.entries(mergedCookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    return finalCookieString;
}
async function getNotionInfo() {
    const notionInfoRef = ref(db, 'jsave/notioninfo');
    const snapshot = await get(notionInfoRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const lastUpdated = new Date(data.lastUpdated);
        const now = new Date();
        if (now.getTime() - lastUpdated.getTime() > 3 * 60 * 60 * 1000) { // 3小时
        // Cookie 过期，需要刷新
        const newCookie = await refreshNotionSession(data.cookie);
        data.cookie = newCookie;
        data.lastUpdated = now.toISOString();
        await set(notionInfoRef, data);
        }
        return data;
    } else {
        // 如果数据不存在，使用默认值并保存
        const defaultNotionInfo = {
            ...notionInfo,
            lastUpdated: new Date().toISOString()
        };
        await set(notionInfoRef, defaultNotionInfo);
        return defaultNotionInfo;
    }
}



// 辅助函数
const cl = (x: any): any => {
    console.log(x);
    return x;
}

const getRtnRedirect = async (url: RequestInfo, header?: any): Promise<string> => {
    const res = await fetch(url, {
        method: 'get',
        headers: header
    });
    return res.url;
}

const setObjOfUrlSearchParams = (obj: { [x: string]: any }, url: URL) => {
    Object.entries(obj).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
}

const tempUrl = async (url: string, name: string): Promise<string> => {
    let notionInfo = await getNotionInfo();
    const xx = new URL('https://www.notion.so/signed/' + encodeURIComponent(url));
    setObjOfUrlSearchParams({
        table: 'block',
        name,
        id: notionInfo.id,
        download: false,
        spaceId: notionInfo.spaceId,
        userId: notionInfo.userId,
        cache: 'v2'
    }, xx);
    let vv =  await getRtnRedirect(xx.href, {
        "cookie": notionInfo.cookie
    });
    cl(vv)
    return vv
}

const formatFileSize = (bytes: number): string => {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
}

const unFormatFileSize = (size: string): number => {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const xx: { [key: string]: number } = Object.fromEntries(sufixes.map((x, index) => [x, Math.pow(1024, index)]));
    const [value, unit] = size.split(' ');
    return Number.parseFloat(value) * xx[unit];
}

const getFolderSize = async (user_cookie: string, path: string): Promise<{ size: string; number: number } | undefined> => {
    const list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree' + path))).val();
    if (list == null) return;

    let info = {
        size: 0,
        number: 0
    };

    try {
        await Promise.all(Object.entries(list).map(async ([xx, value]) => {
            if (typeof value === 'object' && value.name) {
                let size: any = decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val());
                if (typeof size === 'string' && size.includes(' ')) size = unFormatFileSize(size);
                info.size += size;
                info.number++;
            } else if (typeof value === 'string' && value !== '0' && mime.getType(value)) {
                let size: any = decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val());
                if (typeof size === 'string' && size.includes(' ')) size = unFormatFileSize(size);
                info.size += size;
                info.number++;
            }
        }));
        return {
            size: formatFileSize(info.size),
            number: info.number
        };
    } catch (error) {
        console.error("Error in getFolderSize:", error);
        return undefined;
    }
}

// 上传函数
const upload = async (file: { name: string; type: string; size: number }, writeDB: any): Promise<string> => {
    const postRtnJson = async (url: RequestInfo, body: any, header: any) => {
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: header,
        });
        return await response.json();
    }

    const info: any = await postRtnJson('https://www.notion.so/api/v3/getUploadFileUrl', {
        "bucket": "secure",
        "name": file.name,
        "contentType": file.type,
        "record": {
            "table": "block",
            "id": notionInfo.id,
            "spaceId": notionInfo.spaceId
        },
        "supportExtraHeaders": true,
        "contentLength": file.size
    }, {
        "content-type": "application/json",
        "cookie": notionInfo.cookie,
    });

    cl(info);
    const header: any = {
        [info.putHeaders[0].name]: info.putHeaders[0].value,
        [info.putHeaders[1].name]: info.putHeaders[1].value
    };

    const size = formatFileSize(file.size);
    // 提取Notion URL中的ID
    function getFileId(url: string): string {
        // 匹配所有的UUID格式字符串（32位或36位，可能包含破折号）
        const matches = url.match(/[a-f0-9-]{32,36}/g);
        if (matches && matches.length >= 2) {
            // 返回第二个匹配项，即我们想要的文件ID
            return matches[1];
        }
        throw new Error("无法从URL中提取文件ID");
    }
    let fileId = getFileId(info.url)
    const files = {
        "source": [[info.url]],
        "title": [[file.name]],
        "size": [[size]]
    };

    writeDB(fileId, files);

    return JSON.stringify({
        url: info.url,
        put: info.signedPutUrl,
        get: info.signedGetUrl,
        header: header
    });
}

// 数据库更新函数
const updateDB = async () => {
    const user_cookie = 'jljiu';
    const data = {
        path: '/中文路径/测试'
    };
    cl(await getFolderSize('jljiu', data.path));
    const bb = data.path.replaceAll('/', `\\`);
    cl(bb);
    const path = 'jsave/users/' + user_cookie + '/folders/' + bb;
    cl(path);
    const users = (await get(ref(db, path))).val();
    cl(users);
}

export { 
    db, 
    cl, 
    mime, 
    uuid4, 
    tempUrl, 
    notionInfo, 
    formatFileSize, 
    unFormatFileSize, 
    getFolderSize, 
    upload, 
    updateDB 
};
