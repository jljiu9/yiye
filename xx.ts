import { cl, formatFileSize, wait } from "./init.ts";
import { pikpak } from "./pikpak.ts";
import { ref, child, get, set } from "https://esm.sh/firebase@9.14.0/database"
import { db } from "./updateDB.ts";

let doit = async () => {
    // await pikpak.login('jar-addition-13@inboxkitten.com', '3w112233')
    let pk = await pikpak('')
    // cl(pk)
    pk = await pikpak.refresh(pk)

    cl(await pikpak.me(pk))
    // cl(await pikpak.getFileInfo('VNJ_Gx-FnLT1LZXvrngT6uGCo1'))
    // cl(await pikpak.download('VNJ_Gx-FnLT1LZXvrngT6uGCo1'))

    // cl(await pikpak.newFolder(await pikpak.refresh(await pikpak('')),(new Date()).getTime().toString()))

    // cl((await pikpak.getFolderList(await pikpak(''),'')))




    // cl(path2id)
    // cl(id2path)

    // cl(zz)


    // await pikpak.bt("magnet:?xt=urn:btih:51577f2ee42cf05779cad1dfd088ab77ace0a5cc")
    // await pikpak.invite()
    // await pikpak.getmail('jar-addition-13')
    // await pikpak.signup('jar-addition-13')

}
doit()



// if (searchParams.has('bthash') && searchParams.has('btid') && searchParams.has('btue')) { //btue:useremail
//     let bthash = searchParams.get('bthash')
//     let btid = searchParams.get('btid')
//     let btue = searchParams.get('btue')
//     // let temp = (await get(ref(db, 'jsave/bt/hashlist/' + bthash + '/id2path/' + btid + '/file'))).val()
//     // // return Response.redirect(temp)
//     // cl('temp:' + temp)
//     // cl(req.headers.get('Range'))
//     // // let {} = new URL(temp)
//     // let headers: any = {
//     //     'Connection': "keep-alive",
//     //     // 'Content-Type': 'application/octet-stream',
//     //     // "proxy-connection": "keep-alive",
//     //     // 'Range': range as string,
//     //     // "accept": "*/*",
//     //     // "cache-control": "no-cache",
//     //     // "pragma": "no-cache",
//     //     // "Host": "dl-a10b-0481.mypikpak.com",
//     //     // "sec-ch-ua-platform": "Windows",
//     //     // "sec-fetch-mode": "no-cors",
//     //     // "Sec-Fetch-Dest": "video",
//     //     // 'Cookie': 'deviceid=wdi10.e15ba01f870d48ac85d7745f440abaccxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; xl_fp_rt=1671441312032; allow_analysis=true; _gid=GA1.2.1303771502.1671507363; PPA_CI=c423a5a63e0c5b3323c6173d2e7ad52d; _ga=GA1.2.1619007689.1671507358; _ga_0318ZPR14J=GS1.1.1671620692.7.1.1671620787.0.0.0',
//     //     // "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
//     // }
//     // let range
//     // if (req.headers.get('Range')) {
//     //     range = req.headers.get('Range')
//     //     cl("range:" + range)
//     //     headers['Range'] = range
//     // }
//     // //  else {
//     // //     range = 'bytes=0-'
//     // // }
//     // // cl(range)
//     // cl(headers)
//     // let res = await fetch(temp, {
//     //     headers: headers
//     // });
//     // if (res.status !== 206) {
//     //     if (res.status == 200) {
//     //         return new Response(res.body, {
//     //             status: res.status,
//     //             headers: res.headers,
//     //         });
//     //     }
//     //     // let email = btue?.replaceAll('-email-','@' ).replaceAll('-dot-', '.')
//     //     // cl(email)


//     // }
//     let pk = await pikpak(btue as string)
//     // cl(pk)
//     pk = await pikpak.refresh(pk)
//     let xxxx = (await pikpak.getFileInfo(pk, btid as string))
//     let url
//     if (xxxx.medias) {
//         url = xxxx.medias[0].link.url
//         cl('视频！')
//     } else {
//         url = xxxx.links["application/octet-stream"].url
//     }
//     cl(url)
//     // return Response.redirect(url)
//     // await set(ref(db, 'jsave/bt/hashlist/' + bthash + '/id2path/' + btid + '/file'), url)
//     let res = await fetch(url, {
//         headers: {
//             "cache-control": "no-cache",
//             "pragma": "no-cache",
//             // 'Connection': "keep-alive",
//             // "proxy-connection": "keep-alive",
//             'Range': req.headers.get('Range') as string,
//             'Cookie': 'deviceid=wdi10.e15ba01f870d48ac85d7745f440abaccxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; xl_fp_rt=1671441312032; allow_analysis=true; _gid=GA1.2.1303771502.1671507363; PPA_CI=c423a5a63e0c5b3323c6173d2e7ad52d; _ga=GA1.2.1619007689.1671507358; _ga_0318ZPR14J=GS1.1.1671620692.7.1.1671620787.0.0.0'
//         }
//     });
//     cl(res.headers)
//     cl(res.status)
//     return new Response(res.body, {
//         status: res.status,
//         headers: res.headers,
//     });
// }