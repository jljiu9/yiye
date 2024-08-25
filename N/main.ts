// deno-lint-ignore-file
import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import { v4 as uuid4 } from 'https://esm.sh/uuid@9.0.0';

// Notion API 客户端初始化
const notion = new Client({
  auth: 'secret_t27pXy8SLiNVjPfsAdYd2iOKVEHX6Na1Een21GfHxQ3',
});

// Notion 数据库 ID
const FILES_DATABASE_ID = '20c60c7fcdf1423585453d8adc23a4f4';
const FOLDERS_DATABASE_ID = '07de50143ce941baaeb83f7fb2489792';

// 辅助函数
const cl = (x: any): any => {
    console.log(x);
    return x;
}

const getRtnRedirect = async (url: RequestInfo, header?: any): Promise<string> => {
    const res = await fetch(url, {
        method: 'get',
        headers: header
    });
    return res.url;
}

const setObjOfUrlSearchParams = (obj: { [x: string]: any }, url: URL) => {
    Object.entries(obj).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
}

const tempUrl = async (url: string, name: string): Promise<string> => {
    const xx = new URL('https://www.notion.so/signed/' + encodeURIComponent(url));
    setObjOfUrlSearchParams({
        table: 'block',
        name,
        id: notionInfo.id,
        download: false,
        spaceId: notionInfo.spaceId,
        userId: notionInfo.userId,
        cache: 'v2'
    }, xx);
    return await getRtnRedirect(xx.href, {
        "cookie": notionInfo.cookie
    });
}


const formatFileSize = (bytes: number): string => {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
}

const unFormatFileSize = (size: string): number => {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const xx: { [key: string]: number } = Object.fromEntries(sufixes.map((x, index) => [x, Math.pow(1024, index)]));
    const [value, unit] = size.split(' ');
    return Number.parseFloat(value) * xx[unit];
}

const getFolderSize = async (folderId: string): Promise<{ size: string; number: number } | undefined> => {
    try {
        const response = await notion.databases.query({
            database_id: FILES_DATABASE_ID,
            filter: {
                property: 'Parent Folder',
                relation: {
                    contains: folderId,
                },
            },
        });

        let totalSize = 0;
        let fileCount = response.results.length;

        for (const page of response.results) {
            const size = page.properties.Size.number;
            if (size) {
                totalSize += size;
            }
        }

        return {
            size: formatFileSize(totalSize),
            number: fileCount,
        };
    } catch (error) {
        console.error("Error in getFolderSize:", error);
        return undefined;
    }
}

// 上传函数
const upload = async (file: { name: string; type: string; size: number; content: Uint8Array }, parentFolderId: string): Promise<string> => {
    try {
        const response = await notion.pages.create({
            parent: { database_id: FILES_DATABASE_ID },
            properties: {
                Name: { title: [{ text: { content: file.name } }] },
                Type: { select: { name: file.type } },
                Size: { number: file.size },
                'Parent Folder': { relation: [{ id: parentFolderId }] },
            },
            files: [
                {
                    name: file.name,
                    type: file.type,
                    file: { content: file.content },
                },
            ],
        });

        return response.id;
    } catch (error) {
        console.error("Error in upload:", error);
        throw error;
    }
}

// 创建文件夹
const createFolder = async (name: string, parentFolderId?: string): Promise<string> => {
    try {
        const properties: any = {
            Name: { title: [{ text: { content: name } }] },
        };

        if (parentFolderId) {
            properties['Parent Folder'] = { relation: [{ id: parentFolderId }] };
        }

        const response = await notion.pages.create({
            parent: { database_id: FOLDERS_DATABASE_ID },
            properties: properties,
        });

        return response.id;
    } catch (error) {
        console.error("Error in createFolder:", error);
        throw error;
    }
}

// 获取文件夹内容
const getFolderContents = async (folderId: string) => {
    try {
        const files = await notion.databases.query({
            database_id: FILES_DATABASE_ID,
            filter: {
                property: 'Parent Folder',
                relation: {
                    contains: folderId,
                },
            },
        });

        const folders = await notion.databases.query({
            database_id: FOLDERS_DATABASE_ID,
            filter: {
                property: 'Parent Folder',
                relation: {
                    contains: folderId,
                },
            },
        });

        return {
            files: files.results,
            folders: folders.results,
        };
    } catch (error) {
        console.error("Error in getFolderContents:", error);
        throw error;
    }
}

