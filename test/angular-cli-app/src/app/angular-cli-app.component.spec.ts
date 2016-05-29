import {
  beforeEachProviders,
  describe,
  expect,
  it,
  inject
} from '@angular/core/testing';
import { AngularCliAppAppComponent } from '../app/angular-cli-app.component';

beforeEachProviders(() => [AngularCliAppAppComponent]);

describe('App: AngularCliApp', () => {
  it('should create the app',
      inject([AngularCliAppAppComponent], (app: AngularCliAppAppComponent) => {
    expect(app).toBeTruthy();
  }));

  it('should have as title \'angular-cli-app works!\'',
      inject([AngularCliAppAppComponent], (app: AngularCliAppAppComponent) => {
    expect(app.title).toEqual('angular-cli-app works!');
  }));
});
