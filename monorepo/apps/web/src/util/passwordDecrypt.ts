import crypto from 'crypto';

export function passwordDecrypt(encryptedText: string): string {
    try {
        const encryptionKey = "MAKV2SPBNI99212";
        const salt = Buffer.from([0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76]);

        if (!encryptedText) return "";

        const encryptedBytes = Buffer.from(encryptedText, 'base64');

        // Generate key and IV using PBKDF2 (must match encryption parameters)
        const keyAndIv = crypto.pbkdf2Sync(encryptionKey, salt, 1000, 48, 'sha1');
        const key = keyAndIv.slice(0, 32);
        const iv = keyAndIv.slice(32, 48);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedBytes);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf16le');
    } catch (ex) {
        console.error('Decryption error:', ex);
        return "";
    }
}
