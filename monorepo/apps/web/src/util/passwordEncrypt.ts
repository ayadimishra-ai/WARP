import crypto from 'crypto';

export function passwordEncrypt(clearText: string): string {
    try {
        const encryptionKey = "MAKV2SPBNI99212";
        const salt = Buffer.from([0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76]);
        const clearBytes = Buffer.from(clearText, 'utf16le'); // Equivalent to Encoding.Unicode

        // Generate key and IV using PBKDF2 (equivalent to Rfc2898DeriveBytes)
        const keyAndIv = crypto.pbkdf2Sync(encryptionKey, salt, 1000, 48, 'sha1');
        const key = keyAndIv.slice(0, 32);
        const iv = keyAndIv.slice(32, 48);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(clearBytes);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return encrypted.toString('base64')
    } catch (ex) {
        console.error('Encryption error:', ex);
        return "";
    }
}