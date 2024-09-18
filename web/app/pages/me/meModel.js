const data = JSON.parse($("#_data").textContent);

export default class MeModel {
    user = data.user;
    followings = data.followings;
    followers = data.followers;
    events = data.events;
    policy = data.oss_policy;
    signature = data.oss_signature;

    setUserProps = (props) => {
        _.assign(this.user, props);
    };

    addEvents = (args) => {
        this.events.push(...args.events);
    };
}
