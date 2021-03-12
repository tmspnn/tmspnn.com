import PageContainer from "@components/PageContainer/PageContainer";

class FollowingsView extends View {
  _name = "followings";

  pageContainer = new PageContainer("me");
}

export default new FollowingsView();
