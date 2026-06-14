/**
 * CipherEncoder.js - 密码编码器
 * V1078 P-20260614-405 Round 41 Iter 11/30
 */
export const CIPHER_TYPES = ['caesar', 'substitution', 'transposition', 'qi_seal', 'lotus_script'];

export class CipherEncoder {
    constructor(config = {}) {
        this.config = { ...config };
        this.ciphers = new Map();   // cipherId -> { id, name, type, key, encoded }
        this.hooks = new Map();
        this.stats = { total: 0, totalEncoded: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cph_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, type = 'caesar', key = 3) {
        if (!name) return null;
        if (!CIPHER_TYPES.includes(type)) type = 'caesar';
        const id = this._newId();
        const c = { id, name, type, key, encoded: 0 };
        this.ciphers.set(id, c);
        this.stats.total++;
        return c;
    }
    get(id) { return this.ciphers.get(id) || null; }
    listAll() { return [...this.ciphers.values()]; }
    listByType(type) { return this.listAll().filter(c => c.type === type); }

    encode(cipherId, message) {
        const c = this.ciphers.get(cipherId);
        if (!c) return null;
        if (typeof message !== 'string') return null;
        c.encoded++;
        this.stats.totalEncoded++;
        return this._apply(message, c);
    }
    decode(cipherId, encoded) {
        const c = this.ciphers.get(cipherId);
        if (!c) return null;
        if (typeof encoded !== 'string') return null;
        return this._reverse(encoded, c);
    }
    _apply(message, c) {
        if (c.type === 'caesar') return this._caesar(message, c.key);
        if (c.type === 'substitution') return this._substitution(message, c.key);
        if (c.type === 'transposition') return this._transposition(message, c.key);
        if (c.type === 'qi_seal') return `[qi:${message}]`;
        if (c.type === 'lotus_script') return message.split('').reverse().join('');
        return message;
    }
    _reverse(encoded, c) {
        if (c.type === 'caesar') return this._caesar(encoded, -c.key);
        if (c.type === 'substitution') return this._substitution(encoded, -c.key);
        if (c.type === 'transposition') return this._transposition(encoded, c.key);
        if (c.type === 'qi_seal') return encoded.slice(4, -1);
        if (c.type === 'lotus_script') return encoded.split('').reverse().join('');
        return encoded;
    }
    _caesar(str, shift) {
        return str.split('').map(c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
            if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
            return c;
        }).join('');
    }
    _substitution(str, key) {
        return str.split('').map(c => String.fromCharCode(c.charCodeAt(0) + key)).join('');
    }
    _transposition(str, key) {
        if (key <= 0) return str;
        const result = [];
        for (let i = 0; i < str.length; i += key) {
            result.push(str.slice(i, i + key).split('').reverse().join(''));
        }
        return result.join('');
    }
    setKey(id, key) {
        const c = this.ciphers.get(id);
        if (!c) return false;
        c.key = key;
        return true;
    }
    setType(id, type) {
        const c = this.ciphers.get(id);
        if (!c) return false;
        if (!CIPHER_TYPES.includes(type)) return false;
        c.type = type;
        return true;
    }
    encodedCount(id) { return this.ciphers.get(id)?.encoded || 0; }
    report() { return { total: this.stats.total, totalEncoded: this.stats.totalEncoded }; }
    reset() { this.ciphers.clear(); this.stats = { total: 0, totalEncoded: 0 }; }
}
