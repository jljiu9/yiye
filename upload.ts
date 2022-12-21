// deno-lint-ignore-file
import { notionInfo,cl,formatFileSize, postRtnJson } from "./init.ts";

let upload =async (file: { name: string; type: string; size: number },writeDB:any) => {
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
    let fileId = info.url.match(/(?<=secure.notion-static.com\/)[A-Za-z0-9-]+(?!\/)/)[0]
    let files = {
        "source": [[info.url]],
        "title": [[file.name]],
        "size": [[size]]
    }
    writeDB(fileId,files)
    return xx
}
export {upload}