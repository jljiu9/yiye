// deno-lint-ignore-file
import { notionInfo,cl,formatFileSize } from "./init.ts";
let upcookie = 'notion_browser_id=78858b26-5225-4683-b738-700aee33c549; _gcl_au=1.1.1181184356.1688613309; _ga=GA1.1.18262015.1688613309; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%221ddf90de-4e0b-4636-8e1b-dd71ac64acfe%22; intercom-id-gpfdrxfd=0718f586-3316-42de-9d9b-8c8cf9ca5fc8; intercom-device-id-gpfdrxfd=ab73f8b2-95f8-443d-bc63-6c18b2ebbe46; NEXT_LOCALE=en-US; notion_experiment_device_id=b2cPg_2gSfur4VWobrhCA; token_v2=v02%3Auser_token_or_cookies%3Ayv5uXZaKaZ1ITWTczmrGlQBlLEy9X9QCgJ7qJFSNRgphoxN85Iny7FMUS9liYghq-EReFxU_7zcScCWlO0GdFADk1Xhf_U-MLR3O9MGNLK5587rU0oejlT_3ib8newNW_4BK; notion_user_id=db17c83b-afcf-46e4-a5a8-ce99f167c637; _cioid=db17c83bafcf46e4a5a8ce99f167c637; notion_cookie_consent={%22id%22:%2248222933-2b88-440d-a68f-2340c022bb48%22%2C%22permission%22:{%22necessary%22:true%2C%22targeting%22:true%2C%22preference%22:true%2C%22performance%22:true}%2C%22policy_version%22:%22v5%22}; notion_users=[%22db17c83b-afcf-46e4-a5a8-ce99f167c637%22]; _tt_enable_cookie=1; _ttp=3ef7fg4ar8sQSlIzag5tOlrKQkQ; _rdt_uuid=1692237238873.da086751-4e27-4af3-9d14-c230957d589c; notion_locale=en-US/autodetect; notion_check_cookie_consent=false; __cf_bm=tAst_z3aip3sFFGct5cAbsUw7IemB55_dmGCrKfVbbk-1694081988-0-Af3Hg0cjOQNl2fHEzMcuO+O8Xbqwj+5oz94sbt2X+54ItTFYW7x75hqmCG03MU0B+oaC0YScBgmiHcF4s3dFknY=; _cfuvid=yl4v3UBZSX8PLF8dl4iJrcr37sthBKkYDQfQu1AJYHc-1694081988711-0-604800000; _ga_9ZJ8CB186L=GS1.1.1694081985.50.0.1694081985.60.0.0; _uetsid=2c7001a04c5a11eea417cffafc2a1a06|1rbbk4a|2|fet|0|1344; t-ip=1; tatari-session-cookie=cb6cc960-1981-4e53-8a42-ae54d75afdfb; _uetvid=ee4befd03ca011eea4cbc3978698adfd|13gwvw4|1694081990487|1|1|bat.bing.com/p/insights/c/z; intercom-session-gpfdrxfd=LzFMUE9QblRsdE1zcUNKN0hEblJtcWl0Snp3eW5yVFdTL1pDcnEwelZudlNxbnNLaFc0N2ZQM0FuYThaL3g5ai0tRmZQTlBvOE9YTnBqVnFiT1psYzFMZz09--0b47ac8049f9808ea284bb45b612df872c6ad8a3; amp_af43d4=78858b2652254683b738700aee33c549.ZGIxN2M4M2JhZmNmNDZlNGE1YThjZTk5ZjE2N2M2Mzc=..1h9nifcmg.1h9nigrin.1jr.dt.21o; AWSALBTG=h2qFf3RxMOQUWFO/eD2mFaY5jd/wFaQ2rWzEc205Qfb7Xkaej1tgdgWBQUUfobNrWoKguydu6AHHmpFp0GJ72xRe6pOicc0rYKZv+2ScG+LFg1POwD4tHjeZVtbzIScIp/kOYYqA/GP9fpOv1f0UfoBRIi9b4xIoKP9SWduJqpFI; AWSALBTGCORS=h2qFf3RxMOQUWFO/eD2mFaY5jd/wFaQ2rWzEc205Qfb7Xkaej1tgdgWBQUUfobNrWoKguydu6AHHmpFp0GJ72xRe6pOicc0rYKZv+2ScG+LFg1POwD4tHjeZVtbzIScIp/kOYYqA/GP9fpOv1f0UfoBRIi9b4xIoKP9SWduJqpFI'
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
        "notion-audit-log-platform": "web",
        "notion-client-version": "23.12.0.201",
        "x-notion-active-user-header": "db17c83b-afcf-46e4-a5a8-ce99f167c637",
        "cookie": upcookie,
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
