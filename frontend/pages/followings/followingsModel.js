import { Model } from "@components/MVC"

const data = JSON.parse($("#_data").textContent)

class FollowingsModel extends Model {
  followings = data.followings

  constructor() {
    super("followings")
  }

  addFollowings = (args) => {
    this.followings.push(...args.followings)
  }
}

export default new FollowingsModel()
