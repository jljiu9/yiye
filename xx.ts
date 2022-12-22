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