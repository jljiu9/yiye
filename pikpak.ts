import { cl, getRtnJson, postRtnJson, wait } from "./init.ts";
import { db } from "./updateDB.ts";
import { ref, child, get, set } from "https://esm.sh/firebase@9.14.0/database"

const pikpak = async (user?: string) => {
    if (!user) {
        user = 'current'
    }
    let snapshot = await get(child(ref(db), 'jsave/bt/users/' + user))
    if (snapshot.exists()) {
        // pk = snapshot.val()
        return snapshot.val()
    } else {
        return {
            "client_id": "YUMx5nI8ZU8Ap8pm",
            "device_id": "ac7f9dabcfe44822859670f2806ba6b3"
        }
    }
}
// pk = {
//     access_token:'',
//     client_id:'',
//     device_id:'',
//     user_id:'',
//     captcha_token:'',
//     password:'',
//     username:'',
//     refresh_token:''
// }

/**
 * @return client_id
 */
pikpak.client = async (pk: any) => await getRtnJson('https://user.mypikpak.com/v1/auth/token/introspect?token=' + pk.access_token.replace('Bearer ', ''))

/**
 * @description: 获取ip
 */
pikpak.ip = async (pk: any) => await getRtnJson('https://api-drive.mypikpak.com/drive/v1/privilege/area_country_code', {
    "x-client-id": pk.client_id,
    "x-device-id": pk.device_id,
})
/**
 * @description: 登入前的init，要获取captcha_token
 */
pikpak.init = async (pk: any, email: string, action: string, captcha_token?: string) => {
    let token = await postRtnJson("https://user.mypikpak.com/v1/shield/captcha/init", {
        "device_id": pk.device_id,
        // "captcha_token": captcha_token,
        "client_id": pk.client_id,
        "action": action,
        "meta": {
            "email": email
        }
    })
    return token.captcha_token
}
/**
 * @description: 每次请求发送的凭证
 */
pikpak.cookie = (pk: any, token: string) => {
    return {
        "content-type": "application/json",
        "authorization": pk.access_token,
        "x-captcha-token": token,
        "x-client-id": pk.client_id,
        "x-device-id": pk.device_id
    }
}
/**
 * @description: 签名
 */
pikpak.meta = (pk: any) => {
    return {
        "captcha_sign": "1.7fce7dc403c95822b8f3dcd2be1af7f3",
        "client_version": "1.0.0",
        "package_name": "mypikpak.com",
        "user_id": pk.user_id,
        "timestamp": "1670817819526"
    }
}
pikpak.getFileInfo = async (pk: any, fileID: string) => {
    let token = await pikpak.init_files(pk)
    let res = await getRtnJson(`https://api-drive.mypikpak.com/drive/v1/files/${fileID}?`, pikpak.cookie(pk, token));
    return res
}
pikpak.me = async (pk: any) => {
    let token = await pikpak.init_files(pk)
    let res = await getRtnJson(`https://user.mypikpak.com/v1/user/me`, pikpak.cookie(pk, token));
    return res
}
pikpak.getFolderList = async (pk: any, folderID: string) => {
    let token = await pikpak.init_files(pk)
    let res = await getRtnJson(`https://api-drive.mypikpak.com/drive/v1/files?thumbnail_size=SIZE_MEDIUM&limit=100&parent_id=${folderID}&with_audit=true&filters={"trashed":{"eq":false},"phase":{"eq":"PHASE_TYPE_COMPLETE"}}`,
        pikpak.cookie(pk, token));
    return res
}
pikpak.bt = async (pk: any, bt: string, parent?: string) => {
    let token = await pikpak.init_post_files(pk)
    let res = await postRtnJson("https://api-drive.mypikpak.com/drive/v1/files", {
        "kind": "drive#file",
        "parent_id": parent ? parent : '',
        "upload_type": "UPLOAD_TYPE_URL",
        "url": { "url": bt }
    }, pikpak.cookie(pk, token))
    return res
}
pikpak.newFolder = async (pk: any, name: string) => {
    let token = await pikpak.init_post_files(pk)
    let res = await postRtnJson("https://api-drive.mypikpak.com/drive/v1/files", {
        "kind": "drive#folder",
        "parent_id": "",
        "name": name
    }, pikpak.cookie(pk, token))
    return res.file.id
}
pikpak.init_files = async (pk: any) => {
    let token = await postRtnJson("https://user.mypikpak.com/v1/shield/captcha/init", {
        "client_id": pk.client_id,
        "action": "GET:/drive/v1/files",
        "device_id": pk.device_id,
        "captcha_token": pk.captcha_token,
        "meta": pikpak.meta(pk)
    })
    return token.captcha_token
}
pikpak.init_post_files = async (pk: any) => {
    let token = await postRtnJson("https://user.mypikpak.com/v1/shield/captcha/init", {
        "action": "POST:/drive/v1/files",
        "captcha_token": pk.captcha_token,
        "client_id": pk.client_id,
        "device_id": pk.device_id,
        "meta": pikpak.meta(pk)
    })
    return token.captcha_token
}
pikpak.invite = async (pk: any) => {
    let token = await pikpak.init_post_invite(pk)
    let res = await postRtnJson("https://api-drive.mypikpak.com/vip/v1/activity/invite", {
        "from": "web"
    }, pikpak.cookie(pk, token))
    return res
}
pikpak.init_post_invite = async (pk: any) => {
    let token = await postRtnJson("https://user.mypikpak.com/v1/shield/captcha/init", {
        "action": "POST:/vip/v1/activity/invite",
        "captcha_token": pk.captcha_token,
        "client_id": pk.client_id,
        "device_id": pk.device_id,
        "meta": pikpak.meta(pk)
    })
    return token.captcha_token
}

