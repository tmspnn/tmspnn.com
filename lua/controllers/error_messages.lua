local error_messages = {
    ["default"] = {status = 500, message = "服务器繁忙, 请稍后再试."},
    ["mobile.invalid"] = {
        status = 400,
        message = "请输入合法的手机号."
    },
    ["mobile.not.registered"] = {
        status = 401,
        message = "此手机号还未注册."
    },
    ["mobile.already.exists"] = {
        status = 403,
        message = "此手机号注册过账户, 请勿重复注册."
    },
    ["email.invalid"] = {
        status = 400,
        message = "请输入合法的邮箱地址."
    },
    ["email.not.registered"] = {
        status = 401,
        message = "此邮箱还未注册."
    },
    ["email.already.exists"] = {
        status = 403,
        message = "此邮箱注册过账户, 请勿重复注册."
    },
    ["not.authorized"] = {status = 401, message = "请先登录."},
    ["forbidden"] = {status = 403, message = "无权执行这项操作."},
    ["password.invalid"] = {
        status = 400,
        message = "请输入至少6位的密码."
    },
    ["password.not.match"] = {
        status = 400,
        message = "密码与账号不匹配."
    },
    ["password.reset.not.available"] = {
        status = 403,
        message = "重置密码邮件有效时间为一天, 请勿重复发送."
    },
    ["vcode.invalid"] = {
        status = 400,
        message = "请输入4位数字验证码."
    },
    ["vcode.not.match"] = {status = 400, message = "验证码错误."},
    ["vcode.not.available"] = {
        status = 403,
        message = "验证码有效时间为10分钟, 请勿重复发送."
    },
    ["title.length"] = {
        status = 400,
        message = "文章长度需在128字以内."
    },
    ["keyword.length"] = {
        status = 400,
        message = "关键字长度需在64字以内."
    },
    ["content.length"] = {
        status = 400,
        message = "内容长度需在100至50000字内."
    },
    ["article.not.exists"] = {status = 400, message = "此文档不存在."},
    ["stars_count.invalid"] = {
        status = 400,
        message = "请给出1至5星的评价."
    },
    ["duplicate.rating"] = {status = 403, message = "请勿重复评价."},
    ["empty.content"] = {status = 400, message = "内容不能为空."},
    ["comment.too.long"] = {
        status = 400,
        message = "评论最长不超过5000字节."
    },
    ["comment.not.exists"] = {status = 400, message = "评论不存在."},
    ["fame.too.low"] = {
        status = 403,
        message = "您的声望太低, 无法执行此操作"
    },
    ["unknown.attitude"] = {status = 400, message = "不支持此种操作."},
    ["duplicated.advocation"] = {status = 403, message = "不可重复点赞."},
    ["user.not.exists"] = {status = 400, message = "用户不存在."},
    ["title.required"] = {status = 400, message = "请输入标题."},
    ["wordcount.too.small"] = {
        status = 400,
        message = "请输入50字以上的内容."
    },
    ["wordcount.too.large"] = {
        status = 400,
        message = "请输入一万字以内的内容."
    },
    ["rating.invalid"] = {status = 400, message = "请输入1-5星的评价."},
    ["conversation.not.exists"] = {status = 404, message = "对话不存在."},
    ["conversation.unavailable"] = {
        status = 403,
        message = "对方未关注你, 无法发起对话."
    }
}

return error_messages
