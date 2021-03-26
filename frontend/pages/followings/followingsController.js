import meModel from "./meModel";

class FollowingsController extends Controller {
    blocked = false;

    constructor() {
        super("followings");
    }

    toast = (texts) => {
        this.ui("toast::show", { texts });
    };
}

export default new FollowingsController();
