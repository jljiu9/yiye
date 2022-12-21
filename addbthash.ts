import { cl, formatFileSize, wait } from "./init.ts";
import { pikpak } from "./pikpak.ts";
import { ref, child, get, set } from "https://esm.sh/firebase@9.14.0/database"
import { db } from "./updateDB.ts";

// let bt = "magnet:?xt=urn:btih:6b94fe38ba4dfc669dedaae45e766b359685215d&tr=http%3a%2f%2ft.nyaatracker.com%2fannounce&tr=http%3a%2f%2ftracker.kamigami.org%3a2710%2fannounce&tr=http%3a%2f%2fshare.camoe.cn%3a8080%2fannounce&tr=http%3a%2f%2fopentracker.acgnx.se%2fannounce&tr=http%3a%2f%2fanidex.moe%3a6969%2fannounce&tr=http%3a%2f%2ft.acg.rip%3a6699%2fannounce&tr=https%3a%2f%2ftr.bangumi.moe%3a9696%2fannounce&tr=udp%3a%2f%2ftr.bangumi.moe%3a6969%2fannounce&tr=http%3a%2f%2fopen.acgtracker.com%3a1096%2fannounce&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce"
// let bt = "magnet:?xt=urn:btih:BE63BF0F2B1686248DC5D33DF1C620F23E54CFF1"
// let bt = "magnet:?xt=urn:btih:c5885441b3d35dc23450eb22fc7ed803645d72fe"
let addbthash = async (bt: string, refresh?: boolean) => {
    let hash = (bt.match(/[A-Za-z0-9]{26,}/) as any)[0].toUpperCase()
    let torf = (await get(ref(db, 'jsave/bt/hashlist/' + hash)))
    if (!refresh && torf.exists()) {
        cl('磁力文件存在:'+hash)
        let info = torf.val()
        return info.path2id
    }
    let pk = await pikpak.refresh(await pikpak(''))
    let timestamp = (new Date()).getTime().toString()
    let id = await pikpak.newFolder(pk, timestamp)
    let res = await pikpak.bt(pk, bt, id)

    let bthash: any = {}
    let replace = [".mp4",".jpg",".", "#", "$", "[", "]"]
    let name = res.task.name
    replace.map(x => {
        name = name.replaceAll(x, '')
    })
    bthash = {
        path2id: {},
        id2path: {},
        user: pk.username,
        id: id,
        foldername: timestamp,
        name: name,
        size: formatFileSize(res.task.file_size)
    }
    let finf = async (f: string, name: string) => {
        let folder = (await pikpak.getFolderList(pk, f)).files
        let info: any = {}
        let xx = folder.map(async (x: any) => {
            if (x.kind.split('#')[1] == 'folder') {
                x.user = pk.username
                x.kind = 'folder'
                x.file = null
                bthash.id2path[x.id] = name + '/' + x.name
                await set(ref(db, 'jsave/bt/hashlist/' + hash + '/id2path/' + x.id), name + '/' + x.name)
                await finf(x.id, name + '/' + x.name)
            } else {
                x.user = pk.username
                x.kind = x.mime_type.split('/')[0]
                bthash.id2path[x.id] = {
                    name: x.name,
                    thumb: x.thumbnail_link,
                    file: (await pikpak.getFileInfo(pk, x.id)).links["application/octet-stream"].url
                }
                x.file = '/jljiuspeed?bthash=' + hash + '&btid=' + x.id + '&btue=' + pk.username.replaceAll('@', '-email-').replaceAll('.', '-dot-')
            }
            info[x.id] = {
                name: x.name,
                size: formatFileSize(x.size),
                type: x.kind,
                number: 0,
                preview:'/jljiuspeed?bthash=' + hash + '&btid=' + x.id+'&btpreview=',
                id: x.id,
                file: x.file,
                user: x.user,
                hash: hash
            }
            return info[x.id]
        })
        let zz = await Promise.all(xx)
        if (name == '') {
            bthash.path2id['\\'] = zz
        } else {
            let replace = [".", "#", "$", "[", "]"]
            replace.map(x => {
                name = name.replaceAll(x, '')
            })
            bthash.path2id[name.replaceAll('/', '\\')] = zz
        }
        return zz
    }
    await wait(3000)
    bthash.id2path[id] = res.task.name
    bthash.path2id['type'] = 'btfolder'
    bthash.path2id['btname'] = res.task.name
    bthash.path2id['pathname'] = name
    bthash.path2id['btsize'] = formatFileSize(res.task.file_size)
    bthash.path2id['btuser'] = pk.username
    bthash.path2id['bthash'] = hash
    await finf(id, '')
    await set(ref(db, 'jsave/bt/hashlist/' + hash), bthash)
    cl('成功获取磁力信息:'+hash)
    return bthash.path2id
}
// addbthash(bt)

export { addbthash}