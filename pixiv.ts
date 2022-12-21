import { cl, getRtnJson } from "./init.ts";

const pixiv = ()=>{

}
let cookie = ''
pixiv.getAll =async (user:string)=>{
    let list = await getRtnJson(`https://www.pixiv.net/ajax/user/${user}/profile/all?lang=zh`,{
        cookie:''
    })
    cl(list.body.illusts)
    Deno.writeTextFileSync('xx.json',JSON.stringify(list.body))
}

pixiv.getAll('3323411')
