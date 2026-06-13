/**
 * 常用工具函数
 */

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟毫秒数
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} delay - 延迟毫秒数
 * @returns {Function}
 */
export function throttle(fn, delay = 300) {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= delay) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

/**
 * 深拷贝
 * @param {*} obj - 要拷贝的对象
 * @returns {*}
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * 生成唯一ID
 * @returns {string}
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 格式化数字（千分位）
 * @param {number} num - 数字
 * @returns {string}
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 随机获取数组元素
 * @param {Array} arr - 数组
 * @returns {*}
 */
export function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 延迟执行
 * @param {number} ms - 毫秒数
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 检查对象是否为空
 * @param {*} obj - 对象
 * @returns {boolean}
 */
export function isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
}

/**
 * 范围随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number}
 */
export function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}