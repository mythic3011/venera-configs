import { fixtureFormat as fmt } from "support/testing/index.js";

class BadTestingImportFixture extends ComicSource {
  constructor() {
    super();
    this.sample = fmt("bad");
  }
}
