import { fixtureFormat as fmt } from "support/testing/index.js";

class SupportImportFixture extends ComicSource {
  constructor() {
    super();
    this.name = "Support Import Fixture";
    this.key = "support_import_fixture";
    this.version = "1.0.0";
    this.minAppVersion = "1.0.0";
    this.url = "https://example.invalid/support_import_fixture.js";
    this.sample = fmt("ok");
  }
}
