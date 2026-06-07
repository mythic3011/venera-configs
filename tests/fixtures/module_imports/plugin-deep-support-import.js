import { runtimeGet as get } from "support/http/request-client.js";

class BadDeepSupportImportFixture extends ComicSource {
  constructor() {
    super();
    this.sample = typeof get;
  }
}
