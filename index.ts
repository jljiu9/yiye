// deno-lint-ignore-file
import { serve, ConnInfo } from "https://deno.land/std@0.155.0/http/server.ts"
import { ref, child, get, set } from "https://esm.sh/firebase@9.14.0/database"
import { cl, tempUrl, mime, uuid4, unFormatFileSize, getFolderSize } from "./init.ts";
import { db } from "./updateDB.ts";
import { upload } from "./upload.ts";

// 复用函数
let writeDB = (path: string, file: object) => {
    set(ref(db, 'jsave/files/' + path), file)
}
let ifUser = async (user: string) => {
    let snapshot = await get(child(ref(db), 'jsave/users/' + user))
    return snapshot.exists()
}
let ifMD5 = async (md5: string) => {
    let snapshot = await get(child(ref(db), 'jsave/files/' + md5))
    return snapshot.exists()
}

let ifFolder = async (user_cookie: string, path: string) => {
    return (await get(ref(db, 'jsave/users/' + user_cookie + '/folders/' + path))).val()
}
let readFile = async (path: string) => {
    const file = await Deno.readFile(path)
    return new Response(file, {
        status: 200,
        headers: {
            "content-type": mime.getType(path) as string,
        },
    })
}

// 服务启动
serve(async (req: Request, connInfo: ConnInfo) => {
    const addr = connInfo.remoteAddr as Deno.NetAddr;
    const ip = addr.hostname;
    console.log(`访问者ip: ${ip}`)
    let { pathname, searchParams } = new URL(req.url)
    let user_cookie: any
    // cl(pathname)

    if (req.method == 'POST') {

        let data = JSON.parse(await req.text())
        // cl(data)
        if (pathname == '/api/resign') {
            if (data.name && data.passward && data.email) {
                let email
                data.email ? email = data.email : email = null
                if (!await ifUser(data.name)) {
                    await set(ref(db, 'jsave/users/' + data.name), {
                        'name': data.name,
                        'passward': data.passward,
                        'email': email,
                        'sex': data.sex
                    })
                    return new Response('新用户！', {
                        status: 200,
                        headers: {
                            'Set-Cookie': 'uname=' + encodeURI(data.name),
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': '*',
                        }
                    })
                }
                let pws = (await get(ref(db, 'jsave/users/' + data.name + '/passward'))).val()
                if (pws == data.passward) {
                    await set(ref(db, 'jsave/users/' + data.name + '/email'), email)
                    return new Response('旧用户！', {
                        status: 200,
                        headers: {
                            'Set-Cookie': 'uname=' + encodeURI(data.name),
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': '*',
                        }
                    })
                }
            }
            return new Response('wrong！', {
                status: 500, headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }
        if (pathname == '/api/login') {
            cl('登入')
            if (data.name && data.passward) {
                if (await ifUser(data.name)) {
                    let pws = (await get(ref(db, 'jsave/users/' + data.name + '/passward'))).val()
                    let email = (await get(ref(db, 'jsave/users/' + data.name + '/email'))).val()
                    if (pws == data.passward) {
                        return new Response(JSON.stringify({
                            name: data.name,
                            email: email
                        }), {
                            status: 200,
                            headers: {
                                'Set-Cookie': 'uname=' + encodeURI(data.name),
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Headers': '*',
                            }
                        })
                    }
                }
            }
            return new Response('wrong！', {
                status: 500, headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }
        // 获取用户名
        try {
            user_cookie = req.headers.get('Cookie')?.split('; ')
            user_cookie = decodeURI(user_cookie.find((x: string) => x.split('=')[0] == 'uname')?.split('=')[1])
        } catch (error) {

        }

        if (pathname == '/api/getUserFiles') {
            cl(pathname)
            let list: any
            if (searchParams.has('usershare') && searchParams.has('ref')) {
                user_cookie = decodeURI(searchParams.get('ref') as string)
                let path = decodeURI(searchParams.get('usershare') as string)
                list = (await get(ref(db, 'jsave/users/' + user_cookie + '/share/' + path))).val()
                if (data.path !== '/') {
                    console.log('data.path', data.path)
                    let path: any = ''
                    Object.keys(list).map(xx => {
                        if (list[xx].type == 'folder') {
                            if (list[xx].path.endsWith((data.path).replaceAll('/', '\\'))) {
                                path = list[xx].path
                            }
                        }
                    })
                    if (path == '\\') {
                        path = data.path
                    } else {
                        path = path.replaceAll('\\', '/')
                        path = path.split('/')
                        path.pop()
                        path = path.join('/')
                        cl(path)
                        path = path + data.path
                    }
                    cl(path)
                    list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree' + path))).val()
                    if (!list) list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree/' + encodeURI(path)))).val()
                    if (!list) {
                        return new Response(JSON.stringify({ wrong: 0, usershare: true }), {
                            status: 200
                        })
                    }
                }
            } else {
                list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree/' + data.path))).val()
                if (!list) list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree/' + encodeURI(data.path)))).val()
                if (!list) {
                    return new Response(JSON.stringify({ wrong: 0 }), {
                        status: 200
                    })
                }
            }

            let vv = Object.keys(list).map(async (xx) => {
                let url = (await get(ref(db, 'jsave/files/' + xx + '/source'))).val()
                if (list[xx].type == 'folder') {
                    cl('分享的文件夹')
                    if (data.path == '/') {
                        data.path = ''
                    } else {
                        data.path = data.path.replaceAll('/', '\\')
                    }
                    if(list[xx].path== '/' && data.path == '') {
                        list[xx].path = '\\'+list[xx].name
                        cl(data.name)
                        cl(list[xx].path)
                    }
                    let f = (await get(ref(db, 'jsave/users/' + user_cookie + '/folders/' + list[xx].path + data.path))).val()
                    console.log('f', f)
                    if (!f) f = (await get(ref(db, 'jsave/users/' + user_cookie + '/folders/' + encodeURI(list[xx].path) + encodeURI(data.path)))).val()
                    console.log('f', f)
                    console.log('list[xx].path', list[xx].path)
                    console.log('list[xx]', list[xx])
                    console.log('path', 'jsave/users/' + user_cookie + '/folders/' + list[xx].path + data.path)
                    if (f && f.size) {
                        return {
                            name: decodeURI(xx),
                            type: 'folder',
                            size: f.size,
                            number: f.number
                        }
                    } else {
                        let folder = await getFolderSize(user_cookie, list[xx].path + data.path)
                        console.log('folder', folder)
                        if (!folder) folder = await getFolderSize(user_cookie, encodeURI(list[xx].path) + encodeURI(data.path))
                        console.log('folder', folder)
                        let folderInfo = {
                            name: decodeURI(xx),
                            type: 'folder',
                            size: folder.size,
                            number: folder.number
                        }
                        set(ref(db, 'jsave/users/' + user_cookie + '/folders/' + list[xx].path), folderInfo)
                        return folderInfo
                    }
                }
                if (typeof (list[xx]) == 'string' && mime.getType(list[xx])) {
                    // console.log('string')
                    let type
                    let mm = mime.getType(list[xx])?.split('/')[0]
                    if (mm !== 'video' && mm !== 'image') {
                        type = 'another'
                    } else {
                        type = mm
                    }
                    return {
                        name: list[xx],
                        file: '/jljiuspeed?md5=' + xx + '&name=' + list[xx],
                        type: type,
                        size: decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val()),
                        md5: xx
                    }
                }
                if (list[xx].time && mime.getType(list[xx].name)) {
                    // console.log('obj')
                    let type
                    let mm = mime.getType(list[xx].name)?.split('/')[0]
                    if (mm !== 'video' && mm !== 'image') {
                        type = 'another'
                    } else {
                        type = mm
                    }
                    if ( list[xx].preview) {
                        if (!list[xx].preview.includes('/jljiuspeed?notionid=')){
                            list[xx].preview = '/jljiuspeed?notionid=' + list[xx].preview + '&name=' + list[xx].name
                        }
                    }else{
                        list[xx].preview  = null
                    }
                    return {
                        name: list[xx].name,
                        file: '/jljiuspeed?md5=' + xx + '&name=' + list[xx].name,
                        preview: list[xx].preview ,
                        // preview: list[xx].preview ? await tempUrl(list[xx].preview, list[xx].name) : null,
                        type: type,
                        size: decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val()),
                        md5: xx,
                        time: list[xx].time
                    }
                } else {
                    cl('问题出现？？')
                    let cc = data.path.replaceAll('/', `\\`)
                    if (cc == '\\') cc = ''
                    let f = (await get(ref(db, 'jsave/users/' + user_cookie + '/folders/' + cc + '\\' + xx))).val()
                    if (!f) f = (await get(ref(db, 'jsave/users/' + user_cookie + '/folders/' + encodeURI(cc) + '\\' + encodeURI(xx)))).val()
                    if (f && f.size) {
                        return {
                            name: decodeURI(xx),
                            type: 'folder',
                            size: f.size,
                            number: f.number
                        }
                    } else {
                        cl('没有计算过文件大小！')
                        let folder = await getFolderSize(user_cookie, decodeURI(data.path) + '/' + decodeURI(xx))
                        cl(decodeURI(data.path) + '/' + decodeURI(xx))
                        cl(folder)
                        if (!folder) folder = await getFolderSize(user_cookie, encodeURI(decodeURI(data.path)) + '/' + encodeURI(decodeURI(xx)))
                        cl(folder)
                        let folderInfo = {
                            name: decodeURI(xx),
                            type: 'folder',
                            size: folder.size,
                            number: folder.number
                        }
                        set(ref(db, 'jsave/users/' + user_cookie + '/folders/' + data.path.replaceAll('/', `\\`) + '\\' + xx), folderInfo)
                        return folderInfo
                    }
                }
            })
            let zz = await Promise.all(vv)
            return new Response(JSON.stringify(zz), {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }

        cl(user_cookie)
        if (!user_cookie) return new Response('请登入！', { status: 500, })
        if (pathname == '/api/upload') {
            return new Response(await upload(data, writeDB), {
                status: 200
            })
        }

        if (pathname.endsWith('/api/checkmd5')) {
            if (!await ifMD5(data.md5)) {
                return new Response(JSON.stringify({ exist: false }), {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                    }
                })
            } else {
                // let path = data.path.replaceAll('\\', `/`)
                await set(ref(db, 'jsave/users/' + user_cookie + '/tree' + data.path + '/' + data.md5), {
                    name: data.name,
                    time: data.time
                })
                await set(ref(db, 'jsave/users/' + user_cookie + '/files/' + data.md5), {
                    name: data.name,
                    time: data.time
                })
                // let info = {
                //     size:0,
                //     number:0
                // }
                // data.paths.map(async x=>{

                // })
                let folder = await getFolderSize(user_cookie, data.path)
                cl(data.path)
                cl(folder)
                await set(ref(db, 'jsave/users/' + user_cookie + '/folders/' + data.path.replaceAll('/', '\\')), {
                    name: data.path.split('/')[data.path.split('/').length - 1],
                    size: folder.size,
                    number: folder.number,
                    type: 'folder',
                    time: data.time
                })
                return new Response(JSON.stringify({ exist: true }), {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                    }
                })
            }
        }
        if (pathname.endsWith('/api/setpreview')) {
            // await set(ref(db, 'jsave/files/' + data.id), null)
            await set(ref(db, 'jsave/users/' + user_cookie + '/tree' + data.path.replaceAll('\\', `/`) + '/' + data.md5 + '/preview'), data.preview)
            await set(ref(db, 'jsave/users/' + user_cookie + '/files/' + data.md5 + '/preview'), data.preview)
            return new Response(JSON.stringify({ preview: true }), {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })

        }
        if (pathname.endsWith('/api/rename')) {
            await set(ref(db, 'jsave/users/' + user_cookie + '/tree' + data.path + '/' + data.md5 + '/name'), data.name)
            await set(ref(db, 'jsave/users/' + user_cookie + '/tree' + data.path + '/' + data.md5 + '/time'), data.time)
            return new Response(JSON.stringify({ rename: true }), {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }
        if (pathname.endsWith('/api/setlove')) {
            await set(ref(db, 'jsave/users/' + user_cookie + '/love/' + data.md5), {
                path: data.path,
                name: data.name,
                preview: data.preview,
                time: data.time
            })
            return new Response(JSON.stringify({ love: true }), {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }
        if (pathname.endsWith('/api/setshare')) {
            let uuid = uuid4()
            data.map(async (data: any) => {
                if (data.type == 'folder') {
                    if (data.path == '/') {
                        // data.path = '\\'
                        cl('zhuxxxxx')
                        cl(data.path)
                    }else{
                        data.path = data.path.replaceAll('/', `\\`) + '\\' + data.name
                        cl(data.path)
                    }
                    await set(ref(db, 'jsave/users/' + user_cookie + '/share/' + uuid + '/' + data.name), {
                        path: data.path,
                        name: data.name,
                        type: 'folder',
                        user: data.user,
                        time: data.time
                    })
                } else {
                    cl(data.preview)
                    await set(ref(db, 'jsave/users/' + user_cookie + '/share/' + uuid + '/' + data.md5), {
                        md5: data.md5,
                        preview: data.preview,
                        path: data.path,
                        name: data.name,
                        type: data.type,
                        user: data.user,
                        time: data.time
                    })
                }
            })
            return new Response(JSON.stringify({ share: true, uuid: uuid }), {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }

        if (pathname.endsWith('/api/setmd5')) {
            if (!await ifMD5(data.md5)) {
                cl('记录md5!')
                let x = (await get(ref(db, 'jsave/files/' + data.id))).val()
                await set(ref(db, 'jsave/files/' + data.md5), x)
                await set(ref(db, 'jsave/files/' + data.md5 + '/notion_id'), data.id)
                await set(ref(db, 'jsave/files/' + data.md5 + '/md5'), data.md5)
                await set(ref(db, 'jsave/files/' + data.id), null)
                await set(ref(db, 'jsave/users/' + user_cookie + '/tree' + data.path.replaceAll('\\', `/`) + '/' + data.md5), {
                    name: data.name,
                    time: data.time
                })
                await set(ref(db, 'jsave/users/' + user_cookie + '/files/' + data.md5), {
                    name: data.name,
                    time: data.time
                })
                cl(data.path)
                let folder = await getFolderSize(user_cookie, data.path.replaceAll('\\', `/`))

                cl(folder)
                await set(ref(db, 'jsave/users/' + user_cookie + '/folders/' + data.path), {
                    name: data.path.split('/')[data.path.split('/').length - 1],
                    size: folder.size,
                    number: folder.number,
                    type: 'folder'
                })

                return new Response(JSON.stringify({ success: 1 }), {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                    }
                })
            } else {
                return new Response(JSON.stringify({ success: 1 }), {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                    }
                })
            }

        }
        return new Response('POST请求！', {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            }
        })
    } else {
        // get请求
        if (pathname.startsWith('/jljiuspeed')) {
            if (searchParams.has('md5') && searchParams.has('name')) {
                let md5 = searchParams.get('md5')
                let name = decodeURI(searchParams.get('name') as string)
                let url = (await get(ref(db, 'jsave/files/' + md5 + '/source'))).val()
                const res = await fetch(await tempUrl(url, name), {
                    headers: {
                        'Connection': "keep-alive",
                        "proxy-connection": "keep-alive",
                        'Range': req.headers.get('Range') as string
                    }
                });
                return new Response(res.body, {
                    status: res.status,
                    headers: res.headers,
                });
            }
            if (searchParams.has('notionid') && searchParams.has('name')) {
                let notionid = searchParams.get('notionid')
                let name = decodeURI(searchParams.get('name') as string)
                const res = await fetch(await tempUrl(notionid, name), {
                    headers: {
                        'Connection': "keep-alive",
                        "proxy-connection": "keep-alive",
                        'Range': req.headers.get('Range') as string
                    }
                });
                return new Response(res.body, {
                    status: res.status,
                    headers: res.headers,
                });
            } else {
                return new Response(`<b>请输入 一叶|枫☁ 的正确加速地址</b>`, {
                    headers: { "content-type": "text/html" },
                });
            }
        }
        if (pathname == "/") {
            cl('访问主页！')
            return readFile("./index.html")
        }
        if (pathname.startsWith('/assets')) {
            cl(pathname)
            return readFile('.' + pathname)
        }
        else {
            return readFile("./index.html")
        }
        if (pathname == '/yiye_usershare') {
            cl('访问主页！')
            return readFile("src/index.html")
        } else {
            cl(pathname)
            return new Response('get请求！', {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }
    }
}, { port: 3000 })