/**
 * 读取或修改Notion中的block
 * @param blockId 要操作的block的ID
 * @param operation 'read' 或 'update'
 * @param updateData 如果是update操作,需要提供要更新的数据
 * @returns 返回block的数据或更新后的结果
 */
async function operateOnBlock(blockId: string, operation: 'read' | 'update', updateData?: any) {
    try {
        if (operation === 'read') {
            const response = await notion.blocks.retrieve({ block_id: blockId });
            return response;
        } else if (operation === 'update') {
            if (!updateData) {
                throw new Error("Update data is required for update operation");
            }
            const response = await notion.blocks.update({
                block_id: blockId,
                ...updateData
            });
            return response;
        } else {
            throw new Error("Invalid operation. Use 'read' or 'update'.");
        }
    } catch (error) {
        console.error(`Error in operateOnBlock: ${error.message}`);
        throw error;
    }
}

// 示例: 读取特定类型的block内容
async function readBlockContent(blockId: string, blockType: string) {
    const block = await operateOnBlock(blockId, 'read');
    if (block[blockType] && block[blockType].rich_text) {
        return block[blockType].rich_text.map((text: any) => text.plain_text).join('');
    }
    return null;
}

// 示例: 更新特定类型的block内容
async function updateBlockContent(blockId: string, blockType: string, newContent: string) {
    const updateData = {
        [blockType]: {
            rich_text: [{ text: { content: newContent } }]
        }
    };
    return await operateOnBlock(blockId, 'update', updateData);
}

// //读取一个段落的内容
// let paragraphContent = ''
// paragraphContent = await readBlockContent('9f731679e4094a3e9ed58774c6438bc3', 'paragraph');
// console.log('之前：'+paragraphContent);

// // 更新一个段落block的内容
// await updateBlockContent('9f731679e4094a3e9ed58774c6438bc3', 'paragraph', 'This is the new content');

// //读取一个段落的内容
// paragraphContent = await readBlockContent('9f731679e4094a3e9ed58774c6438bc3', 'paragraph');
// console.log('之后：'+paragraphContent);

// // 直接使用operateOnBlock进行更复杂的操作
// const blockData = await operateOnBlock('9f731679e4094a3e9ed58774c6438bc3', 'read');
// console.log(blockData);

// await operateOnBlock('9f731679e4094a3e9ed58774c6438bc3', 'update', {
//     paragraph: {
//         rich_text: [{ text: { content: "Updated content" } }],
//         color: "blue_background"
//     }
// });


/**
 * 在指定的页面或block下创建新的block
 * @param parentId 父页面或父block的ID
 * @param blockContent 要创建的block内容
 * @returns 返回创建的block数据
 */
async function createBlock(parentId: string, blockContent: any) {
    try {
        const response = await notion.blocks.children.append({
            block_id: parentId,
            children: [blockContent]
        });
        return response.results[0];
    } catch (error) {
        console.error(`Error in createBlock: ${error.message}`);
        throw error;
    }
}

// 示例: 创建一个段落block
async function createParagraphBlock(parentId: string, content: string) {
    const blockContent = {
        object: 'block',
        type: 'paragraph',
        paragraph: {
            rich_text: [{ type: 'text', text: { content: content } }]
        }
    };
    return await createBlock(parentId, blockContent);
}

// 示例: 创建一个待办事项block
async function createToDoBlock(parentId: string, content: string, checked: boolean = false) {
    const blockContent = {
        object: 'block',
        type: 'to_do',
        to_do: {
            rich_text: [{ type: 'text', text: { content: content } }],
            checked: checked
        }
    };
    return await createBlock(parentId, blockContent);
}

// 创建一个段落block
const newParagraph = await createParagraphBlock('page_id_here', 'This is a new paragraph.');
console.log(newParagraph);

// 创建一个待办事项block
const newToDo = await createToDoBlock('page_id_here', 'New task to do', false);
console.log(newToDo);

// 直接使用createBlock创建其他类型的block
const newHeading = await createBlock('page_id_here', {
    object: 'block',
    type: 'heading_2',
    heading_2: {
        rich_text: [{ type: 'text', text: { content: 'New Heading' } }]
    }
});
console.log(newHeading);

export { 
    notion,
    cl, 
    mime, 
    uuid4, 
    formatFileSize, 
    unFormatFileSize, 
    getFolderSize, 
    upload, 
    tempUrl,
    createFolder,
    getFolderContents,
    operateOnBlock,
    readBlockContent,
    updateBlockContent,
    createBlock,
    createParagraphBlock,
    createToDoBlock,
};