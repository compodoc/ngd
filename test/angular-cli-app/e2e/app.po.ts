export class AngularCliAppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('angular-cli-app-app h1')).getText();
  }
}
