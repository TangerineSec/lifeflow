import { nanoid } from 'nanoid';

/**
 * 生成全局唯一 ID
 * 用于 flow / node / checklist item
 */
export const genId = () => nanoid(10);
