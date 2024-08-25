import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";

// 初始化Notion客户端
const notion = new Client({
  auth: 'secret_t27pXy8SLiNVjPfsAdYd2iOKVEHX6Na1Een21GfHxQ3', // 使用提供的API密钥
});

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
    return await getRtnRedirect(xx.href, {
        "cookie": notionInfo.cookie
    });
}


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
// function extractNotionId(url: string): string {
//     const matches = url.match(/[a-f\d]{32}/g);
//     if (matches && matches.length >= 2) {
//         const id = matches[1];
//         return id.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
//     }
//     throw new Error("无法从URL中提取第二个Notion ID");
// }

// 从URL中提取ID
const id1 = getFileId("https://www.notion.so/jljiu/8199c22e4ace4883bfb4691f8a2f0cc2?pvs=4#a233d70993564356aeb0851cdad46f99");
const id2 = getFileId("https://www.notion.so/jljiu/8199c22e4ace4883bfb4691f8a2f0cc2?pvs=4#5680aece2ce8440fa2ab97198a598aae");

console.log("ID 1:", id1);
console.log("ID 2:", id2);

// Notion相关信息
const notionInfo = {
    id: '5680aece-2ce8-440f-a2ab-97198a598aae',
    spaceId: '993c3a7f-e1f7-4342-974a-f8abf65c40d7',
    userId: 'db17c83b-afcf-46e4-a5a8-ce99f167c637',
    cookie: 'logglytrackingsession=1abcc622-b80e-425b-bd5e-77654841eb20; notion_experiment_device_id=be5d61a3-d85b-47bd-adca-b9c7880abe34; notion_browser_id=7919159a-b642-4ae9-a42c-3015b53e04c5; cb_user_id=null; cb_group_id=null; _ga=GA1.1.932389555.1664288357; _mkto_trk=id:414-XMY-838&token:_mch-www.notion.so-1664288356716-48733; intercom-device-id-gpfdrxfd=c78c58f2-e474-40f4-bff2-70fe6b46e674; tatari-cookie-test=25854168; intercom-id-gpfdrxfd=a21f227d-e325-4dc9-b2ab-6daaa178a506; cb_anonymous_id=%2208a09ba8-3e45-4890-ba05-ec7dcd617ec4%22; _cioid=db17c83bafcf46e4a5a8ce99f167c637; device_id=b3f16c18-a3b4-4ad8-8b57-3c94663788e9; _hjSessionUser_3664679=eyJpZCI6IjcwMGU0NDUxLTU4OWUtNTY4Yy04ODE0LWQwN2FkYmE2NTdlOSIsImNyZWF0ZWQiOjE3MDcyODIyMTI1MzIsImV4aXN0aW5nIjp0cnVlfQ==; tatari-session-cookie=0bddfb41-9cc9-b5aa-a403-0a8a857a4a6f; _uetvid=0eb54c3044f611ee8ce80b2316718ae4|g9zjm9|1707310268896|3|1|bat.bing.com/p/insights/c/o; _gcl_au=1.1.780540888.1724168009; token_v2=v02%3Auser_token_or_cookies%3AeOaVJPO-J5wsIdHp25CyqkrFCn1pG2aK1gVP-_Ens3rWrJzqQmmfdM2SIDO_2JUNPuFJqOR6HHNHHNc5nbZ1b6FWt4qrOYNroSTpn4jYjMsvSNjcRZ9_ccviLCR5sqAfcjOV; notion_user_id=db17c83b-afcf-46e4-a5a8-ce99f167c637; notion_cookie_consent={%22id%22:%2248222933-2b88-440d-a68f-2340c022bb48%22%2C%22permission%22:{%22necessary%22:true%2C%22targeting%22:true%2C%22preference%22:true%2C%22performance%22:true}%2C%22policy_version%22:%22v5%22}; notion_users=[%22db17c83b-afcf-46e4-a5a8-ce99f167c637%22]; NEXT_LOCALE=en-US; _hjSession_3664679=eyJpZCI6ImRkNGMyMWQ2LWIyMDUtNDE0Ny1hM2U1LWRlZTYzZTU3ZGQ4YSIsImMiOjE3MjQ1MTM1MjY1NTEsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MX0=; notion_check_cookie_consent=false; notion_locale=en-US/user_choice; _ga_9ZJ8CB186L=GS1.1.1724519124.34.1.1724519995.49.0.0; _rdt_uuid=1724168009352.7569b69a-7a77-4dce-8505-061248d1b6a4; __cf_bm=Jnra54ortr8TCzMQADFEf6n9IL3DwfxNDYdMGeAXalI-1724522158-1.0.1.1-jffTa8K9cHysZKDItYqvK4GY21rrqOxPqs_h4cj8bfCBhVzMx4bL5MYv6hQnPpB95tXlqAQQucQBLAy6.hcddA; _cfuvid=eoCJjlH.ZnkGGDOkcuUywWc9hHYp__j07YDmCccRnVQ-1724522158219-0.0.1.1-604800000; amp_af43d4=7919159ab6424ae9a42c3015b53e04c5.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1i62g885d.1i62ofu5v.h39.3td.l0m', // 请替换为您的Notion cookie
};

