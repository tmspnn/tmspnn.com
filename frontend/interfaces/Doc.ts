export default interface Doc {
  documentElement: HTMLHtmlElement;
  loaded: boolean;
  scriptsInHead?: Array<HTMLScriptElement> | NodeListOf<HTMLScriptElement>;
  scriptsInBody?: Array<HTMLScriptElement> | NodeListOf<HTMLScriptElement>;
}
