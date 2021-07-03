import { Base64 } from "js-base64";
import kxhr from "k-xhr";

/**
 * @param {File} file
 * @param {Number} options.convId
 * @param {String} options.accessKey
 * @param {String} options.ossEntry
 * @param {String} options.ossPolicy
 * @param {String} options.ossSignature
 * @returns Promise<string>
 */
export default function uploadConversationFile(file, options) {
    const convId = options.convId;
    const fileNameBase64 = Base64.encode(file.name);
    const key = `private/conversations/${convId}/${fileNameBase64}`;

    const fd = new FormData();
    fd.append("AccessKeyId", options.accessKey || "Q5VTYEW1FGZCSAQYEPAX");
    fd.append("policy", options.ossPolicy);
    fd.append("signature", options.ossSignature);
    fd.append("key", key);
    fd.append("x-obs-acl", "private");
    fd.append("Content-Type", file.type);
    fd.append("Cache-Control", "max-age=2592000");
    fd.append("file", file, file.name);

    return kxhr(
        options.ossEntry || "https://tmspnn.obs.cn-east-2.myhuaweicloud.com",
        "post",
        fd
    ).then(() => key);
}
