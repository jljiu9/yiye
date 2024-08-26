// deno-lint-ignore-file
import { notionInfo,cl,formatFileSize } from "./init.ts";

let upload =async (file: { name: string; type: string; size: number },writeDB:any) => {
    let postRtnJson = async (url: RequestInfo, body: any, header: any) => {
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: header,
        });
        let json = await response.json();
        return json
    }
    let info:any = await postRtnJson('https://www.notion.so/api/v3/getUploadFileUrl', {
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
    })
    cl(info)
    let header:any = {}
    header[`${info.putHeaders[0].name}`] = info.putHeaders[0].value
    header[`${info.putHeaders[1].name}`] = info.putHeaders[1].value
    let size = formatFileSize(file.size)
    let xx = JSON.stringify({
        url: info.url,
        put: info.signedPutUrl,
        get: info.signedGetUrl,
        header: header
    })
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
    let files = {
        "source": [[info.url]],
        "title": [[file.name]],
        "size": [[size]]
    }
    writeDB(fileId,files)
    return xx
}
export {upload}