import { fixtureFormat as fmt } from "shared/test_helpers/build_pipeline_import_helper.js";

class SharedImportFixture extends ComicSource {
  constructor() {
    super();
    this.name = "Shared Import Fixture";
    this.key = "shared_import_fixture";
    this.version = "1.0.0";
    this.minAppVersion = "1.0.0";
    this.url = "https://example.invalid/shared_import_fixture.js";
    this.sample = fmt("ok");
  }
}
