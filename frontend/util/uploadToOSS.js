import { postFormData } from "@util/xhr"

const ossEntry = "https://tmspnn.obs.cn-east-2.myhuaweicloud.com"
const accessKey = "ZKDTV75UYIPGRVHLMJAG"

export default function uploadToOSS(args) {
  const { policy, signature, key, file, onProgress, cb, fail, final } = args
  const fd = new FormData()

  fd.append("policy", policy)
  fd.append("signature", signature)
  fd.append("key", key)
  fd.append("AccessKeyId", accessKey)
  fd.append("x-obs-acl", "public-read")
  fd.append("Content-Type", file.type)
  fd.append("file", file, file.name)

  postFormData({
    url: ossEntry,
    data: fd,
    onProgress,
    cb,
    fail,
    final
  })
}