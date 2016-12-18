import { AngularCliAppPage } from './app.po';

describe('angular-cli-app App', function() {
  let page: AngularCliAppPage;

  beforeEach(() => {
    page = new AngularCliAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
