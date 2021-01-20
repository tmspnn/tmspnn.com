local error_messages = {
    ["email.invalid"] = "请输入合法的邮箱地址.",
    ["email.not.registered"] = "此邮箱还未注册.",
    ["email.already.exists"] = "此邮箱注册过账户, 请勿重复注册.",
    ["vcode.invalid"] = "请输入4位数字验证码.",
    ["vcode.not.match"] = "验证码错误.",
    ["vcode.not.available"] = "验证码有效时间为10分钟, 请勿重复发送.",
    ["password.invalid"] = "请输入至少6位的密码.",
    ["password.not.match"] = "密码与账号不匹配.",
    ["password.reset.not.available"] = "重置密码邮件有效时间为一天, 请勿重复发送."
}

return error_messages
