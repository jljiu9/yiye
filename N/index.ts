// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.155.0/http/server.ts";
import { 
    notion, 
    cl, 
    mime, 
    uuid4, 
    formatFileSize, 
    unFormatFileSize, 
    getFolderSize, 
    upload, 
    createFolder,
    getFolderContents,
} from "./main.ts";

serve(async (req: Request) => {
    const { pathname, searchParams } = new URL(req.url);

    if (req.method === 'POST') {
        const data = await req.json();

        if (pathname === '/api/upload') {
            try {
                const fileId = await upload(data.file, data.parentFolderId);
                return new Response(JSON.stringify({ fileId }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        if (pathname === '/api/createFolder') {
            try {
                const folderId = await createFolder(data.name, data.parentFolderId);
                return new Response(JSON.stringify({ folderId }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // 添加其他POST请求处理...
        if (pathname === '/api/resign' || pathname === '/api/login') {
            // 这里需要实现用户注册和登录逻辑
            // 由于我们现在使用Notion API,可能需要重新设计用户认证系统
            return new Response(JSON.stringify({ message: "功能未实现" }), {
                status: 501,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } else if (req.method === 'GET') {
        if (pathname === '/api/getFolderContents') {
            const folderId = searchParams.get('folderId');
            if (!folderId) {
                return new Response(JSON.stringify({ error: 'Folder ID is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            try {
                const contents = await getFolderContents(folderId);
                return new Response(JSON.stringify(contents), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        if (pathname === '/api/getFolderSize') {
            const folderId = searchParams.get('folderId');
            if (!folderId) {
                return new Response(JSON.stringify({ error: 'Folder ID is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            try {
                const size = await getFolderSize(folderId);
                return new Response(JSON.stringify(size), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // 添加其他GET请求处理...
        if (pathname === '/api/getUserFiles') {
            // 这里需要实现获取用户文件的逻辑
            // 可能需要调整以适应Notion数据库的结构
            return new Response(JSON.stringify({ message: "功能未实现" }), {
                status: 501,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 处理静态文件请求
        if (pathname === "/" || pathname.startsWith('/assets')) {
            try {
                const filePath = pathname === "/" ? "./index.html" : "." + pathname;
                const file = await Deno.readFile(filePath);
                const contentType = mime.getType(filePath) || 'application/octet-stream';
                return new Response(file, {
                    status: 200,
                    headers: { 'Content-Type': contentType },
                });
            } catch (error) {
                return new Response("File not found", { status: 404 });
            }
        }
    }

    return new Response('Not Found', { status: 404 });
}, { port: 3000 });