pikpak.getmail = async (name: string) => {
    let maillist = await getRtnJson(`https://inboxkitten.com/api/v1/mail/list?recipient=${name}`)
    let { region, key } = maillist[0]['storage']
    let mail = await fetch(`https://inboxkitten.com/api/v1/mail/getHtml?mailKey=storage-${region}-${key}`)
    let code: any = (await mail.text()).match(/(?<=\>)[0-9]{6}(?=\<)/)
    return cl(code[0])
}

pikpak.signup = async (pk: any, username: string) => {
    let email = username + '@inboxkitten.com'
    let captcha_token = await pikpak.init(pk, email, "POST:/v1/auth/verification")
    let xx = await postRtnJson('https://user.mypikpak.com/v1/auth/verification', {
        "email": email,
        "target": "ANY",
        "usage": "REGISTER",
        "locale": "zh-CN",
        "client_id": "YUMx5nI8ZU8Ap8pm"
    }, {
        "content-type": "application/json",
        "x-captcha-token": captcha_token,
        "x-device-id": pk.device_id,
        "x-client-id": "YUMx5nI8ZU8Ap8pm"
    })
    cl(xx)
    await wait(3000)
    let code = await pikpak.getmail(username)
    cl(xx.verification_id)
    console.log(code)
    let zz = await postRtnJson('https://user.mypikpak.com/v1/auth/verification/verify', {
        "verification_id": xx.verification_id,
        "verification_code": code,
        "client_id": "YUMx5nI8ZU8Ap8pm"
    }, {
        "content-type": "application/json",
        "x-device-id": pk.device_id,
        "x-client-id": "YUMx5nI8ZU8Ap8pm"
    })
    cl(zz)
    zz.verification_token
    let signup = await postRtnJson('https://user.mypikpak.com/v1/auth/signup', {
        "email": email,
        "verification_code": code,
        "verification_token": zz.verification_token,
        "password": "3w112233",
        "client_id": "YUMx5nI8ZU8Ap8pm"
    }, {
        "content-type": "application/json",
        "x-device-id": pk.device_id,
        "x-client-id": "YUMx5nI8ZU8Ap8pm"
    })
    cl(signup)
    cl(pikpak.cookie(pk, captcha_token))
}
/**
 * @description: 登入pikpak
 * @param {string} username 邮箱📪
 * @param {string} password 密码
 */
pikpak.login = async (pk: any, username: string, password: string) => {
    let captcha_token = await pikpak.init(pk, username, "POST:/v1/auth/signin")
    let token = await postRtnJson('https://user.mypikpak.com/v1/auth/signin', {
        "username": username,
        "password": password,
        "client_id": pk.client_id
    }, { "x-captcha-token": captcha_token })
    cl(token)
    pk.captcha_token = captcha_token
    pk.access_token = token.token_type + ' ' + token.access_token
    pk.refresh_token = token.refresh_token
    pk.username = username
    pk.password = password
    pk.user_id = (await pikpak.me(pk)).sub
    await set(ref(db, 'jsave/bt/users/' + pk.username.replaceAll('@', '-email-').replaceAll('.', '-dot-')), pk)
    await set(ref(db, 'jsave/bt/users/current'), pk)
    return pk
}

/**
 * @description: 刷新登入验证
 */
pikpak.refresh = async (pk: any) => {
    let token = await postRtnJson("https://user.mypikpak.com/v1/auth/token", {
        "client_id": pk.client_id,
        "grant_type": "refresh_token",
        "refresh_token": pk.refresh_token
    })
    if (!token.refresh_token) {
        pk = await pikpak.login(pk, pk.username, pk.password)
        token = await postRtnJson("https://user.mypikpak.com/v1/auth/token", {
            "client_id": pk.client_id,
            "grant_type": "refresh_token",
            "refresh_token": pk.refresh_token
        })
    }
    pk.access_token = token.token_type + ' ' + token.access_token
    pk.refresh_token = token.refresh_token
    await set(ref(db, 'jsave/bt/users/' + pk.username.replaceAll('@', '-email-').replaceAll('.', '-dot-')), pk)
    await set(ref(db, 'jsave/bt/users/current'), pk)
    return pk
}

export { pikpak }