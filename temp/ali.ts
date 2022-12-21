import { cl, postRtnJson } from "../init.ts";

let authorization = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZTkzYjQyMDllNWU0MjNhODBhMTk1NWEzYzY5OWVkZiIsImN1c3RvbUpzb24iOiJ7XCJjbGllbnRJZFwiOlwiMjVkelgzdmJZcWt0Vnh5WFwiLFwiZG9tYWluSWRcIjpcImJqMjlcIixcInNjb3BlXCI6W1wiRFJJVkUuQUxMXCIsXCJTSEFSRS5BTExcIixcIkZJTEUuQUxMXCIsXCJVU0VSLkFMTFwiLFwiVklFVy5BTExcIixcIlNUT1JBR0UuQUxMXCIsXCJTVE9SQUdFRklMRS5MSVNUXCIsXCJCQVRDSFwiLFwiT0FVVEguQUxMXCIsXCJJTUFHRS5BTExcIixcIklOVklURS5BTExcIixcIkFDQ09VTlQuQUxMXCIsXCJTWU5DTUFQUElORy5MSVNUXCIsXCJTWU5DTUFQUElORy5ERUxFVEVcIl0sXCJyb2xlXCI6XCJ1c2VyXCIsXCJyZWZcIjpcImh0dHBzOi8vd3d3LmFsaXl1bmRyaXZlLmNvbS9cIixcImRldmljZV9pZFwiOlwiYzUwNjdjMTk5YmU0NDhjODg4NDhhNjA2NzI0MDg5YmNcIn0iLCJleHAiOjE2NzEzNDU0NzEsImlhdCI6MTY3MTMzODIxMX0.rknSPL96dKWNRCtVta6dQQgi27c3VTVpZ2zztQdxYgIPSWrdVRfSC8mFS8cbbhfvOqo4KJ7jCSDeYFdNykBNjtc6yIYJuFTRpcZQUYZiFG3GKp44J_5PB_WKcDMycmyzMR9ecSlTb0P4IvCFbmfGORqDf6YxsoiKbRtHOTLkaFs"
const ali = () => { }
ali.download = async () => {
    let upload = await postRtnJson("https://api.aliyundrive.com/adrive/v2/file/createWithFolders", {
        "drive_id": "420222",
        "parent_file_id": "62ff5929f8ae3f22082d4f4d8f77485dc051eaf0",
        "name": "一叶 _ 枫 - Google Chrome 2022-12-14 14-20-09.mp4",
        "type": "file",
        "check_name_mode": "auto_rename",
        "size": 46380654,
        "content_hash": "DE09440CB8784A5C6D11113EFA1626C7E5341D23",
        "content_hash_name": "sha1",
        "proof_code": "kT/myjZXcCI=",
        "proof_version": "v1"
    }, {
        authorization: authorization
    })
    cl(upload.message)
    let res = await postRtnJson("https://api.aliyundrive.com/v2/file/get_download_url", {
        drive_id: upload.drive_id,
        file_id: upload.file_id
    }, {
        authorization: authorization
    })
    let download = await fetch(res.url, { headers: { "Referer": "https://www.aliyundrive.com/" } })
    cl(download.headers)
}
ali.download()