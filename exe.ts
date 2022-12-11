// deno-lint-ignore-file
// deno compile --unstable exe.ts

console.log('可执行文件！')

const unFormatFileSize = (size:string)=>{
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB']
    let xx:any= {}
    sufixes.map((x,index)=>xx[x]=Math.pow(1024,index))
    console.log(xx[size.split(' ').find(x=>sufixes.includes(x)) as any])
    return Number.parseFloat(size)*xx[size.split(' ').find(x=>sufixes.includes(x)) as any]
}
const formatFileSize = function (bytes: number) {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
}
console.log(formatFileSize(unFormatFileSize('1.57 MB')+unFormatFileSize('5 MB')))