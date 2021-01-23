const data = JSON.parse($("#_data").textContent)

export default class MeModel extends Model {
  user = data.user
  followings = data.followings
  followers = data.followers
  events = data.events

  constructor() {
    super("me")
  }

  addEvents = (args) => {
    this.events.push(...args.events)
  }
}
