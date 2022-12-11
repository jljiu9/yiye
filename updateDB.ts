// deno-lint-ignore-file
import { db as DB } from "https://deno.land/x/jljiu@v1.0.01/mod.ts";
import { ref, child, get, set } from "https://esm.sh/firebase@9.14.0/database"
import { cl, getFolderSize } from "./init.ts";
const db = DB("https://xxxx-c0c6b-default-rtdb.asia-southeast1.firebasedatabase.app")

let update = async () => {
    let user_cookie = 'jljiu'
    let data = {
        path: '/中文路径/测试'
    }
    cl(await getFolderSize('jljiu',data.path))
    // let bb = data.path.replaceAll('/', `\\`)
    // cl(bb)
    // let path = 'jsave/users/' + user_cookie + '/folders/' + bb
    // cl(path)
    // let users = (await get(ref(db, path))).val()
    // cl(users)
    // Object.keys(users).map(user => {
    //     let folders = users[user]['folders']
    //     if (folders) {
    //         cl(folders)
    //         set(ref(db, 'jsave/share/' + user), users[user]['folders'])
    //     }
    // })
    // await set(ref(db, 'jsave/testsb/' + 'zz'), {
    //     'name': 'jljiu',
    //     'passward': '1122',
    //     'email':null,
    //     tree: {},
    //     files: [],
    //     folder: []
    // })
    // cl((await get(ref(db, 'jsave/testsb/zz'))).val())

    // get(ref(db,'jsave/users/' + user_cookie + '/tree'))
}
// update()

export { db }