// 辅助函数
const cl = (x: any): any => {
    console.log(x);
    return x;
}

const formatFileSize = (bytes: number): string => {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
}

// 上传函数
const upload = async (file: { name: string; type: string; size: number }): Promise<string> => {
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
    cl(header)
    const size = formatFileSize(file.size);
    

    // // 创建图片块
    // try {
    //     await notion.blocks.children.append({
    //         block_id: notionInfo.id,
    //         children: [
    //             {
    //                 object: 'block',
    //                 type: 'image',
    //                 image: {
    //                     type: 'external',
    //                     external: {
    //                         url: info.signedGetUrl
    //                     }
    //                 }
    //             }
    //         ]
    //     });
    // } catch (error) {
    //     console.error("Error creating image block:", error);
    //     throw error;
    // }
    // 创建文件块
    try {
        await notion.blocks.children.append({
            block_id: notionInfo.id,
            children: [
                {
                    object: 'block',
                    type: 'file',
                    file: {
                        type: 'external',
                        external: {
                            url: info.signedGetUrl
                        }
                    }
                }
            ]
        });
    } catch (error) {
        console.error("Error creating file block:", error);
        throw error;
    }
    // // 创建页面块函数
    // async function createPageBlock(parentId: string, title: string): Promise<string> {
    //     try {
    //         const response = await notion.blocks.children.append({
    //             block_id: parentId,
    //             children: [
    //                 {
    //                     object: 'block',
    //                     type: 'child_page',
    //                     child_page: {
    //                         title: title
    //                     }
    //                 }
    //             ]
    //         });

    //         if (response.results && response.results.length > 0) {
    //             const newPageId = response.results[0].id;
    //             console.log(`New page created with ID: ${newPageId}`);
    //             return newPageId;
    //         } else {
    //             throw new Error("Failed to create page block");
    //         }
    //     } catch (error) {
    //         console.error("Error creating page block:", error);
    //         throw error;
    //     }
    // }

    // // 测试创建页面块
    // async function testCreatePageBlock() {
    //     const parentId = 'your-parent-page-id-here'; // 替换为您想要创建新页面的父页面ID
    //     const title = 'New Test Page';

    //     try {
    //         const newPageId = await createPageBlock(parentId, title);
    //         console.log(`Successfully created new page with ID: ${newPageId}`);
    //     } catch (error) {
    //         console.error("Failed to create page block:", error);
    //     }
    // }

    // // 运行测试
    // // testCreatePageBlock();

    return JSON.stringify({
        url: info.url,
        put: info.signedPutUrl,
        getSignedUrl: info.signedGetUrl,
        getTempUrl: await tempUrl(info.url,file.name),
        header: header,
        fileId: await getFileId(info.url),
        size: size
    });
}


// 测试上传功能
const testUpload = async () => {
    const testFile = {
        name: "test.txt",
        type: "text/plain",
        size: 1024 // 1KB
    };

    try {
        const result = await upload(testFile);
        console.log("Upload result:", result);
    } catch (error) {
        console.error("Upload test failed:", error);
    }
}

// 运行测试
// testUpload();


export { upload, getFileId };
