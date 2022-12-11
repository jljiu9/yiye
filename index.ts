// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.155.0/http/server.ts"
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
ref(db,)
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
serve(async (req: Request) => {
    let { pathname } = new URL(req.url)
    let user_cookie: any
    // cl(pathname)
    // return new Response('xxx', { status: 200 ,headers:{
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Headers': '*',
    // }})
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
            cl('>>')
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
        user_cookie = req.headers.get('Cookie')?.split('; ')
        user_cookie = decodeURI(user_cookie.find((x: string) => x.split('=')[0] == 'uname')?.split('=')[1])
        // user_cookie = '中文名'
        cl(user_cookie)
        if (!user_cookie) return new Response('请登入！', { status: 500, })
        if (pathname == '/api/upload') {
            return new Response(await upload(data, writeDB), {
                status: 200, headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                }
            })
        }
        // cl(pathname)
        if (pathname == '/api/getUserFiles') {
            cl(pathname)
            let list:any
            list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree/' + data.path))).val()
            if(!list) list = (await get(ref(db, 'jsave/users/' + user_cookie + '/tree/' + encodeURI(data.path)))).val()
            if (!list) {
                return new Response(JSON.stringify({ wrong: 0 }), {
                    status: 200, headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                    }
                })
            }
            let vv = Object.keys(list).map(async (xx) => {
                let url = (await get(ref(db, 'jsave/files/' + xx + '/source'))).val()

                if (typeof (list[xx]) == 'string' && mime.getType(list[xx])) {
                    console.log('string')
                    let type
                    let mm = mime.getType(list[xx])?.split('/')[0]
                    if (mm !== 'video' && mm !== 'image') {
                        type = 'another'
                    } else {
                        type = mm
                    }
                    return {
                        name: list[xx],
                        file: await tempUrl(url, list[xx]),
                        type: type,
                        size: decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val()),
                        md5: xx
                    }
                }
                if (list[xx].time && mime.getType(list[xx].name)) {
                    console.log('obj')
                    let type
                    let mm = mime.getType(list[xx].name)?.split('/')[0]
                    if (mm !== 'video' && mm !== 'image') {
                        type = 'another'
                    } else {
                        type = mm
                    }
                    return {
                        name: list[xx].name,
                        file: await tempUrl(url, list[xx].name),
                        preview: list[xx].preview ? await tempUrl(list[xx].preview, list[xx].name) : null,
                        type: type,
                        size: decodeURI((await get(ref(db, 'jsave/files/' + xx + '/size'))).val()),
                        md5: xx,
                        time:list[xx].time
                    }
                } else {
                    let f = (await get(ref(db, 'jsave/users/' + user_cookie + '/folders/' + data.path.replaceAll('/', `\\`) + '\\' + xx))).val()
                    console.log('jsave/users/' + user_cookie + '/folders/' + data.path.replaceAll('/', `\\`) + '\\' + xx)
                    console.log(f)
                    if (f && f.size) {
                        return {
                            name: decodeURI(xx),
                            type: 'folder',
                            size: f.size,
                            number: f.number
                        }
                    } else {
                        cl('没有计算过文件大小！')
                        cl(decodeURI(data.path)+ '/' + decodeURI(xx))
                        let folder = await getFolderSize(user_cookie, decodeURI(data.path)+ '/' + decodeURI(xx))
                        let folderInfo = {
                            name: decodeURI(xx),
                            type: 'folder',
                            size: folder.size,
                            number: folder.number
                        }
                        await set(ref(db, 'jsave/users/' + user_cookie + '/folders/' + data.path.replaceAll('/', `\\`) + '\\' + xx), folderInfo)
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
                    name:data.name,
                    time:data.time
                })
                await set(ref(db, 'jsave/users/' + user_cookie + '/files/' + data.md5), {
                    name:data.name,
                    time:data.time
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
                await set(ref(db, 'jsave/users/' + user_cookie + '/folders/' + data.path.replaceAll('/','\\')), {
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
            await set(ref(db, 'jsave/users/' + user_cookie + '/tree' + data.path.replaceAll('\\', `/`) + '/' + data.md5+'/preview'), data.preview)
            await set(ref(db, 'jsave/users/' + user_cookie + '/files/' + data.md5+'/preview'), data.preview)
            return new Response(JSON.stringify({ preview: true }), {
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
                preview: data.preview
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
                    await set(ref(db, 'jsave/users/' + user_cookie + '/share/' + uuid + '/' + data.name), {
                        path: data.path,
                        name: data.name,
                        type: 'folder',
                        user: data.user
                    })
                } else {
                    await set(ref(db, 'jsave/users/' + user_cookie + '/share/' + uuid + '/' + data.md5), {
                        md5: data.md5,
                        path: data.path,
                        name: data.name,
                        type: data.type,
                        user: data.user
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
                    name:data.name,
                    time:data.time
                })
                await set(ref(db, 'jsave/users/' + user_cookie + '/files/' + data.md5), {
                    name:data.name,
                    time:data.time
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
        // cl(pathname)
        if (pathname == "/") {
            cl('访问主页！')
            return readFile("index.html")
        }
        if (pathname.startsWith('/assets')) {
            cl(pathname)
            return readFile(pathname)
        }
        else{
            return readFile("index.html")
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
