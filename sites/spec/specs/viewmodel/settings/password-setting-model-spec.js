import ContainerJS      from "container-js"
import ContainerFactory from "../../../utils/test-container-factory"

describe("PasswordSettingModel", () => {

  var model;
  var xhrManager;

  beforeEach(() => {
    let container = new ContainerFactory().createContainer();
    let d = container.get("viewModelFactory");
    const factory = ContainerJS.utils.Deferred.unpack(d);
    model = factory.createPasswordSettingModel();
    xhrManager = model.userSettingService.xhrManager;
  });

  describe("#save", () => {
    it("パスワードを変更できる", () => {
      model.save( "11111", "11111", "22222" );
      xhrManager.requests[0].resolve({});

      expect(model.error).toEqual(null);
      expect(model.message).toEqual("パスワードを設定しました");
    });
    it("パスワードが一致しない場合、エラーが表示される", () => {
      model.save( "11111", "11112", "22222" );
      expect(model.error).toEqual("新パスワードが一致していません");
      expect(model.message).toEqual(null);
    });
    it("パスワードが不正な場合、エラーが表示される", () => {
      model.save( "aaa", "aaa", "22222" );
      expect(model.error).toEqual("新パスワードが短すぎます");
      expect(model.message).toEqual(null);

      model.save( "", "", "" );
      expect(model.error).toEqual("新パスワードを入力してください");
      expect(model.message).toEqual(null);
    });
    it("旧パスワードが不正な場合、エラーが表示される", () => {
      model.save( "11111", "11111", "22222" );
      xhrManager.requests[0].reject({
        status: 400
      });
      expect(model.error).toEqual(
        "現在のパスワードが一致しません。入力した値をご確認ください");
      expect(model.message).toEqual(null);
    });
    it("通信エラーの場合、エラーが表示される", () => {
      model.save( "11111", "11111", "22222" );
      xhrManager.requests[0].reject({
        status: 500
      });
      expect(model.error).toEqual(
        "サーバーが混雑しています。しばらく待ってからやり直してください");
      expect(model.message).toEqual(null);
    });
  });
});
