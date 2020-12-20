import { controller } from "../components/mvc";
const accessKey = "ZKDTV75UYIPGRVHLMJAG";

export default function uploadToOSS(args: {
  key: string;
  file: File;
  policy: string;
  signature: string;
  cb: (res: string | Document | ArrayBuffer | Blob) => void;
  onError?: (err: Error) => void;
  final?: (x: XMLHttpRequest) => void;
}) {
  const fd = new FormData();
  fd.append("policy", args.policy);
  fd.append("signature", args.signature);
  fd.append("key", args.key);
  fd.append("AccessKeyId", accessKey);
  fd.append("x-obs-acl", "public-read");
  fd.append("Content-Type", args.file.type);
  fd.append("file", args.file, args.file.name);

  controller.render("postFormData", {
    url: "https://tmspnn.obs.cn-east-2.myhuaweicloud.com",
    data: fd,
    cb: args.cb,
    onError: args.onError,
    final: args.final
  });
}
